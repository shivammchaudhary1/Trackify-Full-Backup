import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  Box,
  Container,
  FormControlLabel,
  Checkbox,
  Typography,
  Button,
  Grid2 as Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentTheme,
  selectCurrentWorkspace,
} from "##/src/app/profileSlice.js";
import {
  makeSelectWorkspace,
  updateWorkspace,
} from "##/src/app/workspaceSlice";

const NOTIFICATION_TYPES = {
  ADMIN: "admin",
  USER: "user",
};

const NOTIFICATION_LABEL = {
  birthday: "Birthday",
};

import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { AuthContext } from "##/src/context/authcontext";

// Function to compare two objects
const compareNotifications = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

function NotificationSettings() {
  const currentWorkspaceId = useSelector(selectCurrentWorkspace);
  const selectWorkspace = useMemo(makeSelectWorkspace, []);
  const currentWorkspace = useSelector((state) =>
    selectWorkspace(state, currentWorkspaceId)
  );
  const [notifications, setNotifications] = useState(
    currentWorkspace.settings.notification || {}
  );
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const theme = useSelector(selectCurrentTheme);
  const dispatchToRedux = useDispatch();
  const { setLoadingBarProgress } = useContext(AuthContext);

  const handleCheckboxChange = (role, type, notification) => (event) => {
    setNotifications({
      ...notifications,
      [role]: {
        ...notifications[role],
        [type]: {
          ...notifications[role][type],
          [notification]: event.target.checked,
        },
      },
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        await dispatchToRedux(
          updateWorkspace({
            settings: {
              notification: notifications,
            },
            workspaceId: currentWorkspaceId,
          })
        ).unwrap();
        setNotification(
          "Notification settings updated successfully",
          "success"
        );
        setLoadingBarProgress(100);
      } catch (error) {
        setLoadingBarProgress(100);
        handleError("Failed to update notification settings");
      }
    });
  };

  useEffect(() => {
    const initialNotifications = currentWorkspace.settings.notification || {};
    const hasChanged = !compareNotifications(
      notifications,
      initialNotifications
    );
    setIsChanged(hasChanged);
  }, [notifications, currentWorkspace]);
  return (
    <Container maxWidth="100%" sx={{ ml: -7, mt: -5, display: "flex" }}>
      <Box
        sx={{
          mt: 2,
          p: 4,
          boxShadow: 0,
          borderRadius: 1,
        }}
        width={"50%"}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ borderBottom: "1px solid #ccc", mb: 2 }}
        >
          Admin Notifications
        </Typography>
        <Grid container alignItems="center" spacing={2} pb={2}>
          <Grid size={6}>
            <Typography variant="body1" fontWeight="bold">
              Notification Type
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="body1" fontWeight="bold">
              System
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="body1" fontWeight="bold">
              Email
            </Typography>
          </Grid>
        </Grid>
        <form onSubmit={handleSubmit}>
          {notifications[NOTIFICATION_TYPES.ADMIN] &&
            Object.keys(notifications[NOTIFICATION_TYPES.ADMIN]).map(
              (notificationType) => {
                return (
                  <Grid
                    key={notificationType}
                    container
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid size={6}>
                      <Typography>
                        {NOTIFICATION_LABEL[notificationType]}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onClick={handleCheckboxChange(
                              NOTIFICATION_TYPES.ADMIN,
                              notificationType,
                              "system"
                            )}
                            checked={
                              notifications[NOTIFICATION_TYPES.ADMIN][
                                notificationType
                              ].system
                            }
                          />
                        }
                      />
                    </Grid>
                    <Grid size={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onClick={handleCheckboxChange(
                              NOTIFICATION_TYPES.ADMIN,
                              notificationType,
                              "email"
                            )}
                            checked={
                              notifications[NOTIFICATION_TYPES.ADMIN][
                                notificationType
                              ].email
                            }
                          />
                        }
                      />
                    </Grid>
                    <Grid>
                      <Button
                        disabled={isLoading || !isChanged}
                        type="submit"
                        variant="contained"
                        sx={{
                          bgcolor: theme.secondaryColor,
                          color: theme.textColor,
                        }}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Grid>
                );
              }
            )}
        </form>
      </Box>
      <Box
        sx={{
          mt: 2,
          p: 4,
          boxShadow: 0,
          borderRadius: 1,
        }}
        width={"50%"}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          sx={{ borderBottom: "1px solid #ccc", mb: 2 }}
        >
          User Notifications
        </Typography>
        <Grid container alignItems="center" spacing={2} pb={2}>
          <Grid size={6}>
            <Typography variant="body1" fontWeight="bold">
              Notification Type
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="body1" fontWeight="bold">
              System
            </Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="body1" fontWeight="bold">
              Email
            </Typography>
          </Grid>
        </Grid>
        <form onSubmit={handleSubmit}>
          {notifications[NOTIFICATION_TYPES.ADMIN] &&
            Object.keys(notifications[NOTIFICATION_TYPES.ADMIN]).map(
              (notificationType) => {
                return (
                  <Grid
                    key={notificationType}
                    container
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid size={6}>
                      <Typography>
                        {NOTIFICATION_LABEL[notificationType]}
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onClick={handleCheckboxChange(
                              NOTIFICATION_TYPES.USER,
                              notificationType,
                              "system"
                            )}
                            checked={
                              notifications[NOTIFICATION_TYPES.USER][
                                notificationType
                              ].system
                            }
                          />
                        }
                      />
                    </Grid>
                    <Grid size={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onClick={handleCheckboxChange(
                              NOTIFICATION_TYPES.USER,
                              notificationType,
                              "email"
                            )}
                            checked={
                              notifications[NOTIFICATION_TYPES.USER][
                                notificationType
                              ].email
                            }
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                );
              }
            )}
        </form>
      </Box>
    </Container>
  );
}

export default NotificationSettings;
