import { Box, Button, Modal, Typography } from "@mui/material";
import { CloseButton } from "##/src/components/buttons/index.js";
import { LoadingButton } from "../buttons/LoadingButton";

const ProfileConfirmationButton = ({
  open,
  onClose,
  onConfirm,
  theme,
  buttonLoading,
}) => {
  return (
    <>
      <>
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
                paddingBottom: "30px",
              }}
            >
              UPDATE PASSWORD
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
              Are you sure you want to update your password?
            </Typography>

            {buttonLoading ? (
              <LoadingButton theme={theme} />
            ) : (
              <Button
                onClick={onConfirm}
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
                Update
              </Button>
            )}
            <CloseButton onClose={onClose} theme={theme} />
          </Box>
        </Modal>
      </>
    </>
  );
};

export default ProfileConfirmationButton;
