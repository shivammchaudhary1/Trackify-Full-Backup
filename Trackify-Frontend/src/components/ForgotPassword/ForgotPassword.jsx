import { Email } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "##/src/components/Logo.jsx";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import bgImage from "../../assets/images/background-images/bg.svg";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const history = useNavigate();
  const [errorInfo, setErrorInfo] = useState({
    isError: false,
    errorMessage: "",
    type: "",
  });

  const [isPending, startTransition] = useTransition();

  const dispatchToRedux = useDispatch();

  const { emailExist, mailSent } = useSelector((store) => store.userDetails);
  const { setNotification } = useSetNotification();

  const handelForgotPassword = async () => {
    if (errorInfo.type == "email") {
      return;
    }

    const emailRegex = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,})+$/;
    const isEmailValid = emailRegex.test(email);

    if (!isEmailValid) {
      setErrorInfo({
        isError: true,
        errorMessage: "Please provide a valid email address",
      });
      return;
    }

    startTransition(async () => {
      try {
        await FetchApi.fetch(`${config.api}/api/profile/forget-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
        setNotification("Password Reset Email Sent", "success");
      } catch (error) {
        setErrorInfo({
          isError: true,
          errorMessage: `Failed to reset the password, ${error.message}`,
        });
      }
    });
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
    setErrorInfo({ isError: false, errorMessage: "" });
  };

  useEffect(() => {
    if (mailSent) {
      setErrorInfo({ isError: false, errorMessage: "", type: "" });
      alert("Reset password link has been shared on this mail");
    }
  }, [mailSent]);

  useEffect(() => {
    if (emailExist) {
      setErrorInfo({ isError: false, errorMessage: "", type: "" });
    } else {
      setErrorInfo({
        isError: true,
        errorMessage: "Email is not registered with us. Try Sign up.",
        type: "email",
      });
    }
  }, [emailExist]);

  return (
   <Box
        sx={{
          display: "flex",
          flexDirection: ["column", "column", "row"],
          justifyContent: "center",
          alignItems: "center",
          margin: "-8px",
          padding: "0px",
        }}
      >
        <Box
          sx={{
            height: "100vh",
            width: ["100%", "100%", "65%"],
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "30px",
              left: "30px",
            }}
          >
            <Logo />
          </Box>
          <Box
            sx={{
              fontSize: ["28px", "40px", "40px"],
              fontFamily: "Poppins,sans-serif",
              fontWeight: "bold",
              color: "#19acb4",
              mt: "150px",
              mb: "40px",
              textAlign: "center",
            }}
          >
            Forgot your password?
          </Box>
          <Typography variant="subtitle1">
            Don&#39;t worry, we can help you
          </Typography>
          {errorInfo.isError && (
            <Box
              sx={{
                color: "red",
                pt: "10px",
                width: ["80%", "60%", "50%"],
                textAlign: "center",
              }}
            >
              <Typography variant="p">{errorInfo.errorMessage}</Typography>
            </Box>
          )}

          <Box sx={{ width: ["80%", "60%", "50%", "40%"] }}>
            <Box
              as="span"
              sx={{
                border: errorInfo.isError ? "1px solid red" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50px",
                backgroundColor: "#d9d9d9",
                mt: "20px",
                px: "18px",
                gap: "5px",
                "&:focus-within": {
                  boxShadow: "0 0 5px #19acb482",
                  transition: "box-shadow 0.5s ease-in-out",
                },
              }}
            >
              <Box
                sx={{
                  border: "1px solid black",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "30px",
                  width: "30px",
                  boxSizing: "border-box",
                }}
              >
                <Email sx={{ p: "2px" }} />
              </Box>
              <Box
                as="input"
                name="email"
                onChange={handleChange}
                placeholder="Enter your e-mail"
                sx={{
                  border: "none",
                  borderRadius: "20px",
                  width: "100%",
                  height: "50px",
                  backgroundColor: "#d9d9d9",
                  px: "10px",
                  fontSize: "18px",
                  "&:focus": {
                    outline: "none",
                    backgroundColor: "#d9d9d9",
                  },
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 30px #d9d9d9 inset",
                  },
                }}
                type="email"
                value={email}
              />
            </Box>
          </Box>
          <Button
            disabled={isPending}
            onClick={handelForgotPassword}
            sx={{
              color: "white",
              borderRadius: "20px",
              backgroundColor: "#40c1c8",
              boxShadow: "0 2px #999",
              minWidth: "200px",
              mt: "30px",
              "&:hover": {
                backgroundColor: "#33b0b8",
                boxShadow: "0 2px #666",
              },
              display: "flex",
              gap: "10px",
            }}
          >
            {isPending && (
              <CircularProgress color="inherit" size={25} thickness={5} />
            )}
            <Typography
              sx={{
                fontFamily: "Poppins,sans-serif",
                fontSize: "23px",
                fontWeight: "300",
                textTransform: "capitalize",
                mx: "10px",
              }}
            >
              {isPending ? "Sending Email" : "Reset Password"}
            </Typography>
          </Button>
          <Box
            sx={{
              mt: "50px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Typography
              sx={{ fontSize: "20px", fontFamily: "Poppins, sans-serif" }}
              variant="p"
            >
              Not on Trackify?
            </Typography>
            <Link style={{ textDecoration: "none" }} to="../signup">
              <Typography
                sx={{
                  fontSize: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#19acb4",
                }}
                variant="p"
              >
                Sign Up
              </Typography>
            </Link>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundImage: `url(${bgImage})`,
            width: "35%",
            display: ["none", "none", "flex"],
            height: "101vh",
            backgroundSize: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "30px",
          }}
        >
          <Box
            sx={{
              color: "#fff",
              fontWeight: "600",
              fontSize: ["32px", "32px", "42px"],
              fontFamily: "Poppins,sans-serif",
              textAlign: "center",
              px: "2px",
            }}
          >
            Create Account
          </Box>
          <Typography
            sx={{
              my: "15px",
              fontSize: "26px",
              fontWeight: "350",
              color: "#fff",
              maxWidth: "50%",
              textAlign: "center",
              mt: "45px",
            }}
            variant="p"
          >
            Track and Manage your time on one platform
          </Typography>
          <Box
            onClick={() => {
              history("/signup");
            }}
            sx={{
              color: "#fff",
              fontSize: "23px",
              fontWeight: "300",
              textAlign: "center",
              padding: "7px 5px",
              border: "3px solid white",
              borderRadius: "35px",
              width: "180px",
              mt: "10px",
              "&:active": {
                backgroundColor: "#19acb4",
                boxShadow: "0 5px #40c1c8",
                transform: "translateY(4px)",
              },
              "&:hover": {
                animation: "ease-in",
                backgroundColor: "#1d777cb6",
                cursor: "pointer",
              },
            }}
          >
            <Typography sx={{ color: "#fff" }} variant="p">
              Sign Up
            </Typography>
          </Box>
        </Box>
      </Box>
  );
}
