import { Box, Modal, TextField, Typography } from "@mui/material";
import {
  CloseButton,
  SaveButton,
  LoadingButton,
} from "##/src/components/buttons/index.js";

const InviteUser = ({
  buttonLoading,
  open,
  onChange,
  onClose,
  onSave,
  theme,
  userEmail,
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
          borderRadius: "5px",
          gap: "12px",
          position: "relative",
          paddingBottom: "10px",
          outlineColor: "transparent",
        }}
      >
        <Typography
          sx={{
            color: theme?.secondaryColor,
            fontSize: "18px",
            paddingTop: "10px",
          }}
        >
          Invite User
        </Typography>
        <TextField
          label="E-mail"
          onChange={(event) => onChange(event.target.value)}
          sx={{ width: "96%" }}
          value={userEmail}
          variant="standard"
        />
        {buttonLoading && <LoadingButton theme={theme} />}
        {!buttonLoading && <SaveButton onSave={onSave} theme={theme} />}
        <CloseButton onClose={onClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default InviteUser;
