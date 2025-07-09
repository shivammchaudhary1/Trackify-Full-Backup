import { Email, Lock } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
} from "@mui/material";
import { lazy, Suspense, useEffect, useState, useTransition } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectShouldReload,
  setIsAuthenticated,
  stopReload,
} from "##/src/app/authSlice.js";
import Logo from "##/src/components/Logo.jsx";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { validateEmailAndPassword } from "##/src/utility/validation/validations.js";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { setMe } from "##/src/app/profileSlice.js";
// Right section of the login page contains image in the background which could take time to load
// So, we are using lazy loading for this component
const SignUpLoginRightSection = lazy(
  () => import("##/src/components/SignUp/SignUpLoginRightSection.jsx")
);

function SignIn() {
  const [userCred, setUserCred] = useState({ email: "", password: "" });
  const [errorInfo, setErrorInfo] = useState({
    isError: false,
    errorMessage: "",
  });

  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  const shouldReload = useSelector(selectShouldReload);
  const dispatchToRedux = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserCred((cred) => ({ ...cred, [name]: value }));
  };

  async function handleLogin() {
    const { validationError, errorMessage } = validateEmailAndPassword(
      userCred.email,
      userCred.password
    );

    if (validationError) {
      return setErrorInfo({
        isError: true,
        errorMessage,
      });
    }

    startTransition(async () => {
      try {
        const responseData = await FetchApi.fetch(
          `${config.api}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credentials: btoa(`${userCred.email}:${userCred.password}`),
            }),
            credentials: "include",
          }
        );

        if (responseData.isAuthenticated) {
          dispatchToRedux(setIsAuthenticated({ isAuthenticated: true }));
          return navigate("/dashboard");
        }
      } catch (error) {
        // Return a rejected value with the error message
        setErrorInfo({
          isError: true,
          errorMessage: `Sign-in failed: ${error.message}`,
        });
      }
    });
  }

  useEffect(() => {
    if (shouldReload) {
      dispatchToRedux(stopReload());
      window.location.reload();
    }
  }, [shouldReload]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: ["column", "column", "row"],
          justifyContent: "center",
          alignItems: "center",
          margin: "-8px",
          padding: "0px",
          height: "95vh",
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
              fontSize: ["36px", "40px", "40px"],
              fontFamily: "Poppins,sans-serif",
              fontWeight: "bold",
              color: "#12828a",
              mt: "150px",
              mb: "40px",
            }}
          >
            Log in
          </Box>
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
                placeholder="Enter your e-mail address"
                sx={{
                  border: "none",
                  borderRadius: "15px",
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
                value={userCred.email}
              />
            </Box>
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
                <Lock sx={{ p: "2px" }} />
              </Box>
              <Box
                as="input"
                name="password"
                onChange={handleChange}
                placeholder="Enter password"
                sx={{
                  border: "none",
                  borderRadius: "20px",
                  width: "100%",
                  height: "50px",
                  fontSize: "18px",
                  backgroundColor: "#d9d9d9",
                  px: "10px",
                  "&:focus": {
                    outline: "none",
                    backgroundColor: "#d9d9d9",
                  },
                  "&:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 30px #d9d9d9 inset",
                  },
                }}
                type="password"
                value={userCred.password}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: ["80%", "60%", "40%"],
              color: "#004AAD",
              pt: "20px",
            }}
          >
            <Link style={{ textDecoration: "none" }} to="../resetpassword">
              <Typography
                fontFamily={"sans-serif"}
                fontSize={18}
                sx={{ color: "#024195" }}
                variant="p"
              >
                Forgot Password
              </Typography>
            </Link>
          </Box>
          {errorInfo.isError && (
            <Typography
              sx={{
                fontFamily: "Poppins, sans-serif",
                color: "red",
                marginTop: "8px",
                textAlign: "left",
                padding: "5px 20px",
              }}
              variant="p"
            >
              {errorInfo.errorMessage}
            </Typography>
          )}
          <Button
            disabled={isPending}
            onClick={() => handleLogin(userCred)}
            sx={{
              color: "white",
              borderRadius: "20px",
              backgroundColor: "#40c1c8",
              boxShadow: "0 2px #999",
              width: "200px",
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
              }}
            >
              {isPending ? "Logging in" : "Log in"}
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
        <SignUpLoginRightSection
          title={"Create Account"}
          description={"Track and Manage your time on one platform"}
          buttonText={"Sign Up"}
          buttonLink={"/signup"}
        />
      </Box>
    </>
  );
}

export default SignIn;
