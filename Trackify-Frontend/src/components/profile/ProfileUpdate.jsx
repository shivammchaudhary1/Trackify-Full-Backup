import React, { useContext, useEffect, useState, useTransition } from "react";
import {
  Box,
  Button,
  Container,
  Avatar,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Link,
  Divider,
  TextField,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from '@mui/icons-material/Delete';
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentTheme,
  selectMe,
  updateProfile,
} from "##/src/app/profileSlice.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { AuthContext } from "##/src/context/authcontext.js";
import FetchApi from "##/src/client.js";
import { config } from "##/src/utility/config/config.js";
import { downloadFile, uploadFile } from "##/src/utility/file.utility";

function initializeUserInfo(user) {
  return {
    name: user?.name || "",
    dob: user?.dateOfBirth?.split("T")[0] || "1900-01-01",
    email: user?.email || "",
    mobileNumber: user?.mobileNumber || "",
    address:
      typeof user?.address === "object" && user?.address !== null
        ? user.address
        : { street: "", city: "", state: "", country: "", postalCode: "" },
    permanentAddress:
      typeof user?.permanentAddress === "object" &&
      user?.permanentAddress !== null
        ? user.permanentAddress
        : { street: "", city: "", state: "", country: "", postalCode: "" },
    panNumber: user?.panDetails?.number || "",
    aadharNumber: user?.aadharDetails?.number || "",
    resumeUrl: user?.resumeUrl || null,
  };
}

