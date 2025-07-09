import AddIcon from "@mui/icons-material/Add";
import { Box, Container, CssBaseline, Fab, Tab, Tabs } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteHoliday,
  getHoliday,
  requestHoliday,
  selectHolidays,
  updateHoliday,
} from "##/src/app/holidaySlice.js";
import { selectCurrentWorkspace, selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { selectUserRole } from "##/src/app/profileSlice.js";
import DeleteModal from "##/src/components/common/DeleteModal.jsx";
import AddHoliday from "##/src/components/holidays/AddHoliday";
import UpdateHoliday from "##/src/components/holidays/UpdateHoliday";
import "./Calendar.css";

import {
  getCalculationRule,
  selectCalculationRules,
} from "../app/calculationSlice.js";
import { getUsersLeave, selectUserLeaveData } from "../app/leaveSlice.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification";
import useErrorHandler from "##/src/hooks/error/useErrorHandler";

const FallBackLoader = lazy(
  () => import("##/src/components/loading/FallBackLoader.jsx")
);
// Lazy loading components
const RenderCalendar = lazy(
  () => import("##/src/components/holidays/RenderCalendar.jsx")
);
const Leave = lazy(() => import("##/src/pages/Leave.jsx"));
const HolidayAdminPanel = lazy(
  () => import("##/src/components/holidays/HolidayAdminPanel.jsx")
);
const LeaveAdminPanel = lazy(
  () => import("##/src/components/holidays/LeaveAdminPanel.jsx")
);
const RenderHolidayTable = lazy(
  () => import("##/src/components/holidays/RenderHolidayTable.jsx")
);
const Calculation = lazy(
  () => import("##/src/components/calculation/Calculation.jsx")
);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const CalendarAndHoliday = ({ setProgress }) => {
  const [value, setValue] = useState(0);
  const [addIsModalOpen, setAddIsModalOpen] = useState(false);
  const [updateIsModalOpen, setUpdateIsModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [holidayDetails, setHolidayDetails] = useState(null);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [componentLoading, setComponentLoading] = useState(false);

  const dispatchToRedux = useDispatch();
  const holidays = useSelector(selectHolidays);
  const user = useSelector(selectMe);
  const workspaceId = useSelector(selectCurrentWorkspace);
  const theme = useSelector(selectCurrentTheme);
  const isAdmin = useSelector(selectUserRole);
  const userLeave = useSelector(selectUserLeaveData);
  const calculationRules = useSelector(selectCalculationRules);

  const filteredUserLeave = userLeave?.filter(
    (leave) => leave.status === "approved"
  );

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (workspaceId) {
      dispatchToRedux(getCalculationRule({ workspaceId: workspaceId }));
    }
  }, [workspaceId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (holidays.length === 0 || userLeave.length === 0) {
          if (user) {
            setProgress(30);
            setComponentLoading(true);
            await Promise.all([
              dispatchToRedux(getHoliday()),
              dispatchToRedux(getUsersLeave({ userId: user._id })),
            ]);

            setComponentLoading(false);
            setProgress(100);
          }
        }
      } catch (error) {
        setComponentLoading(false);
        setProgress(100);
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [dispatchToRedux, user]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleEditClick = (holiday) => {
    setSelectedHoliday(holiday);
    setUpdateIsModalOpen(true);
  };

  const handleUpdateHoliday = async ({
    holidayId,
    title,
    date,
    description,
    type,
  }) => {
    await dispatchToRedux(
      updateHoliday({
        holidayId,
        title,
        date,
        description,
        type,
        workspaceId: user?.currentWorkspace,
        userId: user?._id,
      })
    ).unwrap();
    setUpdateIsModalOpen(false);
    setSelectedHoliday(null);
  };

  const handleAddHoliday = async ({
    title,
    date,
    description,
    type,
    handleClose,
  }) => {
    if (!title) {
      setNotification("Please Add Title", "warning");
    }
    if (!date) {
      setNotification("Please Add Date", "warning");
    }
    if (!type) {
      setNotification("Please Add Type", "warning");
    }
    try {
      setProgress(30);
      await dispatchToRedux(
        requestHoliday({
          title,
          date,
          description,
          type,
          workspaceId: user?.currentWorkspace,
          userId: user?._id,
        })
      ).unwrap();
      setProgress(100);
      handleClose();
      setNotification("Holiday Added Successfully", "success");
    } catch (error) {
      setProgress(100);
      handleError(`Error adding holiday, ${error.message}`);
      handleClose();
    }
  };

  const handleDeleteClick = (holiday) => {
    setHolidayToDelete(holiday);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteHoliday = async () => {
    if (holidayToDelete) {
      await dispatchToRedux(
        deleteHoliday({
          holidayId: holidayToDelete._id,
          userId: user._id,
        })
      ).unwrap();
      setIsDeleteModalOpen(false);
      setHolidayToDelete(null);
    }
  };

  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const handleTileClick = (holiday, leave) => {
    setIsDrawerOpen(true);
    setHolidayDetails(holiday);
    setLeaveDetails(leave);
  };

  const tileContent = ({ date, view }) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const matchingHoliday = holidays.find((holiday) =>
      isSameDay(new Date(holiday.date), date)
    );
    const matchingUserLeave = filteredUserLeave?.find((leave) =>
      leave.dailyDetails.some((detail) => isSameDay(new Date(detail.day), date))
    );

    if (view === "month" && (matchingHoliday || matchingUserLeave)) {
      return (
        <div
          aria-hidden="true"
          className={`highlighted-tile ${matchingUserLeave ? "user-leave" : ""}`}
          onClick={(e) => handleTileClick(matchingHoliday, matchingUserLeave)}
        >
          {matchingHoliday && (
            <>
              <span style={{ fontSize: "12px", color: "green" }}>
                {matchingHoliday.title}
              </span>
              <p style={{ fontSize: "12px", color: "green" }}>
                ({matchingHoliday.type})
              </p>
            </>
          )}
          {matchingUserLeave && (
            <>
              <span style={{ fontSize: "12px", color: "red" }}>
                {matchingUserLeave.title}
              </span>
              <p style={{ fontSize: "12px", color: "red" }}>
                {matchingUserLeave.type}
              </p>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  const renderFab = () => (
    <Fab
      aria-label="add"
      color="primary"
      onClick={() => setAddIsModalOpen(true)}
      sx={{ position: "fixed", bottom: "20px", right: "20px" }}
    >
      <AddIcon />
    </Fab>
  );

  return (
    <Box>
      <CssBaseline />
      <Container maxWidth="100%">
        <Tabs
          TabIndicatorProps={{ sx: { backgroundColor: theme?.secondaryColor } }}
          onChange={handleChange}
          sx={{ mb: "40px", mt: "20px", borderBottom: "1px solid #ddd" }}
          value={value}
        >
          <Tab
            label="Leave Tracker"
            sx={{
              "&.Mui-selected": {
                color: "#000",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              color: "#5a5a5a",
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          />
          <Tab
            label="Calendar"
            sx={{
              "&.Mui-selected": {
                color: "#000",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              color: "#5a5a5a",
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          />
          {isAdmin && (
            <Tab
              label="Holiday"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
          )}

          {isAdmin && (
            <Tab
              label="Leave Management"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
          )}

          {isAdmin && calculationRules[0]?.isOvertime && (
            <Tab
              label="Overtime Calculation"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
          )}
        </Tabs>

        {value === 0 && (
          <Suspense fallback={<FallBackLoader />}>
            <Leave setProgress={setProgress} />
          </Suspense>
        )}
        {value === 1 && (
          <Suspense fallback={<FallBackLoader />}>
            <RenderCalendar
              componentLoading={componentLoading}
              tileContent={tileContent}
            />
            {isAdmin && renderFab()}
          </Suspense>
        )}
        {isAdmin && value === 2 && (
          <Suspense fallback={<FallBackLoader />}>
            <HolidayAdminPanel
              renderFab={renderFab}
              setProgress={setProgress}
              theme={theme}
            >
              <RenderHolidayTable
                handleDeleteClick={handleDeleteClick}
                handleEditClick={handleEditClick}
                holidays={holidays}
                theme={theme}
              />
            </HolidayAdminPanel>
          </Suspense>
        )}

        {isAdmin && value === 3 && (
          <Suspense fallback={<FallBackLoader />}>
            <LeaveAdminPanel setProgress={setProgress} theme={theme} />
          </Suspense>
        )}
        {isAdmin && value === 4 && calculationRules[0]?.isOvertime && (
          <Suspense fallback={<FallBackLoader />}>
            <Calculation setProgress={setProgress} theme={theme} />
          </Suspense>
        )}
      </Container>

      {addIsModalOpen && (
        <AddHoliday
          handleAddHoliday={handleAddHoliday}
          handleClose={() => setAddIsModalOpen(false)}
          open={addIsModalOpen}
          theme={theme}
        />
      )}
      {updateIsModalOpen && (
        <UpdateHoliday
          handleClose={() => setUpdateIsModalOpen(false)}
          handleUpdateHoliday={handleUpdateHoliday}
          holidayId={selectedHoliday?._id}
          open={updateIsModalOpen}
          selectedHoliday={selectedHoliday}
          theme={theme}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          onClose={handleCloseDeleteModal}
          onDelete={handleDeleteHoliday}
          open={isDeleteModalOpen}
          text={"Are you sure you want to delete this holiday?"}
          theme={theme}
          title={"Delete Holiday"}
        />
      )}
      <Drawer
        anchor="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
      >
        {(holidayDetails || leaveDetails) && (
          <Box
            style={{
              width: "350px",
              padding: "16px ",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
            }}
          >
            <Typography
              sx={{
                color: "white",
                background: theme?.secondaryColor,
                padding: "10px",
                textAlign: "center",
                fontWeight: "500",
              }}
              variant="h5"
            >
              Leave Details
            </Typography>
            <Container
              maxWidth="sm"
              sx={{
                border: `1px solid ${theme?.secondaryColor}`,
                borderRadius: "0 0px 5px 5px",
              }}
            >
              {holidayDetails && (
                <>
                  <Typography style={{ margin: "10px 0", color: "#333" }}>
                    Title : {holidayDetails.title}
                  </Typography>
                  <Typography style={{ margin: "10px 0", color: "#000" }}>
                    <span>Date:</span>
                    <span style={{ color: "#666" }}>
                      {formatDate(
                        holidayDetails.date
                          ? holidayDetails.date
                          : holidayDetails.startDate
                      )}
                    </span>
                  </Typography>
                  <Typography style={{ margin: "10px 0", color: "#000" }}>
                    <span>Description:</span>{" "}
                    <span style={{ color: "#555" }}>
                      {holidayDetails.description}
                    </span>
                  </Typography>
                </>
              )}
              {leaveDetails && (
                <>
                  <Typography style={{ margin: "10px 0", color: "#333" }}>
                    Title : {leaveDetails.title}
                  </Typography>
                  <Typography style={{ margin: "10px 0", color: "#000" }}>
                    <span>Date:</span>
                    <span style={{ color: "#666" }}>
                      {" "}
                      {formatDate(leaveDetails.startDate)}
                    </span>
                  </Typography>
                  <Typography style={{ margin: "10px 0", color: "#000" }}>
                    <span>Description:</span>{" "}
                    <span style={{ color: "#555" }}>
                      {leaveDetails.description}
                    </span>
                  </Typography>
                </>
              )}
            </Container>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default CalendarAndHoliday;
