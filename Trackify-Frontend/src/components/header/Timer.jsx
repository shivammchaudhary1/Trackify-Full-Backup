import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectRunningTimer } from "##/src/app/timerSlice.js";
import { MENU_LABELS } from "##/src/utility/footer";
import { useLocation } from "react-router-dom";

export default function Timer() {
  const [timer, setTimer] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const usersTimer = useSelector(selectRunningTimer);
  const intervalRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const updateTitle = (seconds, minutes, hours) => {
      const formattedTimer = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      document.title = `${formattedTimer} - Trackify`;
    };

    if (usersTimer.isRunning && !intervalRef.current) {
      setTimer(usersTimer.startTime);
      intervalRef.current = setInterval(() => {
        setTimer((prevTimer) => {
          const newSeconds = prevTimer.seconds + 1;
          const newMinutes = prevTimer.minutes + Math.floor(newSeconds / 60);
          const newHours = prevTimer.hours + Math.floor(newMinutes / 60);
          // Update the browser tab title with the new time
          updateTitle(newSeconds, newMinutes, newHours, "in timer components");
          return {
            hours: newHours % 24,
            minutes: newMinutes % 60,
            seconds: newSeconds % 60,
          };
        });
      }, 1000);
    } else if (!usersTimer.isRunning && intervalRef.current) {
      intervalRef.current = null;
      clearInterval(intervalRef.current);
      setTimer({ hours: 0, minutes: 0, seconds: 0 });
    }

    return () => {
      if (intervalRef.current) {
        setTimer({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [usersTimer.isRunning]);

  useEffect(() => {
    if (!usersTimer.isRunning) {
      const pageTitle = MENU_LABELS[document.location.pathname.split("/")[1]];
      document.title = pageTitle ? `${pageTitle}` : "Trackify";
    }
  }, [usersTimer.isRunning]);

  useEffect(() => {
    if (!usersTimer.isRunning) {
      const pageTitle = MENU_LABELS[document.location.pathname.split("/")[1]];
      document.title = pageTitle ? `${pageTitle}` : "Trackify";
    }
  }, [usersTimer.isRunning, location.pathname]);

  return (
    <Box
      sx={{
        fontSize: "22px",
        position: ["absolute", "absolute", "relative"],
        right: ["20px", "20px", "auto"],
      }}
    >
      {timer.hours.toString().padStart(2, "0")}:
      {timer.minutes.toString().padStart(2, "0")}:
      {timer.seconds.toString().padStart(2, "0")}
    </Box>
  );
}
