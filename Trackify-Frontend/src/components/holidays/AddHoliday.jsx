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
import { useState } from "react";

import {
  CloseButton,
  LoadingButton,
  SaveButton,
} from "##/src/components/buttons/index.js";

const AddHoliday = ({ open, handleClose, handleAddHoliday, theme }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleSubmit = async () => {
    setButtonLoading(true);
    await handleAddHoliday({ title, date, description, type, handleClose });
    setButtonLoading(false);
    setTitle("");
    setDate("");
    setDescription("");
    setType("");
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
          Add New Holiday
        </Typography>
        <TextField
          required
          label="Title"
          onChange={(e) => setTitle(e.target.value)}
          sx={{ width: "96%" }}
          value={title}
          variant="standard"
        />
        <TextField
          required
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
            required
            label="type"
            onChange={(e) => setType(e.target.value)}
            value={type}
          >
            <MenuItem value="Gazetted">Gazetted</MenuItem>
            <MenuItem value="Restricted">Restricted</MenuItem>
          </Select>
        </FormControl>
        {buttonLoading ? (
          <LoadingButton theme={theme} />
        ) : (
          <SaveButton onSave={handleSubmit} theme={theme} />
        )}

        <CloseButton onClose={handleClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default AddHoliday;
