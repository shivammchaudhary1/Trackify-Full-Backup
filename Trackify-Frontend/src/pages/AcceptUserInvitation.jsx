import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState, useTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { config } from "##/src/utility/config/config.js";

function InviteNewUser() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [isLoading, startTransition] = useTransition();
  const [responseMessage, setResponseMessage] = useState("");
  const [timerCount, setTimerCount] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function fetchData() {
      startTransition(async () => {
        try {
          const response = await fetch(
            `${config.api}/api/user/accept-invitation/${token}`,
            {
              method: "POST",
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              "Failed to process the invitation, " + errorData.message
            );
          }
          setResponseMessage(
            "Your account has been successfully created. Please check your email for login credentials."
          );
          setTimerCount(5);
        } catch (error) {
          setResponseMessage(error.message);
          setTimerCount(5);
        }
      });
    }

    if (token) {
      fetchData();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (timerCount > 0) {
      timerRef.current = setTimeout(() => {
        setTimerCount((prevCount) => prevCount - 1);
      }, 1000);
    } else if (timerCount === 0) {
      setTimerCount(null);
      navigate("/signin");
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerCount]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <div>
          <Typography sx={{ textAlign: "center" }} variant="h5">
            {responseMessage}
          </Typography>
          {timerCount > 0 && (
            <Typography sx={{ textAlign: "center" }} variant="body2">
              Redirecting to login page in {timerCount} seconds...
            </Typography>
          )}
        </div>
      )}
    </Box>
  );
}

export default InviteNewUser;
