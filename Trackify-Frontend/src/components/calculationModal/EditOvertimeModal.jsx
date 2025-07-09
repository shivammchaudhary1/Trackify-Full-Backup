import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";

const EditOvertimeModal = ({
  isOpen,
  onClose,
  overtimeData,
  onUpdate,
  theme,
}) => {
  const [editedOvertime, setEditedOvertime] = useState({
    hours: overtimeData?.overtime.hours || 0,
    minutes: overtimeData?.overtime.minutes || 0,
    seconds: overtimeData?.overtime.seconds || 0,
  });

  const [editedUndertime, setEditedUndertime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setEditedOvertime({
      hours: overtimeData?.overtime.hours || 0,
      minutes: overtimeData?.overtime.minutes || 0,
      seconds: overtimeData?.overtime.seconds || 0,
    });
  }, [overtimeData]);

  useEffect(() => {
    setEditedUndertime({
      hours: overtimeData?.undertime?.hours || 0,
      minutes: overtimeData?.undertime?.minutes || 0,
      seconds: overtimeData?.undertime?.seconds || 0,
    });
  }, [overtimeData]);

  const handleClose = () => {
    onClose();
  };

  const handleUpdate = () => {
    onUpdate({
      ...overtimeData,
      overtime: editedOvertime,
      undertime: editedUndertime,
    });
    onClose();
  };

  return (
    <Modal
      onClose={handleClose}
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
            paddingTop: "10px",
          }}
        >
          Edit Time Adjustments
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextField
            label="Overtime Hours"
            onChange={(e) =>
              setEditedOvertime({
                ...editedOvertime,
                hours: +e.target.value,
              })
            }
            type="number"
            value={editedOvertime.hours}
          />
          <TextField
            label="Overtime Minutes"
            onChange={(e) =>
              setEditedOvertime({
                ...editedOvertime,
                minutes: +e.target.value,
              })
            }
            type="number"
            value={editedOvertime.minutes}
          />
          <TextField
            label="Overtime Seconds"
            onChange={(e) =>
              setEditedOvertime({
                ...editedOvertime,
                seconds: +e.target.value,
              })
            }
            type="number"
            value={editedOvertime.seconds}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextField
            label="Undertime Hours"
            onChange={(e) =>
              setEditedUndertime({
                ...editedUndertime,
                hours: +e.target.value,
              })
            }
            type="number"
            value={editedUndertime.hours}
          />
          <TextField
            label="Undertime Minutes"
            onChange={(e) =>
              setEditedUndertime({
                ...editedUndertime,
                minutes: +e.target.value,
              })
            }
            type="number"
            value={editedUndertime.minutes}
          />
          <TextField
            label="Undertime Seconds"
            onChange={(e) =>
              setEditedUndertime({
                ...editedUndertime,
                seconds: +e.target.value,
              })
            }
            type="number"
            value={editedUndertime.seconds}
          />
        </Box>

        <SaveButton onSave={handleUpdate} theme={theme} />
        <CloseButton onClose={handleClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default EditOvertimeModal;
