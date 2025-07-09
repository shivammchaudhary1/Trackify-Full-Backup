import { Box, Button, Modal, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useSelector } from "react-redux";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";

const DeleteWorkspaceModal = ({ open, handleClose, onSave }) => {
  const theme = useSelector(selectCurrentTheme);

  return (
    <Modal
      onClose={handleClose}
      open={open}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: { xs: "28px 18px", sm: "38px 36px" },
          width: ["92%", "60%", "30%"],
          borderRadius: "18px",
          gap: "22px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        <WarningAmberRoundedIcon sx={{ color: "#e53935", fontSize: 48, mb: 1 }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme?.secondaryColor,
            letterSpacing: 0.5,
            mb: 0.5,
            textAlign: "center",
          }}
        >
          Delete Workspace
        </Typography>
        <Typography
          sx={{
            color: "#333",
            fontSize: "17px",
            textAlign: "center",
            mb: 1,
          }}
        >
          Are you sure you want to <b style={{ color: "#e53935" }}>delete</b> this workspace? This action cannot be undone.
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            width: "100%",
            mt: 1,
          }}
        >
          <Button
            onClick={onSave}
            sx={{
              background: "linear-gradient(90deg, #e53935 0%, #ff7043 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              borderRadius: "8px",
              px: 3,
              minWidth: 120,
              boxShadow: "0 2px 8px rgba(229,57,53,0.12)",
              textTransform: "none",
              ":hover": {
                background: "linear-gradient(90deg, #d32f2f 0%, #ff7043 100%)",
              },
            }}
            variant="contained"
          >
            Yes, Delete
          </Button>
          <Button
            onClick={handleClose}
            sx={{
              background: "#f5f5f5",
              color: theme?.secondaryColor,
              fontWeight: 700,
              fontSize: "16px",
              borderRadius: "8px",
              px: 3,
              minWidth: 120,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              textTransform: "none",
              ":hover": {
                background: "#ececec",
              },
            }}
            variant="contained"
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
export default DeleteWorkspaceModal;