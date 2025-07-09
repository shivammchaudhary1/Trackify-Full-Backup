import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const EditApplyLeaveModal = ({
  open,
  handleClose,
  initialData = {},
  onSubmit,
  theme,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    description: "",
    type: "",
    dailyDetails: [],
    ...initialData,
  });

  useEffect(() => {
    if (initialData && initialData.startDate && initialData.endDate) {
      // Convert date strings to Date objects
      setFormData((prevData) => ({
        ...prevData,
        title: initialData.title,
        numberOfDays: initialData.numberOfDays,
        dailyDetails: initialData.dailyDetails,
        description: initialData.description,
        type: initialData.type,
        startDate: new Date(initialData.startDate).toISOString().split("T")[0],
        endDate: new Date(initialData.endDate).toISOString().split("T")[0],
      }));
    }
  }, [initialData]);

  const handleFieldChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
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
        sx={{
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "10px",
          width: "80%",
          borderRadius: "5px",
          position: "relative",
          paddingBottom: "10px",
        }}
      >
        {" "}
        <Typography
          sx={{
            color: theme.secondaryColor,
            fontSize: "18px",
            padding: "10px",
            textAlign: "center",
          }}
        >
          Update Applied Leave
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            borderRadius: "5px",
            gap: "12px",
            paddingBottom: "10px",
          }}
        >
          <Box>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              onChange={(e) => handleFieldChange("title", e.target.value)}
              value={formData?.title}
            />
            <TextField
              fullWidth
              label="Type"
              margin="normal"
              onChange={(e) => handleFieldChange("title", e.target.value)}
              value={formData?.type}
            />
            <TextField
              fullWidth
              label="Start Date"
              margin="normal"
              onChange={(e) => handleFieldChange("startDate", e.target.value)}
              type="date"
              value={formData?.startDate}
            />
            <TextField
              fullWidth
              label="End Date"
              margin="normal"
              onChange={(e) => handleFieldChange("endDate", e.target.value)}
              type="date"
              value={formData?.endDate}
            />
            <TextField
              fullWidth
              label="Number of Days"
              margin="normal"
              onChange={(e) =>
                handleFieldChange("numberOfDays", e.target.value)
              }
              type="number"
              value={formData?.numberOfDays}
            />
            <TextField
              fullWidth
              multiline
              label="Description"
              margin="normal"
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={4}
              value={formData?.description}
            />
            {/* Assuming dailyDetails is an array of objects with day and duration properties */}
          </Box>
          <Box
            sx={{
              maxHeight: "550px",
              overflow: "auto",
              width: "96%",
            }}
          >
            {formData?.dailyDetails &&
              formData.dailyDetails.map((detail, index) => (
                <Box key={index}>
                  <TextField
                    fullWidth
                    label={`Day ${index + 1}`}
                    margin="normal"
                    onChange={(e) => {
                      const updatedDetails = [...formData.dailyDetails];
                      updatedDetails[index].day = new Date(
                        e.target.value,
                      ).toISOString();
                      handleFieldChange("dailyDetails", updatedDetails);
                    }}
                    type="date"
                    value={new Date(detail.day).toISOString().split("T")[0]}
                  />
                  <TextField
                    fullWidth
                    label={`Duration ${index + 1}`}
                    margin="normal"
                    onChange={(e) => {
                      const updatedDetails = [...formData.dailyDetails];
                      updatedDetails[index].duration = e.target.value;
                      handleFieldChange("dailyDetails", updatedDetails);
                    }}
                    value={detail.duration}
                  />
                </Box>
              ))}
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Button
            onClick={handleSubmit}
            sx={{
              backgroundColor: theme?.secondaryColor,
              paddingLeft: "2.5rem",
              paddingRight: "2.5rem",
              fontWeight: "bold",
              color: "white",
              ":hover": {
                backgroundColor: theme?.secondaryColor,
              },
              marginRight: "1rem",
            }}
            variant="contained"
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditApplyLeaveModal;
