import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Collapse, styled } from "@mui/material";
import { Celebration, Favorite, Cake } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectCurrentTheme, selectMe } from "##/src/app/profileSlice.js";
import { Close } from "@mui/icons-material";

// Custom styled components for animations
const FloatingIcon = styled(Box)(({ theme, delay }) => ({
  position: "absolute",
  animation: `float ${3 + delay * 0.5}s ease-in-out infinite`,
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
    "50%": { transform: "translateY(-20px) rotate(10deg)" },
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: `-webkit-linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.main} 90%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
}));

const BirthdayAlert = ({ workspace }) => {
  const [open, setOpen] = React.useState(false);
  const [birthdayNotificationEnabled, _] = useState(() => {
    const notifications = workspace.settings.notification || {};
    return notifications.user?.birthday?.system || false;
  });

  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);

  const handleClose = () => {
    setOpen(false);
    const notifiedOn = new Date();
    notifiedOn.setDate(notifiedOn.getDate() + 1);
    localStorage.setItem(
      "birthDayNotified",
      JSON.stringify({
        [user._id]: notifiedOn,
      })
    );
  };

  useEffect(() => {
    if (user && birthdayNotificationEnabled) {
      const birthDate = new Date(user.dateOfBirth);
      const today = new Date();
      const notifiedDate = JSON.parse(localStorage.getItem("birthDayNotified"));

      if (notifiedDate && new Date(notifiedDate[user._id]) > new Date()) {
        return;
      }

      if (
        birthDate.getDate() === today.getDate() &&
        birthDate.getMonth() === today.getMonth()
      ) {
        setOpen(true);
      }
    }
  }, [birthdayNotificationEnabled, user]);

  if (open) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          //   backgroundColor: "rgba(0,0,0,0.5)",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        {/* Floating decorations */}
        {[...Array(8)].map((_, i) => (
          <FloatingIcon
            key={i}
            delay={i}
            sx={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: "2.5rem",
              //   color: i % 2 === 0 ? "secondary.main" : "error.main",
              color: i % 2 === 0 ? theme?.primaryColor : theme?.backgroundColor,
            }}
          >
            <Cake sx={{ fontSize: "inherit" }} />
          </FloatingIcon>
        ))}

        <Collapse in={open}>
          <Button
            aria-label="Close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              minWidth: 0,
              p: 1,
              borderRadius: "50%",
              color: theme?.textColor,
              bgcolor: theme?.backgroundColor,
              "&:hover": {
                bgcolor: theme?.primaryColor,
                color: theme?.textColor,
                transform: "rotate(90deg)",
              },
              transition: "all 0.3s ease",
              zIndex: 1,
              boxShadow: 3,
              border: "1px solid",
              borderColor: theme?.border,
            }}
          >
            <Close sx={{ fontSize: 24 }} />
          </Button>

          <Box
            sx={{
              position: "relative",
              backgroundColor: theme?.backgroundColor,
              borderRadius: 4,
              p: 4,
              textAlign: "center",
              boxShadow: 24,
              maxWidth: 500,
              mx: 2,
              background: `linear-gradient(145deg, #f3e5f5 30%,${theme?.textColor} 90%)`,
            }}
          >
            <Celebration
              sx={{
                fontSize: 60,
                color: theme?.primaryColor,
                mb: 2,
                animation: "pulse 1.5s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.2)" },
                },
              }}
            />

            <GradientText variant="h3" gutterBottom>
              Happy Birthday{user ? `, ${user.name}!` : "!"}
            </GradientText>

            <Typography
              variant="body1"
              sx={{
                mb: 2,
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Favorite
                sx={{
                  color: theme?.secondaryColor,
                  animation: "heartBeat 1s infinite",
                }}
              />
              Wishing you an amazing day!
              <Favorite
                sx={{
                  color: theme?.secondaryColor,
                  animation: "heartBeat 1s infinite",
                }}
              />
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                mt: 3,
                "& button": {
                  borderRadius: 20,
                  py: 1.5,
                  px: 4,
                  fontWeight: "bold",
                },
              }}
            >
              {/* <Button
                variant="contained"
                color="secondary"
                endIcon={<Celebration />}
                onClick={handleClose}
              >
                Let's Celebrate!
              </Button> */}
            </Box>

            {/* Animated border */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 4,
                border: "3px solid",
                borderColor: theme?.primaryColor,
                animation: "borderGlow 2s ease-in-out infinite",
                "@keyframes borderGlow": {
                  "0%, 100%": { opacity: 0.5 },
                  "50%": { opacity: 1 },
                },
              }}
            />
          </Box>
        </Collapse>
      </Box>
    );
  }
};

export default BirthdayAlert;
