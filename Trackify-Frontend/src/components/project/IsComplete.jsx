import { Box, Button, Modal, Typography } from "@mui/material";
import { useState } from "react";
import { CloseButton } from "##/src/components/buttons/index.js";
import { LoadingButton } from "../buttons/LoadingButton";

const IsCompleteModal = ({
  open,
  handleClose,
  handleConfirm,
  theme,
  title,
  body,
}) => {
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleSubmit = async () => {
    setButtonLoading(true);
    await handleConfirm();
    handleClose();
    setButtonLoading(false);
  };

  return (
    <Modal
      onClose={handleClose}
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
            paddingBottom: "30px",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "#000",
            fontSize: "18px",
            paddingTop: "0px",
            paddingLeft: "10px",
            paddingBottom: "30px",
          }}
        >
          {body}
        </Typography>
        {buttonLoading ? (
          <LoadingButton theme={theme} />
        ) : (
          <Button
            onClick={handleSubmit}
            sx={{
              backgroundColor: theme?.secondaryColor,
              width: "96%",
              fontSize: "16px",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
            }}
            variant="contained"
          >
            Confirm
          </Button>
        )}

        <CloseButton onClose={handleClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default IsCompleteModal;
