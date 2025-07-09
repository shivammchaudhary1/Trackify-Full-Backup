import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";

const UpdateHoliday = ({
  open,
  handleClose,
  handleUpdateHoliday,
  theme,
  holidayId,
  selectedHoliday,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    setTitle(selectedHoliday?.title || "");
    const formattedDate = selectedHoliday?.date
      ? new Date(selectedHoliday.date).toISOString().split("T")[0]
      : "";
    setDate(formattedDate);
    setDescription(selectedHoliday?.description || "");
    setType(selectedHoliday?.type || "");
  }, [selectedHoliday]);

  const handleUpdate = () => {
    handleUpdateHoliday({ holidayId, title, date, description, type });
    setTitle("");
    setDate("");
    setDescription("");
    setType("");
    handleClose();
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
        className="modal-content"
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
          Update Holiday
        </Typography>
        <TextField
          label="Title"
          onChange={(e) => setTitle(e.target.value)}
          sx={{ width: "96%" }}
          value={title}
          variant="standard"
        />
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          label="Date"
          onChange={(e) => setDate(e.target.value)}
          sx={{ width: "96%" }}
          type="date"
          value={date}
          variant="standard"
        />
        <TextField
          label="Description"
          onChange={(e) => setDescription(e.target.value)}
          sx={{ width: "96%" }}
          value={description}
          variant="standard"
        />
        <FormControl sx={{ width: "96%" }}>
          <InputLabel>Select Type</InputLabel>
          <Select
            label="type"
            onChange={(e) => setType(e.target.value)}
            value={type}
          >
            <MenuItem value="Gazetted">Gazetted</MenuItem>
            <MenuItem value="Restricted">Restricted</MenuItem>
            {/* <MenuItem value="Other">Other</MenuItem> */}
          </Select>
        </FormControl>
        <SaveButton onSave={handleUpdate} theme={theme} />
        <CloseButton onClose={handleClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default UpdateHoliday;
