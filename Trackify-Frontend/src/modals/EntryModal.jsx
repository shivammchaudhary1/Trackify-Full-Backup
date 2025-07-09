import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import { useContext, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./entryModal.css";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectProjects } from "##/src/app/projectSlice.js";
import {
  addManualEntry,
  selectEntries,
  updateEntry,
} from "##/src/app/timerSlice.js";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import { areTimeIntervalsNonOverlapping } from "##/src/utility/timer.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { AuthContext } from "##/src/context/authcontext.js";

const EditEntryModal = ({ open, handleClose, entry, theme }) => {
  const dispatchToRedux = useDispatch();
  const projects = useSelector(selectProjects);
  const user = useSelector(selectMe);
  const { setLoadingBarProgress } = useContext(AuthContext);

  const entryData = useSelector(selectEntries);

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    date: "",
    project: "",
    title: "",
    startTime: "",
    endTime: "",
  });
  const [selectProject, setSelectProject] = useState("");
  const [projectId, setProjectId] = useState(entry.project?._id || "");
  const [title, setTitle] = useState(entry.title);
  const [updateDate, setUPdateDate] = useState(
    dayjs(entry.startTime).format("YYYY-MM-DD")
  );

  const [updateStartDate, setUpdateStartDate] = useState(dayjs(entry.startTime).format("YYYY-MM-DD"));
  const [updateEndDate, setUpdateEndDate] = useState(dayjs(entry.endTime).format("YYYY-MM-DD"));
  
  const [isLoading, startTransition] = useTransition();

  // State for time pickers
  const [startTime, setStartTime] = useState(dayjs(entry.startTime));
  const [endTime, setEndTime] = useState(dayjs(entry.endTime));

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };
  const timeFormat = "HH:mm";

  const handleNewEntrySubmit = async () => {
    const normalizedStartTime = dayjs(formData.date)
      .set("hour", formData.startTime.hour())
      .set("minute", formData.startTime.minute());
    const normalizedEndTime = dayjs(formData.date)
      .set("hour", formData.endTime.hour())
      .set("minute", formData.endTime.minute());

    if (
      !isValidNewEntry(
        new Date(formData.date),
        normalizedStartTime,
        normalizedEndTime
      )
    ) {
      return;
    }

    const newEntry = {
      projectId: selectProject._id,
      title: formData.title,
      startTime: normalizedStartTime.toISOString(),
      endTime: normalizedEndTime.toISOString(),
      workspaceId: selectProject.workspace,
      userId: user._id,
    };

    setLoadingBarProgress(35);
    startTransition(async () => {
      try {
        await dispatchToRedux(addManualEntry({ newEntry })).unwrap();
        setNotification("Entry Added Successfully", "success");
        setLoadingBarProgress(100);
        handleClose();
      } catch (error) {
        setLoadingBarProgress(100);
        handleError(`Error adding Entry, ${error.message}`);
      }
    });
  };

  //handle edge cases
  const isValidNewEntry = (selectedDate, startTime, endTime) => {
    const currentDate = new Date();

    if (
      !formData.date ||
      !selectProject ||
      !formData.title ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setNotification(
        "Kindly complete all mandatory fields before proceeding.",
        "warning"
      );
      return false;
    }

    if (selectedDate > currentDate) {
      setNotification("Selected date cannot be in the future.", "warning");
      return false;
    }

    if (startTime > endTime) {
      setNotification("Start time cannot be after end time.", "warning");
      return false;
    }

    return true;
  };

  const handleProjectChange = (event) => {
    const selectedProjectId = event.target.value;
    setSelectProject(selectedProjectId);
  };

  function handleProjectUpdate(event) {
    setProjectId(event.target.value);
  }

  function handleUpdateDateChange(event) {
    setUPdateDate(event.target.value);
  }

  // Update function
  const handleSubmit = async () => {
    const currentTime = dayjs();
    startTransition(async () => {
      try {
        // const normalizedStartTime = dayjs(updateDate)
        //   .set("hour", startTime.hour())
        //   .set("minute", startTime.minute());
        // const normalizedEndTime = dayjs(updateDate)
        //   .set("hour", endTime.hour())
        //   .set("minute", endTime.minute());

        const normalizedStartTime = dayjs(updateStartDate)
          .set("hour", startTime.hour())
          .set("minute", startTime.minute());
        const normalizedEndTime = dayjs(updateEndDate)
          .set("hour", endTime.hour())
          .set("minute", endTime.minute());
        
        if (normalizedEndTime.isAfter(currentTime)) {
          setNotification("Cannot update entry in the future", "warning");
          return;
        }

        if (normalizedEndTime.isBefore(normalizedStartTime)) {
          setNotification("End time cannot be before start time", "warning");
          return;
        }

        const isValidEntryTime = await areTimeIntervalsNonOverlapping(
          normalizedStartTime.toISOString(),
          normalizedEndTime.toISOString(),
          entryData,
          updateDate,
          entry
        );

        if (!isValidEntryTime) {
          setNotification("Time entry should not overlap", "warning");
          return;
        }

        if (isValidEntryTime) {
          setLoadingBarProgress(35);
          await dispatchToRedux(
            updateEntry({
              entry: {
                _id: entry._id,
                title,
                projectId,
                startTime: normalizedStartTime.toISOString(),
                endTime: normalizedEndTime.toISOString(),
              },
            })
          ).unwrap();
          setNotification("Entry updated successfully", "success");
          handleClose();
        }
        setLoadingBarProgress(100);
      } catch (error) {
        console.log(error);
        setLoadingBarProgress(100);
        handleError(`Error updating Entry, ${error.message}`);
      }
    });
  };

  function handleUpdateStartDateChange(event) {
    setUpdateStartDate(event.target.value);
  }
  function handleUpdateEndDateChange(event) {
    setUpdateEndDate(event.target.value);
  }
    
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
          width: "500px",
          borderRadius: "5px",
          gap: "12px",
          position: "relative",
          paddingBottom: "10px",
        }}
      >
        {/* Tabs for Entry and Add New Entry */}
        <Tabs
          TabIndicatorProps={{ sx: { backgroundColor: theme?.secondaryColor } }}
          onChange={(event, newValue) => setTabValue(newValue)}
          sx={{
            mb: "20px",
            textAlign: "left",
            borderBottom: "1px solid #ddd",
          }}
          value={tabValue}
        >
          <Tab
            label="Update Entry Logs"
            sx={{
              "&.Mui-selected": {
                color: "#000",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              fontSize: "16px",
              color: "#5a5a5a",
              textTransform: "capitalize",
            }}
          />
          <Tab
            label="Add Entry Log"
            sx={{
              "&.Mui-selected": {
                color: "#000",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              fontSize: "16px",
              color: "#5a5a5a",
              textTransform: "capitalize",
            }}
          />
        </Tabs>

        {tabValue === 0 && (
          <Container
            sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {/* <TextField
              slotProps={{
                input: {
                  readOnly: false,
                },
              }}
              label="Entry Date"
              type="date"
              onChange={handleUpdateDateChange}
              value={updateDate}
              // variant="filled"
            /> */}

            <TextField
              label="Start Date"
              type="date"
              onChange={handleUpdateStartDateChange}
              value={updateStartDate}
            />
            <TextField
              label="End Date"
              type="date"
              onChange={handleUpdateEndDateChange}
              value={updateEndDate}
            />
            <FormControl variant="standard">
              <InputLabel>Select Project</InputLabel>
              <Select
                label="Project"
                onChange={handleProjectUpdate}
                value={projectId}
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              slotProps={{
                input: {
                  readOnly: false,
                },
              }}
              onChange={(event) => setTitle(event.target.value)}
              label="Title"
              type="text"
              value={
                title
                  ? new DOMParser().parseFromString(title, "text/html").body
                      .textContent
                  : ""
              }
              sx={{
                mt: 2,
              }}
            />
            <Box
              sx={{
                padding: "10px 0px",
                maxHeight: "25vh",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                overflowY: "scroll",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ width: "100%", display: "flex", gap: "10px" }}>
                  <TimePicker
                    className="no-clock-icon"
                    label={`Start Time `}
                    onChange={(newValue) => {
                      setStartTime(dayjs(newValue));
                    }}
                    sx={{ "& input": { width: "50%" } }}
                    value={dayjs(startTime)}
                  />
                  <TimePicker
                    className="no-clock-icon"
                    label={`End Time `}
                    onChange={(newValue) => {
                      setEndTime(dayjs(newValue));
                    }}
                    sx={{ "& input": { width: "50%" }, marginLeft: "10px " }}
                    value={dayjs(endTime)}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
            <SaveButton
              onSave={handleSubmit}
              theme={theme}
              width="100%"
              disabled={isLoading}
            />
            <CloseButton
              cs={{ width: "30px", height: "30px" }}
              onClose={handleClose}
              theme={theme}
            />
          </Container>
        )}

        {tabValue === 1 && (
          <Container
            sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <TextField
              name="date"
              onChange={handleFieldChange}
              type="date"
              value={formData.date}
              variant="standard"
            />
            <FormControl variant="standard">
              <InputLabel>Select Project</InputLabel>
              <Select
                name="project"
                label="Project"
                onChange={handleProjectChange}
                value={selectProject}
              >
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Title"
              name="title"
              onChange={handleFieldChange}
              type="text"
              value={formData.title}
              variant="standard"
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box
                sx={{ width: "100%", display: "flex", gap: "10px", my: "20px" }}
              >
                <TimePicker
                  className="no-clock-icon"
                  label={`Start Time `}
                  onChange={(newValue) => {
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      startTime: dayjs(newValue),
                    }));
                  }}
                  sx={{ "& input": { width: "50%" } }}
                  value={formData.startTime ? dayjs(formData.startTime) : null}
                />
                <TimePicker
                  className="no-clock-icon"
                  label={`End Time `}
                  format="hh:mm A"
                  onChange={(newValue) => {
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      endTime: dayjs(newValue),
                    }));
                  }}
                  sx={{ "& input": { width: "50%" }, marginLeft: "10px " }}
                  value={formData.endTime ? dayjs(formData.endTime) : null}
                />
                {/* <TextField
                name="startTime"
                onChange={handleFieldChange}
                sx={{ width: "50%" }}
                type="time"
                value={formData.startTime}
              />
              <TextField
                name="endTime"
                onChange={handleFieldChange}
                sx={{ width: "50%" }}
                type="time"
                value={formData.endTime}
              /> */}
              </Box>
            </LocalizationProvider>
            <SaveButton
              onSave={handleNewEntrySubmit}
              theme={theme}
              width="100%"
              disabled={isLoading}
            />
            <CloseButton
              cs={{ width: "30px", height: "30px" }}
              onClose={handleClose}
              theme={theme}
            />
          </Container>
        )}
      </Box>
    </Modal>
  );
};

export default EditEntryModal;