const ProfileUpdate = () => {
  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);
  const [userInfo, setUserInfo] = useState(initializeUserInfo(user));
  const [isLoading, startTransition] = useTransition(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState(null);
  const [selectedPanDoc, setSelectedPanDoc] = useState(null);
  const [selectedAadharDoc, setSelectedAadharDoc] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const { setLoadingBarProgress } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { handleError } = useErrorHandler();
  const { setNotification } = useSetNotification();

  const [hasChanges, setHasChanges] = useState(false);

  // Helper to deeply compare two objects (shallow for files)
  function deepEqual(a, b) {
    if (typeof a !== typeof b) return false;
    if (typeof a !== "object" || a === null || b === null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (let key of aKeys) {
      if (!b.hasOwnProperty(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  // Remove file objects from comparison, only compare URLs for originals
  function getComparableState() {
    return {
      userInfo,
      selectedProfilePic: selectedProfilePic ? true : false,
      selectedPanDoc: selectedPanDoc ? true : false,
      selectedAadharDoc: selectedAadharDoc ? true : false,
      selectedResume: selectedResume ? true : false,
    };
  }

  function getOriginalState() {
    return {
      userInfo: initializeUserInfo(user),
      selectedProfilePic: false,
      selectedPanDoc: false,
      selectedAadharDoc: false,
      selectedResume: false,
    };
  }

  // Global change detection effect
  useEffect(() => {
    setHasChanges(!deepEqual(getComparableState(), getOriginalState()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userInfo,
    selectedProfilePic,
    selectedPanDoc,
    selectedAadharDoc,
    selectedResume,
    user,
  ]);

  // Unified handler for all userInfo fields (including nested address fields)
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => {
      // Handle nested fields (address, permanentAddress)
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        };
      }
      // Flat fields
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // Unified handler for file fields
  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification("File size should be less than 5MB", "warning");
        return;
      }
      setter(file);
    } else {
      setter(null); // Allow clearing file
    }
  };

  const handleUpdateProfile = () => {
    // Prepare a plain object for JSON.stringify
    const updates = {
      name: userInfo.name,
      dob: userInfo.dob,
      mobileNumber: userInfo.mobileNumber,
      address: userInfo.address,
      panNumber: userInfo.panNumber,
      aadharNumber: userInfo.aadharNumber,
      permanentAddress: userInfo.permanentAddress,
      // For files, send null or a placeholder if needed (API will ignore)
      profilePic: selectedProfilePic ? "__file__" : null,
      panDocument: selectedPanDoc ? "__file__" : null,
      aadharDocument: selectedAadharDoc ? "__file__" : null,
      resume: selectedResume ? "__file__" : null,
    };

    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        const result = await dispatch(updateProfile(updates)).unwrap();
        setUserInfo(initializeUserInfo(result.user));
        setLoadingBarProgress(100);
        setNotification("Profile Updated Successfully", "success");
        setSelectedProfilePic(null);
        setSelectedPanDoc(null);
        setSelectedAadharDoc(null);
        setSelectedResume(null);
      } catch (error) {
        setLoadingBarProgress(100);
        handleError("Failed to update profile: " + error.message);
      }
    });
  };

  async function handleUploadProfilePicture(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const { signedURL: userToUpload } = await FetchApi.fetch(
        `${config.api}/api/profile/picture`,
        {
          method: "PUT",
          body: { fileName: file.name },
        }
      );

      await fetch(userToUpload, {
        method: "PUT",
        body: file,
      });

      if (user.profilePic) {
        const url = new URL(`${config.api}/api/profile/picture`);

        url.search = new URLSearchParams({
          file: user.profilePic.split(".com/").pop(),
        }).toString();

        const { signedURL } = await FetchApi.fetch(url, {
          method: "DELETE",
        });

        await fetch(signedURL, {
          method: "DELETE",
        });
      }

      dispatch(updateProfile({ profilePic: userToUpload.split("?")[0] }));
      setNotification("Profile picture updated successfully!");
    } catch (error) {
      handleError("Failed to upload profile picture." + error.message);
    }
  }

  async function uploadDocument(event, type) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const { value } = await uploadFile(file, handleError);
      await dispatch(updateProfile({ [type]: { path: value } })).unwrap();
    } catch (error) {
      handleError("Failed to upload Pan document." + error.message);
    }
  }

  useEffect(() => {
    if (user) {
      setUserInfo(initializeUserInfo(user));
      setSelectedProfilePic(null);
      setSelectedPanDoc(null);
      setSelectedAadharDoc(null);
      setSelectedResume(null);
      setHasChanges(false);
    }
  }, [user]);

  const renderFileInput = (
    label,
    id,
    selectedFile,
    setter,
    accept,
    existingUrl
  ) => {
    if (id === "profile-pic-input") {
      return (
        <Box mt={2} textAlign="center">
          <input
            accept={accept}
            style={{ display: "none" }}
            id={id}
            type="file"
            onChange={handleUploadProfilePicture}
          />
          <label htmlFor={id}>
            <Button
              variant="outlined"
              component="span"
              sx={{
                textTransform: "none",
                borderRadius: "20px",
                px: 3,
                py: 1,
              }}
            >
              {selectedFile || existingUrl
                ? "Change Profile Picture"
                : "Upload Profile Picture"}
            </Button>
          </label>
        </Box>
      );
    }

    return (
      <Box >
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        {selectedFile || existingUrl ? (
          <Box display="flex" alignItems="center" gap={1}>
            <Link
              onClick={() => downloadFile(existingUrl)}
              target="_blank"
              underline="hover"
              sx={{
                cursor: "pointer",
                color: "primary.main",
                "&:hover": {
                  color: "primary.dark",
                },
              }}
            >
              {selectedFile
                ? selectedFile.name
                : typeof existingUrl === "string"
                  ? existingUrl.split("/").pop()
                  : "No file"}
            </Link>
            <input
              accept={accept}
              style={{ display: "none" }}
              id={id}
              type="file"
              onChange={(e) => uploadDocument(e, setter)}
            />
            <label htmlFor={id}>
              <IconButton
                size="small"
                component="span"
                sx={{
                  backgroundColor: "action.hover",
                  "&:hover": {
                    backgroundColor: "action.selected",
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </label>
          </Box>
        ) : (
          <>
            <input
              accept={accept}
              style={{ display: "none" }}
              id={id}
              type="file"
              onChange={(e) => uploadDocument(e, setter)}
            />
            <label htmlFor={id}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFileIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: "20px",
                  px: 3,
                  py: 1,
                }}
              >
                Upload {label}
              </Button>
            </label>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            gap={4}
            p={3}
          >
            {/* Personal Info Section */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 2,
                backgroundColor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  pb: 2,
                  color: "text.primary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                Personal Information
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                my={3}
              >
                <Avatar
                  src={
                    selectedProfilePic
                      ? URL.createObjectURL(selectedProfilePic)
                      : user.profilePic
                  }
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    cursor: user.profilePic ? "pointer" : "default",
                    border: "2px solid",
                    borderColor: "primary.main",
                  }}
                  onClick={() =>
                    user.profilePic && window.open(user.profilePic, "_blank")
                  }
                />
                {renderFileInput(
                  "Profile Picture",
                  "profile-pic-input",
                  selectedProfilePic,
                  setSelectedProfilePic,
                  "image/*",
                  user.profilePic
                )}
              </Box>

              <TextField
                fullWidth
                label="Name"
                margin="normal"
                name="name"
                onChange={handleUserInfoChange}
                value={capitalizeFirstWord(userInfo.name)}
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={user.email}
                variant="outlined"
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-input": {
                    backgroundColor: "action.hover",
                  },
                }}
              />

              <TextField
                fullWidth
                label="Mobile"
                margin="normal"
                name="mobileNumber"
                onChange={handleUserInfoChange}
                value={userInfo.mobileNumber}
                variant="outlined"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                margin="normal"
                name="dob"
                InputLabelProps={{ shrink: true }}
                onChange={handleUserInfoChange}
                value={userInfo.dob}
                variant="outlined"
              />
            </Paper>

            {/* Address Section */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 2,
                backgroundColor: "background.paper",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  pb: 2,
                  color: "text.primary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                Address Information
              </Typography>

              <Box mt={3}>
                <Box mb={4}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    mb={2}
                    sx={{
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      "&:before": {
                        content: '""',
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 1,
                      },
                    }}
                  >
                    Current Address
                  </Typography>

                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Street"
                      name="address.street"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.address.street}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="City"
                      name="address.city"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.address.city}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="State"
                      name="address.state"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.address.state}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" gap={2}>
                    <TextField
                      label="Country"
                      name="address.country"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.address.country}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Postal Code"
                      name="address.postalCode"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.address.postalCode}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Divider
                  sx={{
                    my: 3,
                    "&:before, &:after": {
                      borderColor: "divider",
                    },
                  }}
                />

                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    mb={2}
                    sx={{
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      "&:before": {
                        content: '""',
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "primary.main",
                        mr: 1,
                      },
                    }}
                  >
                    Permanent Address
                  </Typography>

                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="Street"
                      name="permanentAddress.street"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.permanentAddress.street}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="City"
                      name="permanentAddress.city"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.permanentAddress.city}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="State"
                      name="permanentAddress.state"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.permanentAddress.state}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  <Box display="flex" gap={2}>
                    <TextField
                      label="Country"
                      name="permanentAddress.country"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.permanentAddress.country}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Postal Code"
                      name="permanentAddress.postalCode"
                      margin="normal"
                      onChange={handleUserInfoChange}
                      value={userInfo.permanentAddress.postalCode}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Documents Section */}
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 2,
                backgroundColor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  pb: 2,
                  color: "text.primary",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                Documents
              </Typography>

              <Box mt={3}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  mb={2}
                  sx={{ color: "text.secondary" }}
                >
                  PAN Card
                </Typography>

                <TextField
                  fullWidth
                  label="PAN Number"
                  name="panNumber"
                  margin="normal"
                  onChange={handleUserInfoChange}
                  value={userInfo.panNumber}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                {renderFileInput(
                  "PAN Document",
                  "pan-doc-input",
                  selectedPanDoc,
                  "panDocument",
                  "image/*,.pdf",
                  user.panDetails?.documentUrl
                )}
              </Box>

              <Box mt={4}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  mb={2}
                  sx={{ color: "text.secondary" }}
                >
                  Aadhar Card
                </Typography>

                <TextField
                  fullWidth
                  label="Aadhar Number"
                  name="aadharNumber"
                  margin="normal"
                  onChange={handleUserInfoChange}
                  value={userInfo.aadharNumber}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                {renderFileInput(
                  "Aadhar Document",
                  "aadhar-doc-input",
                  selectedAadharDoc,
                  "aadharDocument",
                  "image/*,.pdf",
                  user.aadharDetails?.documentUrl
                )}
              </Box>

              <Box mt={4}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  mb={2}
                  sx={{ color: "text.secondary" }}
                >
                  Resume
                </Typography>

                {renderFileInput(
                  "Resume",
                  "resume-input",
                  selectedResume,
                  "resume",
                  ".pdf,.doc,.docx",
                  user.resume
                )}
              </Box>
            </Paper>
          </Box>

          {/* Fixed Action Bar */}
          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              pb: 2,
              px: 4,
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Button
              disabled={isLoading || !hasChanges}
              onClick={handleUpdateProfile}
              variant="contained"
              size="large"
              sx={{
                minWidth: 200,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: hasChanges
                  ? theme?.secondaryColor || "primary.main"
                  : "action.disabled",
                color: theme?.textColor || "common.white",
                "&:hover": {
                  backgroundColor: theme?.secondaryColor
                    ? `${theme.secondaryColor}99`
                    : "primary.dark",
                },
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "text.disabled",
                },
                transition: "all 0.3s ease",
              }}
              startIcon={
                isLoading ? (
                  <CircularProgress
                    size={22}
                    color="inherit"
                    thickness={5}
                    sx={{
                      color: "inherit",
                    }}
                  />
                ) : null
              }
            >
              {isLoading ? "Saving Changes..." : "Update Profile"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfileUpdate;
