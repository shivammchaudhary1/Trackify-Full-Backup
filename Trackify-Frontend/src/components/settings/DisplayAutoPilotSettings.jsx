import React, { useContext, useEffect, useState, useTransition } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Grid2 as Grid,
  Switch,
  Tooltip,
  FormControlLabel,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";
import {
  deleteAutoAddLeaveBalanceSetting,
  disableAutoAddLeaveBalanceSetting,
  enableAutoAddLeaveBalanceSetting,
  getAllAutoAddLeaveBalanceSettings,
  selectLeaveAutoAddSettings,
  updateAutoAddLeaveBalanceSetting,
} from "##/src/app/leaveSlice.js";
import { useDispatch } from "react-redux";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import { AuthContext } from "##/src/context/authcontext.js";
import DeleteModal from "##/src/components/common/DeleteModal.jsx";
import { selectCurrentTheme } from "##/src/app/profileSlice";
import ConfirmModal from "##/src/components/common/ConfirmationModal.jsx";
import { makeStyles } from "@mui/styles";
import { LEAVE_FREQUENCY } from "##/src/utility/time/time.utility";
import dayjs from "dayjs";

const FREQUENCY_LABEL = {
  month: "Month",
  year: "Year",
  halfYear: "6 Months",
  quarter: "Quarter",
};

const SETTING_RECURRENCE = {
  once: "Once",
  repeat: "Repeat",
};

const useStyles = makeStyles({
  customList: {
    paddingLeft: "20px",
  },
  customListItem: {
    marginBottom: "0px",
    padding: "0",
    listStyleType: "disc",
    paddingLeft: "1em",
    display: "list-item",
  },
});

const displaySettingInfo = (setting) => {
  const nextExecutionDate = dayjs(setting.nextExecutionDate);
  if (setting.recurrence === "once") {
    return (
      (setting.isExecuted
        ? `Scheduled to run on the ${new Date(setting.lastExecutionDate).toDateString()}`
        : `Scheduled to run on the ${nextExecutionDate.format("DD/MM/YYYY")}.`) +
      (setting.enabled && setting.isExecuted ? ", Task Completed" : "")
    );
  }

  switch (setting.frequency) {
    case LEAVE_FREQUENCY.MONTH:
      return (
        `Scheduled to run on the ${setting.date} day of each month.` +
        (setting.enabled && setting.nextExecutionDate
          ? ` Next start date: ${new Date(setting.nextExecutionDate).toLocaleDateString()}.`
          : "") +
        (setting.enabled && setting.lastExecutedDate
          ? ` Last executed date: ${new Date(setting.lastExecutionDate).toDateString()}.`
          : "") +
        (setting.recurrence === "once" && setting.isExecuted
          ? " Already Executed."
          : "")
      );

    case LEAVE_FREQUENCY.YEAR:
      return (
        `Scheduled for execution on the ${setting.date} day of January each year.` +
        (setting.enabled && setting.nextExecutionDate
          ? ` Next start date: ${new Date(setting.nextExecutionDate).toLocaleDateString()}.`
          : "") +
        (setting.enabled && setting.lastExecutedDate
          ? ` Last executed date: ${new Date(setting.lastExecutedDate).toDateString()}.`
          : "") +
        (setting.recurrence === "once" && setting.isExecuted
          ? "Already Executed."
          : " ")
      );

    case LEAVE_FREQUENCY.QUARTER:
      return (
        `Scheduled for execution on the ${setting.date} day of January, April, July, and October.` +
        (setting.enabled && setting.nextExecutionDate
          ? ` Next start date: ${new Date(setting.nextExecutionDate).toLocaleDateString()}.`
          : "") +
        (setting.enabled && setting.lastExecutedDate
          ? ` Last executed date: ${new Date(setting.lastExecutedDate).toDateString()}.`
          : "") +
        (setting.recurrence === "once" && setting.isExecuted
          ? " Already Executed."
          : " ")
      );

    case LEAVE_FREQUENCY.HALF_YEAR:
      return (
        `Scheduled for execution on the ${setting.date} day of January and July.` +
        (setting.enabled && setting.nextExecutionDate
          ? ` Next start date: ${new Date(setting.nextExecutionDate).toLocaleDateString()}.`
          : "") +
        (setting.enabled && setting.lastExecutedDate
          ? ` Last executed date: ${new Date(setting.lastExecutedDate).toDateString()}.`
          : "") +
        (setting.recurrence === "once" && setting.isExecuted
          ? " Already Executed."
          : "")
      );

    default:
      return "";
  }
};

