import { Box, Modal, TextField, Typography } from "@mui/material";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import { LoadingButton } from "##/src/components/buttons/LoadingButton.jsx";

const AddClient = ({
  clientName,
  isLoading,
  onClose,
  onChange,
  open,
  onSave,
  theme,
}) => {
  return (
    <Modal
      onClose={onClose}
      open={open}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "10px",
          width: ["80%", "50%", "35%"],
          outlineColor: "transparent",
          borderRadius: "5px",
          gap: "12px",
          position: "relative",
          paddingBottom: "10px",
        }}
      >
        <Typography
          sx={{
            color: theme.secondaryColor,
            fontSize: "16px",
            paddingTop: "10px",
          }}
        >
          Add New Client
        </Typography>
        <TextField
          label="Enter Client name"
          onChange={onChange}
          sx={{ width: "96%" }}
          value={clientName ?? ""}
          variant="standard"
        />
        {!!isLoading && <LoadingButton theme={theme} />}
        {!isLoading && (
          <SaveButton onSave={() => onSave(clientName)} theme={theme} />
        )}
        <CloseButton onClose={onClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default AddClient;
