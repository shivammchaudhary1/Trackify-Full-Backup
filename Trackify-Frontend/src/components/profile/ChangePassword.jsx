import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useState, useTransition } from "react";
import { useDispatch } from "react-redux";
import { isValidPassword } from "../../utility/miscellaneous/passwordValidation.js";
import {
  changePassword,
  selectCurrentTheme,
  selectMe,
} from "##/src/app/profileSlice.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { useSelector } from "react-redux";
import { AuthContext } from "##/src/context/authcontext.js";

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState({});
  const user = useSelector(selectMe);
  const [isLoading, startTransition] = useTransition();
  const theme = useSelector(selectCurrentTheme);
  const { setLoadingBarProgress } = useContext(AuthContext);

  const dispatchToRedux = useDispatch();
  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPassword({ ...password, [name]: value });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  async function handleChangePassword() {
    if (
      !password.newPassword ||
      !password.currentPassword ||
      password.newPassword !== password.confirmPassword
    ) {
      setNotification(
        "New and confirm password both are required and should be same.",
        "warning"
      );
      return;
    }

    if (!isValidPassword(password.newPassword)) {
      setNotification(
        "Invalid Password, Password should be combination of, letters, number and at least 6 characters ",
        "warning"
      );
      return;
    }

    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        await dispatchToRedux(
          changePassword({
            userId: user._id,
            oldPassword: password.currentPassword,
            password: password.newPassword,
          })
        ).unwrap();
        setNotification("Password Updated Successfully", "success");
        setPassword({});
        setLoadingBarProgress(100);
      } catch (error) {
        setLoadingBarProgress(100);
        handleError("Error updating password, " + error.message);
      }
    });
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Box>
        <Container
          maxWidth="xs"
          style={{
            textAlign: "center",
          }}
        >
          <Box>
            <TextField
              fullWidth
              required
              label="Current Password"
              margin="dense"
              name="currentPassword"
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              value={password.currentPassword || ""}
            />
            <TextField
              fullWidth
              required
              label="New Password"
              margin="dense"
              name="newPassword"
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              value={password.newPassword || ""}
            />
            <TextField
              fullWidth
              required
              label="Confirm Password"
              margin="dense"
              name="confirmPassword"
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              value={password.confirmPassword || ""}
            />
            <Box
              sx={{
                marginTop: "-0.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <Typography variant="subtitle2">Show Password</Typography>
              <IconButton edge="end" onClick={handleTogglePasswordVisibility}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </Box>
          </Box>
          <Box
            style={{
              textAlign: "left",
              marginTop: "10px",
            }}
          >
            <Button
              disabled={isLoading}
              onClick={handleChangePassword}
              sx={{
                backgroundColor: theme.secondaryColor,
                border: "none",
                color: theme.textColor,
                mt: "5px",
                padding: "10px 0",
                ":hover": {
                  backgroundColor: theme.secondaryColor,
                  border: "none",
                  color: theme.textColor,
                },
                width: "100%",
              }}
              variant="outlined"
            >
              {isLoading ? "Password Updating..." : "Update Password"}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ChangePassword;
