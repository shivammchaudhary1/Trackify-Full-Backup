import React, { useEffect, useState, useTransition } from "react";
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Divider,
  Skeleton,
} from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import {
  getWorkspaceUsers,
  selectUserDetails,
} from "##/src/app/userDetailsSlice.js";
import { useDispatch } from "react-redux";
import {
  disableShouldDisplayBirthdayNotification,
  selectCurrentTheme,
  selectMe,
  selectShouldDisplayBirthdayNotification,
  selectUserRole,
} from "##/src/app/profileSlice.js";

const BirthdayNotificationModal = ({ workspace }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [birthdayNotificationEnabled, _] = useState(() => {
    const notifications = workspace.settings.notification || {};
    return notifications.admin?.birthday?.system || false;
  });
  const userDetails = useSelector(selectUserDetails);
  const me = useSelector(selectMe);
  const isAdmin = useSelector(selectUserRole);

  const shouldDisplayNotification = useSelector(
    selectShouldDisplayBirthdayNotification
  );

  const theme = useSelector(selectCurrentTheme);

  const dispatchToRedux = useDispatch();
  const [isLoading, startUsersFetchTransition] = useTransition();
  const [userWithBirthday, setUserWithBirthday] = useState([]);

  function handleCloseModal() {
    setIsOpen(false);
    localStorage.setItem('birthdayNotificationDismissed', new Date().toDateString());
    dispatchToRedux(disableShouldDisplayBirthdayNotification());
  }

  useEffect(() => {
    if (!birthdayNotificationEnabled) return;
  
    const todayStr = new Date().toDateString();
    const dismissedDate = localStorage.getItem('birthdayNotificationDismissed');

    // Don’t proceed if already dismissed today
    if (dismissedDate && dismissedDate === todayStr) return;
    
    function handleGetUsers() {
      startUsersFetchTransition(async () => {
        try {
          await dispatchToRedux(getWorkspaceUsers()).unwrap();
        } catch (error) {
          console.error(`Failed to get users, ${error.message}`);
        }
      });
    }

    if (!userDetails.length && isAdmin) {
      handleGetUsers();
    }

    if (userDetails.length) {
      const filteredUsers = userDetails.filter((userData) => {
        const today = new Date();
        const birthDate = new Date(userData.dateOfBirth);
        return (
          me.email !== userData.email &&
          today.getMonth() === birthDate.getMonth() &&
          today.getDate() === birthDate.getDate()
        );
      });

      if (
        filteredUsers.length &&
        shouldDisplayNotification &&
        isAdmin &&
        birthdayNotificationEnabled
      ) {
        setUserWithBirthday(filteredUsers);
        setIsOpen(true);
      }
    }
  }, [userDetails, isAdmin, shouldDisplayNotification]);

  return (
    <Modal
      open={isOpen}
      onClose={handleCloseModal}
      aria-labelledby="birthday-notification-modal"
      aria-describedby="birthday-notification-list"
      slotProps={{ backdrop: { sx: { backdropFilter: "blur(4px)" } } }}
    >
      <Box
        maxHeight={"70vh"}
        overflow={"auto"}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: ["90%", "80%", "800px"],
          bgcolor: theme?.backgroundColor,
          boxShadow: 24,
          p: 3,
          borderRadius: "16px",
          outline: "none",
          animation: "scaleUp 0.3s ease-out",
          background: `linear-gradient(145deg, ${
            theme?.textColor || "#f8f9fa"
          } 0%, ${theme?.textColor || "#ffffff"} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${
                theme?.secondaryColor || "#3f51b5"
              } 30%, #2196f3 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎉 Today's Celebrants
          </Typography>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {isLoading ? (
          [...Array(3)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width="100%"
              height={80}
              sx={{ mb: 1, borderRadius: 2 }}
            />
          ))
        ) : userWithBirthday.length > 0 ? (
          <List sx={{ py: 0 }}>
            {userWithBirthday.map((user, index) => (
              <React.Fragment key={user.email}>
                <ListItem
                  sx={{
                    py: 2,
                    display: "flex",
                    gap: "15px",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateX(5px)",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={user.profilePicture}
                      sx={{
                        width: 56,
                        height: 56,
                        border: `2px solid ${theme?.secondaryColor || "#3f51b5"}`,
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 10,
                          right: 11,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          bgcolor: theme?.secondaryColor || "#3f51b5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                      }}
                    >
                      <CakeIcon
                        sx={{
                          position: "absolute",
                          bottom: 14,
                          right: 14,
                          fontSize: 24,
                          color: "white",
                          zIndex: 2,
                        }}
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="600">
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {user.email}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          🗓️ Birth Date:{" "}
                          {new Date(user.dateOfBirth).toLocaleDateString(
                            undefined,
                            {
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < userWithBirthday.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box
            sx={{
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <CakeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              No birthdays today! 🎉
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default BirthdayNotificationModal;