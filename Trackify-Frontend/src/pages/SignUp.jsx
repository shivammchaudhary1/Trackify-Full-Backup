import { Email, Lock } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { lazy, useState, useTransition } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { setIsAuthenticated } from "##/src/app/authSlice.js";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { themes } from "##/src/utility/themes.js";
import { validateEmailAndPassword } from "##/src/utility/validation/validations.js";
import Logo from "##/src/components/Logo.jsx";

// Right section of the sign up page contains image in the background which could take time to load
// So, we are using lazy loading for this component
const SignUpLoginRightSection = lazy(
  () => import("##/src/components/SignUp/SignUpLoginRightSection.jsx")
);

export default function SignUp() {
  const [userCred, setUserCred] = useState({ email: "", password: "" });
  const [errorInfo, setErrorInfo] = useState({
    isError: false,
    errorMessage: "",
    type: "",
  });

  // useTransition is a React hook used to manage state transitions for non-urgent updates.
  // It helps prevent the UI from freezing by deferring updates that do not need immediate rendering.
  // The hook returns a `startTransition` function to wrap non-urgent state updates
  // and an `isPending` boolean to indicate if a transition is ongoing, replacing the need for a separate loading state.
  const [isPending, startTransition] = useTransition();

  // Here we named the dispatch function as dispatchToRedux, so that we can name dispatch,
  // if we need to manage local state management using useSlice for a particular component.
  const dispatchToRedux = useDispatch();

  const passwordConstraints = [
  {
    text: "At least one number",
    isValid: (pwd) => /\d/.test(pwd),
  },
  {
    text: "At least one lowercase letter",
    isValid: (pwd) => /[a-z]/.test(pwd),
  },
  {
    text: "At least one uppercase letter",
    isValid: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    text: "At least one special character (@,#,$,%,-)",
    isValid: (pwd) => /[@#$%\-]/.test(pwd),
  },
  {
    text: "Password length should be between 6 and 12 characters",
    isValid: (pwd) => pwd.length >= 6 && pwd.length <= 12,
  },
];

 const allValid = passwordConstraints.every((c) => c.isValid(userCred.password));


  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserCred((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    // Validate email and password
    const { validationError, errorMessage } = validateEmailAndPassword(
      userCred.email,
      userCred.password
    );

    if (validationError) {
      setErrorInfo({
        isError: validationError,
        errorMessage: errorMessage,
        type: "charsMismatch",
      });
      return;
    }

    const bodyPayload = {
      email: userCred.email,
      password: userCred.password,
      name: userCred.email.split("@")[0],
      themeId: themes[0].themeId,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    startTransition(async () => {
      try {
        const { isAuthenticated } = await FetchApi.fetch(
          `${config.api}/api/user/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(bodyPayload),
          }
        );

        if (isAuthenticated) {
          dispatchToRedux(setIsAuthenticated({ isAuthenticated }));
        }
      } catch (error) {
        setErrorInfo({
          isError: true,
          errorMessage: `Failed to create account. ${error.message}`,
          type: "wrongCred",
        });
      }
    });
  };

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
              color: "#19acb4",
              mt: "150px",
              mb: "40px",
            }}
          >
            Create Account
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
                  backgroundColor: "#d9d9d9",
                  fontSize: "18px",
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
          {errorInfo.isError && (
            <Typography
              sx={{
                fontFamily: "Poppins, sans-serif",
                color: "red",
                marginTop: "8px",
                textAlign: "center",
              }}
              variant="p"
            >
              {errorInfo.errorMessage}
            </Typography>
          )}
          <Box
              sx={{
                width: ["80%", "60%", "50%", "40%"], // same width as form
                mt: "8px",
                textAlign: "left", // <--- aligns all inner text
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  color: allValid ? "green" : "red",
                  fontSize:"15px"
                }}
                variant="p"
              >
                Password must meet the following requirements:
              </Typography>

              {passwordConstraints.map((constraint, index) => {
                  const isValid = constraint.isValid(userCred.password);
                  return (
                    <Typography
                      key={index}
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: isValid ? "green" : "red",
                        mt: "2px",
                      }}
                      variant="body2"
                    >
                      {isValid ? '✅ ' : '- '} {constraint.text}
                    </Typography>
                  );
                })}

</Box>

          <Button
            disabled={isPending}
            onClick={handleSignUp}
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
              {isPending ? "Signing in" : "Sign Up"}
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
              Already have an account?
            </Typography>
            <Link style={{ textDecoration: "none" }} to="../signin">
              <Typography
                sx={{
                  fontSize: "20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "600",
                  color: "#19acb4",
                }}
                variant="p"
              >
                Sign in
              </Typography>
            </Link>
          </Box>
        </Box>
        <SignUpLoginRightSection
          title={"Welcome Back!"}
          description={"Track and Manage your time on one platform"}
          buttonText={"Sign In"}
          buttonLink={"/signin"}
        />
      </Box>
    </>
  );
}
