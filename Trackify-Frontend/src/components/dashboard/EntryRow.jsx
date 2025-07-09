import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dayjs from "dayjs";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import {
  Button,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import {
  markEntryAsBillableNonBillable,
  selectRunningTimer,
  updateEntryTitle,
  selectBillableState
} from "##/src/app/timerSlice.js";
import { formatDuration } from "##/src/utility/timer.js";
import { FONTS, removeHtmlTagsAndSpaces } from "##/src/utility/utility.js";
import { useDispatch, useSelector } from "react-redux";
import ContentEditable from "react-contenteditable";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const DeleteModal = lazy(
  () => import("##/src/components/common/DeleteModal.jsx")
);
const EditEntryModal = lazy(() => import("##/src/modals/EntryModal.jsx"));

const styles = (align) => ({
  cellStyle: {
    fontFamily: FONTS.body,
    fontSize: "16px",
    color: "#868282",
    ...(align && { textAlign: align }),
    ...(align === "left" && { maxWidth: "150px" }),
  },
  iconStyles: {
    height: "30px",
    width: "30px",
  },
});

const EntryRow = memo(function EntryRow({
  entry,
  onPlay,
  onDelete,
  duration,
  dispatchToRedux,
  theme,
  workspace,
  setProgress,
  setNotification,
  handleError,
}) {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [disabledIcon, setDisabledIcon] = useState(false);

  const dispatch = useDispatch();
  // const isBillable = useSelector((state) => state.billable[entry._id] ?? false);
  const isBillableLoading = useSelector(selectBillableState);
  const { isRunning } = useSelector(selectRunningTimer);
  const text = useRef("");

  const startTime = dayjs(entry.startTime);
  const endTime = dayjs(entry.endTime);
  const color = theme?.secondaryColor;

  const BillableIcon = styled(AttachMoneyIcon, {
    shouldForwardProp: (prop) => prop !== "active",
  })(({ active, theme }) => ({
    color: active ? color : "#9e9e9e",

    transition: "transform 0.3s ease, color 0.3s ease",
  }));

  const handleBlurEdit = useCallback(async () => {
    if (!text.current) return;

    try {
      const updatedEntry = { ...entry, title: text.current };

      await dispatchToRedux(updateEntryTitle({ entry: updatedEntry }));
      setNotification("Title updated successfully", "success");
    } catch (error) {
      handleError(`Failed to update the title: ${error.message}`);
    }
  }, [entry, dispatchToRedux]);

  const handleChange = useCallback(
    (e) => {
      if (!e.target.value) {
        setNotification("Please enter a title to update", "warning");
        return;
      }

      const sanitizedText = removeHtmlTagsAndSpaces(e.target.value);
      text.current = sanitizedText;
      setTitle(sanitizedText);
    },
    [entry._id, dispatchToRedux]
  );

  const toggleEditModal = () => {
    if (workspace?.isEditable || openEditModal) {
      setOpenEditModal((prev) => !prev);
    }
  };

  const toggleDeleteModal = () => setOpenDeleteModal((prev) => !prev);

  async function handleDelete() {
    await onDelete(entry._id);
    toggleDeleteModal();
  }

  async function handlePlay() {
    // If timer is already running then do nothing
    if (isRunning) return;

    setDisabledIcon(true);
    await onPlay({ projectId: entry.project._id, title: entry.title });
  }

  useEffect(() => {
    setDisabledIcon(isRunning);
    return () => setDisabledIcon(false);
  }, [isRunning]);

  const handleBillable = useCallback(async () => {
    if (entry._id === undefined || entry._id === null) {
      console.error("Entry ID is undefined or null");
      setNotification("Invalid entry ID", "error");
      return;
    }
    try {
      await dispatch(
        markEntryAsBillableNonBillable({
          entryId: entry._id,
          isBillable: entry?.isBillable ? false : true,
        })
      ).unwrap();
      setNotification(
        `Entry marked as ${!entry?.isBillable ? "billable" : "non-billable"}`,
        "success"
      );
    } catch (error) {
      handleError(`Failed to toggle billable status: ${error.message}`);
    }
  }, [entry._id, entry?.isBillable]);

  return (
    <>
      <TableRow>
        <TableCell sx={styles("left").cellStyle}>
          <ContentEditable
            html={title}
            onBlur={handleBlurEdit}
            onChange={handleChange}
          />
        </TableCell>
        <TableCell sx={styles("center").cellStyle}>
          {entry.project.name}
        </TableCell>
        <TableCell sx={styles("center").cellStyle}>
          <Button
            onClick={toggleEditModal}
            sx={{
              textTransform: "none",
              padding: 0,
              minWidth: "auto",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            {formatDuration(duration ?? 0)}
          </Button>
        </TableCell>
        <TableCell sx={{ textAlign: "center" }}>
          {startTime.format("h:mm:ss A")} to {endTime.format("h:mm:ss A")}
        </TableCell>

        {/* this is for the billabel and non billable  */}
        <TableCell sx={styles("start").cellStyle}>
          <Tooltip
            title={
              entry?.isBillable ? "Mark as Non-Billable" : "Mark as Billable"
            }
          >
            <Box
              onClick={isBillableLoading ? null : handleBillable}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                padding: "6px",
                cursor: isBillableLoading ? "not-allowed" : "pointer",
                opacity: isBillableLoading ? 0.5 : 1,
                pointerEvents: isBillableLoading ? "none" : "auto",

                // backgroundColor: entry?.isBillable
                //   ? `${theme?.secondaryColor}40`
                //   : "transparent",
                // transition: "background-color 0.3s ease",
                // "&:hover": {
                //   backgroundColor: entry?.isBillable
                //     ? `${theme?.secondaryColor}90`
                //     : "rgba(158, 158, 158, 0.1)",
                // },
              }}
            >
              <BillableIcon active={entry?.isBillable} />
            </Box>
          </Tooltip>
        </TableCell>

        <TableCell sx={styles("center").cellStyle}>
          <IconButton
            aria-label="resume-entry"
            disabled={disabledIcon}
            onClick={handlePlay}
            title="Resume Entry"
          >
            <PlayArrowOutlinedIcon sx={styles().iconStyles} />
          </IconButton>
          <IconButton
            aria-label="delete-entry"
            onClick={toggleDeleteModal}
            title="Delete Entry"
          >
            <CloseOutlinedIcon sx={styles().iconStyles} />
          </IconButton>
        </TableCell>
      </TableRow>
      {workspace?.isEditable && openEditModal && (
        <Suspense fallback={null}>
          <EditEntryModal
            entry={entry}
            handleClose={toggleEditModal}
            open={openEditModal}
            setProgress={setProgress}
            task={entry.title}
            theme={theme}
          />
        </Suspense>
      )}
      {openDeleteModal && (
        <Suspense fallback={null}>
          <DeleteModal
            onClose={toggleDeleteModal}
            onDelete={handleDelete}
            open={openDeleteModal}
            text={
              "Entry will be removed permanently, Are you sure you want to delete this entry?"
            }
            theme={theme}
            title={"Delete Entry"}
          />
        </Suspense>
      )}
    </>
  );
});

export default EntryRow;