export default function DisplayAutoPilotSettings({ onEdit, leaveTypes }) {
  const leaveAutoAddSettings = useSelector(selectLeaveAutoAddSettings);
  const dispatchToRedux = useDispatch();
  const classes = useStyles();

  const [isLoading, startTransition] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isToggleConfirmationModalOpen, setIsToggleConfirmationModalOpen] =
    useState(false);
  const [
    isOpenToggleExecutionConfirmationModal,
    setIsOpenToggleExecutionConfirmationModal,
  ] = useState(false);
  const [settingIdToDelete, setSettingIdToDelete] = useState(null);
  const [toggleData, setToggleData] = useState({});
  const [executionData, setExecutionData] = useState({
    settingId: "",
    executionValue: "",
  });

  const theme = useSelector(selectCurrentTheme);

  const { handleError } = useErrorHandler();
  const { setNotification } = useSetNotification();
  const { setLoadingBarProgress } = useContext(AuthContext);

  const toggleEnable = () => {
    if (!toggleData.id) {
      setNotification("Please select a setting to toggle", "warning");
      return;
    }

    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        if (toggleData.enabled) {
          await dispatchToRedux(
            disableAutoAddLeaveBalanceSetting({
              settingId: toggleData.id,
            })
          ).unwrap();
        } else {
          await dispatchToRedux(
            enableAutoAddLeaveBalanceSetting({ settingId: toggleData.id })
          ).unwrap();
        }
        setLoadingBarProgress(100);
        closeToggleConfirmationModalOpen();
      } catch (error) {
        closeToggleConfirmationModalOpen();
        setLoadingBarProgress(100);
        handleError(`Failed to toggle the settings, ${error.message}`);
      }
    });
  };

  function changeExecutionMode() {
    if (!executionData.settingId || !executionData.executionValue) {
      setNotification("Please select a setting to toggle", "warning");
      return;
    }
    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        await dispatchToRedux(
          updateAutoAddLeaveBalanceSetting({
            settingId: executionData.settingId,
            recurrence: executionData.executionValue,
          })
        ).unwrap();
        setLoadingBarProgress(100);
        closeToggleExecutionConfirmationModal();
      } catch (error) {
        closeToggleExecutionConfirmationModal();
        setLoadingBarProgress(100);
        handleError(`Failed to toggle the settings, ${error.message}`);
      }
    });
  }

  function openDeleteModal(id) {
    setIsDeleteModalOpen(true);
    setSettingIdToDelete(id);
  }
  function closeDeleteModal() {
    setIsDeleteModalOpen(false);

    setSettingIdToDelete(null);
  }

  function openToggleConfirmationModalOpen(id, enabled) {
    setIsToggleConfirmationModalOpen(true);
    setToggleData({ id, enabled });
  }

  function closeToggleExecutionConfirmationModal() {
    setIsOpenToggleExecutionConfirmationModal(false);
    setExecutionData({
      settingId: "",
      executionValue: "",
    });
  }

  function closeToggleConfirmationModalOpen() {
    setIsToggleConfirmationModalOpen(false);
    setToggleData({});
  }

  const handleDelete = () => {
    if (!settingIdToDelete) {
      setNotification("Please select a setting to delete", "warning");
      return;
    }
    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        await dispatchToRedux(
          deleteAutoAddLeaveBalanceSetting({ settingId: settingIdToDelete })
        ).unwrap();
        setLoadingBarProgress(100);
        closeDeleteModal();
      } catch (error) {
        setLoadingBarProgress(100);
        closeDeleteModal();
        handleError(`Failed to delete setting, ${error.message}`);
      }
    });
  };

  useEffect(() => {
    dispatchToRedux(getAllAutoAddLeaveBalanceSettings());
  }, []);

  return (
    <>
      <Paper
        sx={{
          mt: 3,
          ml: [0.2, 0.2, 3],
          flexGrow: 1,
          p: 2,
          width: "100%",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Auto Leave balance settings
        </Typography>
        <Typography variant="body">
          If execution is set to Repeat, Then setting will execute repeatedly;
          Otherwise, execute once only
        </Typography>
        <List className={classes.customList}>
          <ListItem className={classes.customListItem}>
            <ListItemText primary="Only one setting can be enabled at a time." />
          </ListItem>
          <ListItem className={classes.customListItem}>
            <ListItemText primary="Enabling the setting will automatically add the leave balance to each user's account based on the selected leave type." />
          </ListItem>
          <ListItem className={classes.customListItem}>
            <ListItemText primary="By default, the setting will execute only once." />
          </ListItem>
          <ListItem>
            <List sx={{ marginTop: "-15px", marginBottom: "-12px" }}>
              <ListItem className={classes.customListItem}>
                <ListItemText secondary="Monthly: Leave balance will be added on the specified day of each month." />
              </ListItem>
              <ListItem className={classes.customListItem}>
                <ListItemText secondary="Yearly: Leave balance will be added on the specified day of January each year." />
              </ListItem>
              <ListItem className={classes.customListItem}>
                <ListItemText secondary="Quarterly: Leave balance will be added on the specified day of January, April, July, and October." />
              </ListItem>
              <ListItem className={classes.customListItem}>
                <ListItemText secondary="Every 6 Month: Leave balance will be added on the specified day of January and July." />
              </ListItem>
            </List>
          </ListItem>
          <ListItem className={classes.customListItem}>
            <ListItemText primary="Next start date will be visible after enabling the setting." />
          </ListItem>
        </List>
        <Box sx={{ mt: 2, p: 2 }}>
          {!leaveAutoAddSettings.length && (
            <Typography
              sx={{
                textAlign: "center",
                borderTop: "1px solid #ccc",
                paddingTop: "10px",
                paddingBottom: "10px",
                backgroundColor: "#eee",
              }}
            >
              No Settings added
            </Typography>
          )}
          {!!leaveAutoAddSettings.length && (
            <List>
              <ListItem>
                <Grid
                  maxWidth={"100%"}
                  container
                  alignItems="center"
                  sx={{ width: "100%", borderBottom: "1px solid #ccc" }}
                >
                  <Grid size={6}>
                    <ListItemText>
                      <strong>Setting Description</strong>
                    </ListItemText>
                  </Grid>
                  <Grid size={2}>
                    <ListItemText>
                      <strong>Execution Type</strong>
                    </ListItemText>
                  </Grid>
                  <Grid size={2}>
                    <ListItemText>
                      <strong>Enabled/Disable</strong>
                    </ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
              {leaveAutoAddSettings.map((setting) => {
                const leaveType = leaveTypes.find(
                  (type) => type.leaveType === setting.type
                );
                if (leaveType) {
                  return (
                    <Box key={setting._id}>
                      <ListItem sx={{ display: "flex", alignItems: "center" }}>
                        <Grid
                          maxWidth={"100%"}
                          container
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <Grid size={6}>
                            <ListItemText
                              primary={
                                setting.recurrence === "repeat"
                                  ? `Add ${setting.numberOfLeaves} ${leaveType.title} leave every ${FREQUENCY_LABEL[setting.frequency]}`
                                  : `Add ${setting.numberOfLeaves} ${leaveType.title} leave once`
                              }
                              secondary={displaySettingInfo(setting)}
                            />
                          </Grid>
                          <Grid size={2} sx={{ textAlign: "left" }}>
                            <InputLabel>
                              {SETTING_RECURRENCE[setting.recurrence]}
                            </InputLabel>
                          </Grid>
                          <Grid size={2} sx={{ textAlign: "left" }}>
                            <Tooltip
                              title={
                                setting.enabled
                                  ? "Disable this setting"
                                  : "Enable this setting"
                              }
                            >
                              <span>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      disabled={isLoading}
                                      checked={setting.enabled}
                                      onChange={() =>
                                        openToggleConfirmationModalOpen(
                                          setting._id,
                                          setting.enabled
                                        )
                                      }
                                      name="enabled"
                                    />
                                  }
                                  label={
                                    setting.enabled ? "Enabled" : "Disabled"
                                  }
                                />
                              </span>
                            </Tooltip>
                          </Grid>
                          <Grid
                            size={2}
                            sx={{
                              display: "flex",
                              gap: 2,
                              justifyContent: "end",
                            }}
                          >
                            <Tooltip title="Edit">
                              <FormControlLabel
                                control={
                                  <IconButton
                                    disabled={setting.enabled}
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => onEdit(setting)}
                                  >
                                    <Edit />
                                  </IconButton>
                                }
                              />
                            </Tooltip>
                            {/* <Tooltip title="Edit">
                            <IconButton
                              disabled={setting.enabled}
                              edge="end"
                              aria-label="edit"
                              onClick={() => onEdit(setting)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip> */}
                            <Tooltip title="Delete">
                              <FormControlLabel
                                control={
                                  <IconButton
                                    disabled={setting.enabled}
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => openDeleteModal(setting._id)}
                                  >
                                    <Delete />
                                  </IconButton>
                                }
                              />
                              {/* <IconButton
                              disabled={setting.enabled}
                              edge="end"
                              aria-label="delete"
                              onClick={() => openDeleteModal(setting._id)}
                            >
                              <Delete />
                            </IconButton> */}
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </ListItem>
                      <Divider variant="middle" />
                    </Box>
                  );
                }
              })}
            </List>
          )}
        </Box>
      </Paper>
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        theme={theme}
        buttonLoading={isLoading}
        title={"Are you sure you want to delete this setting?"}
        text={
          "Deleting this setting will, stop sending auto addition of leaves."
        }
      />
      {isToggleConfirmationModalOpen && (
        <ConfirmModal
          isOpen={isToggleConfirmationModalOpen}
          onClose={closeToggleConfirmationModalOpen}
          onSave={toggleEnable}
          title={`Are you sure to toggle ${toggleData?.enabled ? "disable" : "enable"} this setting?`}
          description={`${toggleData?.enabled ? "Disable" : "Enable"} this setting will ${toggleData?.enabled ? "stop" : "start"} auto addition of leaves.`}
          isLoading={isLoading}
        />
      )}
      {isOpenToggleExecutionConfirmationModal && (
        <ConfirmModal
          isOpen={isOpenToggleExecutionConfirmationModal}
          onClose={closeToggleExecutionConfirmationModal}
          onSave={changeExecutionMode}
          title={`Are you sure to change execution mode to ${SETTING_RECURRENCE[executionData.executionValue]}`}
          description={`${executionData.executionValue === "once" ? `Updating this settings to ${SETTING_RECURRENCE[executionData.executionValue]} will only execute the setting once` : `Updating this settings to ${SETTING_RECURRENCE[executionData.executionValue]} will repeat the execution`}.`}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
