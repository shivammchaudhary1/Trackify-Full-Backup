import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  CloseButton,
  LoadingButton,
  SaveButton,
} from "##/src/components/buttons/index.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import {
  getWorkspaceUsers,
  selectUserDetails,
} from "##/src/app/userDetailsSlice";
import {
  fetchClientsforSelectedWorkspace,
  selectClients,
} from "##/src/app/clientSlice";
import { useDispatch, useSelector } from "react-redux";

const UpdateProject = ({ open, onClose, onUpdate, theme, project = {} }) => {
  const [projectName, setProjectName] = useState("");
  const [projectTime, setProjectTime] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  const users = useSelector(selectUserDetails);
  const clients = useSelector(selectClients);

  const dispatchToRedux = useDispatch();

  const handleChange = (event) => {
    setProjectName(event.target.value);
  };

  useEffect(() => {
    if (!project) return;
    setProjectName(project.name || "");
    setProjectTime(project.estimatedHours || "");
    setProjectDescription(project.description || "");
    setClientId(project.client || "");
    setSelectedUsers(project.team || []);
  }, [project]);

  const handleTimeChange = (event) => {
    setProjectTime(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setProjectDescription(event.target.value);
  };

  const handleClientChange = (event) => {
    setClientId(event.target.value);
  };

  const handleUsersChange = (event) => {
    setSelectedUsers(event.target.value);
  };

  const handleSave = async () => {
    setButtonLoading(true);
    await onUpdate({
      projectName,
      projectTime,
      projectDescription,
      client: clientId,
      selectedUsers,
      projectId: project._id,
      timeSpend: project.timeSpend,
    });
    setButtonLoading(false);
    onClose();
  };

  useEffect(() => {
    if (!users.length) {
      dispatchToRedux(getWorkspaceUsers());
    }
    if (!clients.length) {
      dispatchToRedux(fetchClientsforSelectedWorkspace());
    }
  }, []);

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
            fontSize: "18px",
            paddingTop: "10px",
          }}
        >
          Update Project
        </Typography>
        <TextField
          label="Project name"
          onChange={handleChange}
          sx={{ width: "96%" }}
          value={projectName}
          variant="standard"
        />
        <TextField
          label="Project estimated time"
          onChange={handleTimeChange}
          sx={{ width: "96%" }}
          value={projectTime}
          variant="standard"
        />
        <TextField
          label="Project description"
          onChange={handleDescriptionChange}
          sx={{ width: "96%" }}
          value={projectDescription}
          variant="standard"
        />
        {clients.length && (
          <FormControl sx={{ width: "96%" }}>
            <InputLabel>Client</InputLabel>
            <Select
              label="Client"
              onChange={handleClientChange}
              value={clientId ?? ""}
            >
              {clients.map((client) => (
                <MenuItem key={client._id} value={client._id}>
                  {capitalizeFirstWord(client.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl sx={{ width: "96%" }}>
          <InputLabel>Select Team</InputLabel>
          <Select
            multiple
            label="Select Team"
            onChange={handleUsersChange}
            renderValue={(selected) => (
              <div>
                {selected?.map((value, index) => {
                  const user = users.find((user) => user._id === value);
                  if (user) {
                    return (
                      <span key={value}>
                        {capitalizeFirstWord(
                          index === selected.length - 1
                            ? `${users.find((user) => user._id === value)?.name}`
                            : `${users.find((user) => user._id === value)?.name}, `
                        )}
                      </span>
                    );
                    // return index === selected.length - 1
                    //   ? `${users.find((user) => user._id === value)?.name}`
                    //   : `${users.find((user) => user._id === value)?.name}, `;
                  } else return "";
                  return (
                    <span key={value}>
                      {capitalizeFirstWord(
                        selected.length === 1
                          ? `${users.find((user) => user._id === value)?.name}`
                          : `${users.find((user) => user._id === value)?.name}, ` ||
                              ""
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            value={selectedUsers ?? ""}
          >
            {users.length &&
              users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  <Checkbox checked={selectedUsers.includes(user._id)} />
                  <ListItemText primary={capitalizeFirstWord(user.name)} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {buttonLoading ? (
          <LoadingButton theme={theme} />
        ) : (
          <SaveButton onSave={handleSave} theme={theme} />
        )}
        <CloseButton onClose={onClose} theme={theme} />
      </Box>
    </Modal>
  );
};

export default UpdateProject;
