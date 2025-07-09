import { Box, Modal, Typography } from "@mui/material";
import React from "react";
import {
  CloseButton,
  LoadingButton,
  SaveButton,
} from "##/src/components/buttons/index.js";

const ConfirmationDataSaveModal = ({
  isOpen,
  onClose,
  onConfirm,
  theme,
  buttonLoading,
}) => {
  return (
    <Modal
      onClose={onClose}
      open={isOpen}
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
        }}
      >
        <Typography
          sx={{
            color: theme.secondaryColor,
            fontSize: "18px",
            paddingTop: "7px",
            textAlign: "left",
          }}
        >
          Confirm Save Data
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: "18px",
            paddingTop: "20px",
            paddingLeft: "10px",
            width: "100%",
            textAlign: "left",
          }}
        >
          Are you sure you want to save?
        </Typography>
        <Typography
          sx={{
            color: "#000",
            fontSize: "18px",
            paddingLeft: "10px",
            width: "100%",
            textAlign: "left",
            paddingBottom: "30px",
          }}
        >
          After saving user's overtime balance will be added, and further update
          will not be allowed.
        </Typography>
        {buttonLoading ? (
          <LoadingButton theme={theme} />
        ) : (
          <SaveButton onSave={onConfirm} theme={theme} />
        )}
        <CloseButton onClose={onClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default ConfirmationDataSaveModal;
