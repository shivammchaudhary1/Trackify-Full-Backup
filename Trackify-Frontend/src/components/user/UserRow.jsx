import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Switch,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import { useState, useTransition } from "react";
import {
  selectCurrentTheme,
  selectCurrentWorkspace,
  selectMe,
} from "##/src/app/profileSlice.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { downloadFile } from "##/src/utility/file.utility";

const tableBodyStyle = {
  fontFamily: FONTS.body,
  fontSize: "14px",
  textAlign: "center",
};

function UserRow({ onDelete, onToggle, onStatusChange, user, workspace }) {
  const [isLoading, startTransition] = useTransition();
  const [isLoadingStatusChange, startTransitionStatusChange] = useTransition();
  const workspaceId = useSelector(selectCurrentWorkspace);
  const loggedInUser = useSelector(selectMe);
  const [open, setOpen] = useState(false);
  const theme = useSelector(selectCurrentTheme);

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const isAdmin = user.roles[workspaceId]?.includes("admin");

  async function handleToggle() {
    startTransition(async () => {
      await onToggle(user._id, !isAdmin);
    });
  }

  async function handleToggleStatus() {
    startTransitionStatusChange(async () => {
      await onStatusChange(
        user._id,
        user.statuses[workspaceId] === "active" ? "inactive" : "active"
      );
    });
  }

  const formatAddress = (addr) =>
    [addr?.street, addr?.city, addr?.state, addr?.country, addr?.postalCode]
      .filter(Boolean)
      .join(", ") || "—";

  const formatAsset = (asset) =>
    asset
      ? `${asset.name || ""}${asset.serialNumber ? ` (SN: ${asset.serialNumber})` : ""}`
      : "—";

  return (
    <TableRow>
      <TableCell sx={tableBodyStyle}>
        <Box display="flex" alignItems="center">
          <a href={user.profilePic} target="_blank">
            <Avatar
              src={user.profilePic}
              alt={user.name}
              sx={{ width: 32, height: 32 }}
            />
          </a>
        </Box>
      </TableCell>
      <TableCell sx={tableBodyStyle}>
        <Box display="flex" alignItems="center" gap={1}>
          {capitalizeFirstWord(user.name)}
        </Box>
      </TableCell>

      <TableCell sx={tableBodyStyle}>{user.email}</TableCell>
      <TableCell sx={tableBodyStyle}>{isAdmin ? "Admin" : "User"}</TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {isLoading && <CircularProgress color="inherit" size="2rem" />}
        {!isLoading && (
          <Switch
            disabled={isLoading}
            checked={isAdmin === true}
            onChange={handleToggle}
          />
        )}
      </TableCell>
      <TableCell sx={tableBodyStyle}>
        {capitalizeFirstWord(user.statuses[workspaceId])}
      </TableCell>

      <TableCell sx={{ textAlign: "center" }}>
        {isLoadingStatusChange && (
          <CircularProgress color="inherit" size="2rem" />
        )}
        {!isLoadingStatusChange && (
          <Switch
            disabled={isLoadingStatusChange}
            checked={user.statuses[workspaceId] === "inactive"}
            onChange={handleToggleStatus}
          />
        )}
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        <IconButton
          disabled={user?._id === loggedInUser?._id}
          onClick={() => onDelete(user._id)}
        >
          <DeleteIcon />
        </IconButton>
        <IconButton onClick={handleOpenModal}>
          <VisibilityIcon />
        </IconButton>
      </TableCell>
      {/* <TableCell sx={{ textAlign: "center" }}>
        <IconButton onClick={handleOpenModal}>
          <VisibilityIcon />
        </IconButton>
      </TableCell> */}

      {/* Modal Component */}
      <Dialog
        open={open}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            borderRadius: 3,
            p: 4,
            boxShadow: "0px 8px 24px rgba(0,0,0,0.1)",
            fontFamily: theme.font,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            textAlign: "center",
            fontSize: "1.8rem",
            mb: 2,
            color: theme.secondaryColor,
          }}
        >
          User Profile Overview
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            {/* Header Section */}
            <Grid item xs={12}>
              <Box
                textAlign="center"
                sx={{
                  width: "350px",
                  px: 2,
                  overflow: "hidden",
                }}
              >
                <Avatar
                  src={user.profilePic || "/default-avatar.png"}
                  sx={{
                    width: 100,
                    height: 100,
                    margin: "0 auto",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    px: 1,
                  }}
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    px: 1,
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Grid>

            {/* Identity Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: "#fafafa",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: "inset 0 0 0 1px #eee",
                  width: "350px",
                  minHeight: "250px",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Personal Information
                </Typography>
                {[
                  ["Mobile", user.mobileNumber || "—"],
                  [
                    "Date of Birth",
                    user.dateOfBirth
                      ? new Date(user.dateOfBirth).toLocaleDateString()
                      : "—",
                  ],
                  ["PAN Number", user.panDetails?.number || "—"],
                  ["Aadhaar Number", user.aadharDetails?.number || "—"],
                ].map(([label, value], idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    justifyContent="space-between"
                    py={1}
                  >
                    <Typography variant="body2" color="#666">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Documents Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  backgroundColor: "#fafafa",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: "inset 0 0 0 1px #eee",
                  width: "350px",
                  minHeight: "250px",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Documents
                </Typography>

                {[
                  ["PAN Document", user.panDetails?.documentUrl],
                  ["Aadhaar Document", user.aadharDetails?.documentUrl],
                  ["Resume", user.resume],
                ].map(([label, url], idx) => (
                  <Box
                    key={idx}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={1}
                  >
                    <Typography variant="body2" color="#666">
                      {label}
                    </Typography>
                    {url ? (
                      <Chip
                        icon={<InsertDriveFileIcon />}
                        label="View"
                        onClick={() => downloadFile(url)}
                        sx={{
                          cursor: "pointer",
                          borderColor: theme.secondaryColor,
                          color: theme.secondaryColor,
                          "&:hover": {
                            backgroundColor: theme.secondaryColor,
                            color: "white",
                          },
                        }}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2">—</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Address Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "#fafafa",
                  borderRadius: 2,
                  p: 3,
                  boxShadow: "inset 0 0 0 1px #eee",
                  width: "350px",
                  minHeight: "250px",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Address Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="#666">
                      Current Address
                    </Typography>
                    <Typography>{formatAddress(user.address)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="#666">
                      Permanent Address
                    </Typography>
                    <Typography>
                      {formatAddress(user.permanentAddress)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Assets Section */}

            {/* Assets Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: 2,
                  p: 3,
                  border: "1px solid #e0e0e0",
                  minWidth: "400px",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  gutterBottom
                  sx={{ color: "#2c3e50" }}
                >
                  Assigned Assets
                </Typography>

                {/* Primary Asset */}
                <Typography
                  variant="caption"
                  color="#7f8c8d"
                  display="block"
                  mb={1}
                >
                  PRIMARY ASSET
                </Typography>
                <Box
                  mb={3}
                  sx={{
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: 1,
                    borderLeft: "4px solid #3498db",
                  }}
                >
                  {user.assets?.primaryAsset ? (
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {user.assets.primaryAsset.name || "Unnamed Asset"}
                      </Typography>
                      {user.assets.primaryAsset.serialNumber && (
                        <Box display="flex" alignItems="center" mt={0.5}>
                          <Typography variant="caption" color="#7f8c8d" mr={1}>
                            Serial:
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace">
                            {user.assets.primaryAsset.serialNumber}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2">—</Typography>
                  )}
                </Box>

                {/* Secondary Assets */}
                <Box>
                  <Typography
                    variant="caption"
                    color="#7f8c8d"
                    display="block"
                    mb={1}
                  >
                    SECONDARY ASSETS (
                    {user.assets?.secondaryAssets?.length || 0})
                  </Typography>
                  {user.assets?.secondaryAssets?.length ? (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        maxWidth: "600px",
                        overflowX: "auto",
                      }}
                    >
                      {user.assets.secondaryAssets.map((asset, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 2,
                            backgroundColor: "white",
                            borderRadius: 1,
                            borderLeft: "4px solid #95a5a6",
                          }}
                        >
                          <Typography variant="body1" fontWeight={500}>
                            {asset.name || "Unnamed Asset"}
                          </Typography>

                          <Box display="flex" alignItems="center" mt={0.5}>
                            {asset.serialNumber && (
                              <>
                                <Typography
                                  variant="caption"
                                  color="#7f8c8d"
                                  mr={1}
                                >
                                  Serial:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontFamily="monospace"
                                  mr={2}
                                >
                                  {asset.serialNumber}
                                </Typography>
                              </>
                            )}
                            {asset.assignedDate && (
                              <>
                                <Typography
                                  variant="caption"
                                  color="#7f8c8d"
                                  mr={1}
                                >
                                  Assigned:
                                </Typography>
                                <Typography variant="body2">
                                  {new Date(
                                    asset.assignedDate
                                  ).toLocaleDateString()}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      No secondary assets assigned
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}

export default UserRow;
