import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentWorkspace } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import {
  deleteEntry,
  getMoreEntries,
  markEntryAsBulkIsBillableNonBillable,
  selectEntries,
  selectEntryDay,
  selectLastEntry,
  setEntryDay,
  startTimer,
  selectBulkBillableState,
} from "##/src/app/timerSlice.js";

import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

import BackdropLoader from "##/src/components/loading/BakdropLoader.jsx";
import { formatDate, formatDuration } from "##/src/utility/timer.js";
import { validateDateAndWorkspace } from "##/src/utility/validation/validations.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import EntryRow from "##/src/components/dashboard/EntryRow.jsx";
import { makeSelectWorkspace } from "##/src/app/workspaceSlice.js";
import BirthdayNotificationModal from "##/src/modals/BirthdayNotificationModal.jsx";
import BirthdayAlert from "../modals/UserBirthdayNotification";
import { format } from "date-fns";

// Lazy components
const Theme = lazy(() => import("##/src/components/theme/Theme.jsx"));

const DashBoard = memo(({ setProgress }) => {
  const [entries, setEntries] = useState([]);
  const [duration, setDuration] = useState(0);
  const [entriesLoader, setEntriesLoader] = useState(false);

  const currentWorkspaceId = useSelector(selectCurrentWorkspace);
  const isBulkLoading = useSelector(selectBulkBillableState);

  const theme = useSelector(selectCurrentTheme);
  const entryData = useSelector(selectEntries);
  const lastEntry = useSelector(selectLastEntry);
  const day = useSelector(selectEntryDay);
  const dispatchToRedux = useDispatch();

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const selectWorkspace = useMemo(makeSelectWorkspace, []);
  const currentWorkspace = useSelector((state) =>
    selectWorkspace(state, currentWorkspaceId)
  );

  const shouldRenderEmptyRow =
    (entries?.length === 1 && !entries?.[0]?.durationInSeconds) ||
    entries?.length === 0;

  // Fetch entries and calculate total duration
  useEffect(() => {
    if (!entryData?.length && !entries.length) return;

    const filteredEntries = entryData
      ?.filter((entry) =>
        validateDateAndWorkspace({
          workspace: currentWorkspaceId,
          date: formatDate(day),
          entry,
        })
      )
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    const totalDuration = filteredEntries.reduce(
      (sum, entry) => sum + (entry.durationInSeconds || 0),
      0
    );

    setDuration(totalDuration);
    setEntries(filteredEntries);
  }, [day, entryData]);

  // Resume timer for an existing entry
  const resumeTimerEntry = useCallback(
    async ({ projectId, title }) => {
      try {
        await dispatchToRedux(
          startTimer({
            projectId: projectId,
            title: title,
          })
        ).unwrap();
      } catch (error) {
        handleError(`Failed to resume timer: ${error.message}`);
      }
    },
    [dispatchToRedux]
  );

  const deleteTimerEntry = useCallback(
    async (entryId) => {
      try {
        await dispatchToRedux(deleteEntry({ entryId })).unwrap();
        setNotification("Entry Deleted Successfully", "success");
      } catch (error) {
        handleError(`Failed to delete the entry: ${error.message}`);
      }
    },
    [dispatchToRedux]
  );

  const handlePrevious = useCallback(async () => {
    setEntriesLoader(true);
    const entryDate = new Date(formatDate(day));
    entryDate.setHours(0, 0, 0, 0);

    if (
      format(entryDate, "yyyy-MM-dd") ===
      format(new Date(lastEntry), "yyyy-MM-dd")
    ) {
      try {
        await dispatchToRedux(getMoreEntries({ lastEntry })).unwrap();
      } catch (error) {
        handleError(`Failed to retrieve more entries: ${error.message}`);
      }
    }
    dispatchToRedux(setEntryDay({ day: day - 1 }));
    setEntriesLoader(false);
  }, [dispatchToRedux, day, lastEntry]);

  const handleNext = useCallback(() => {
    if (day < 0) {
      dispatchToRedux(setEntryDay({ day: day + 1 }));
    }
  }, [dispatchToRedux, day]);

  const allBillable = useMemo(() => {
    return entries.every((entry) => entry.isBillable);
  }, [entries]);

  const handleBulkBillableToggle = useCallback(async () => {
    if (!currentWorkspaceId) {
      handleError("No workspace selected");
      return;
    }
    try {
      dispatchToRedux(
        markEntryAsBulkIsBillableNonBillable({
          markAsBillable: allBillable ? false : true,
          markAsNonBillable: allBillable ? true : false,
          workspaceId: currentWorkspaceId,
        })
      ).unwrap();
      setNotification(
        `All entries marked as ${allBillable ? "non-billable" : "billable"}`,
        "success"
      );
    } catch (error) {
      handleError(`Failed to toggle billable status: ${error.message}`);
    }
  }, [
    entries,
    currentWorkspace,
    dispatchToRedux,
    setNotification,
    handleError,
  ]);
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Typography
          align="center"
          sx={{
            margin: "1.5rem",
            fontFamily: "sans-serif",
            fontSize: "25px",
            color: "#5A5A5A",
            lineHeight: "37px",
          }}
          variant="h6"
        >
          <IconButton
            aria-label="previous"
            onClick={handlePrevious}
            title="Previous Day"
          >
            <ArrowBackIosIcon />
          </IconButton>
          {formatDate(day)} |{" "}
          <IconButton aria-label="duration" title="Duration">
            <AccessTimeIcon />
          </IconButton>{" "}
          {formatDuration(duration)}
          <IconButton aria-label="next" onClick={handleNext} title="Next Day">
            <ArrowForwardIosIcon />
          </IconButton>
        </Typography>
        {entriesLoader ? (
          <BackdropLoader open={entriesLoader} />
        ) : (
          <>
            <TableContainer>
              <Table aria-label="a dense table" size="small">
                <TableBody>
                  {shouldRenderEmptyRow ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        sx={{ textAlign: "center", backgroundColor: "#eee" }}
                      >
                        <Typography sx={{ py: "30px" }}>
                          No entries found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => {
                      const shouldDisplay =
                        entry.durationInSeconds === 0 ||
                        !!entry.durationInSeconds;
                      return (
                        shouldDisplay && (
                          <EntryRow
                            key={entry._id}
                            day={day}
                            dispatchToRedux={dispatchToRedux}
                            duration={entry.durationInSeconds}
                            entry={entry}
                            onDelete={deleteTimerEntry}
                            onPlay={resumeTimerEntry}
                            setProgress={setProgress}
                            theme={theme}
                            workspace={currentWorkspace}
                            setNotification={setNotification}
                            handleError={handleError}
                          />
                        )
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                px: 4,
                mr: 8,
              }}
            >
              {!shouldRenderEmptyRow && (
                <Button
                  onClick={handleBulkBillableToggle}
                  size="small"
                  disabled={isBulkLoading}
                  sx={{
                    backgroundColor: theme?.secondaryColor,
                    minWidth: "180px",
                    color: theme?.textColor,
                    textTransform: "none",
                    fontWeight: 400,
                    px: 2,
                    py: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                    opacity: isBulkLoading ? 0.6 : 1,
                    cursor: isBulkLoading ? "not-allowed" : "pointer",
                    border: "2px solid transparent",
                    ":hover": {
                      backgroundColor: theme?.secondaryColor
                        ? `${theme.secondaryColor}`
                        : "#f0f0f0",
                      color: theme?.primaryColor || "#1976d2",
                      transform: "scale(1.01)",
                      cursor: "pointer",
                    },
                  }}
                >
                  {isBulkLoading ? (
                    <CircularProgress
                      size={18}
                      sx={{ color: theme?.textColor, mr: 1 }}
                    />
                  ) : allBillable ? (
                    "Mark all Non-Billable"
                  ) : (
                    "Mark all Billable"
                  )}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          backgroundColor: "#fff",
          zIndex: "1000",
        }}
      >
        <Suspense
          fallback={<Skeleton height={50} variant="circular" width={50} />}
        >
          <Theme setProgress={setProgress} />
        </Suspense>
      </Box>

      {currentWorkspace && (
        <BirthdayNotificationModal workspace={currentWorkspace} />
      )}
      {currentWorkspace && <BirthdayAlert workspace={currentWorkspace} />}
    </>
  );
});

export default DashBoard;
