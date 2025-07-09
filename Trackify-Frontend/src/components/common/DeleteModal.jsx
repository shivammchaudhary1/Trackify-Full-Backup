import { Box, Modal, Typography } from "@mui/material";
import React from "react";
import { CloseButton, DeleteButton } from "##/src/components/buttons/index.js";
import { LoadingButton } from "##/src/components/buttons/LoadingButton.jsx";

const DeleteModal = ({
  open,
  onClose,
  onDelete,
  title,
  text,
  theme,
  buttonLoading,
  content = null,
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
        }}
      >
        <Typography
          sx={{
            color: theme?.secondaryColor,
            textAlign: "left",
            fontSize: "18px",
            paddingTop: "20px",
            paddingBottom: "10px",
          }}
        >
          {title}
        </Typography>

        {content ? (
          content
        ) : (
          <Typography
            sx={{
              color: "#000",
              fontSize: "18px",
              paddingTop: "0px",
              paddingLeft: "10px",
              paddingBottom: "30px",
            }}
          >
            {text}
          </Typography>
        )}

        {buttonLoading && <LoadingButton theme={theme} />}
        {!buttonLoading && <DeleteButton onDelete={onDelete} theme={theme} />}
        <CloseButton onClose={onClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default DeleteModal;
