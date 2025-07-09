import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  getWorkspaceUsers,
  selectUserDetails,
} from "##/src/app/userDetailsSlice.js";
import {
  fetchClientsforSelectedWorkspace,
  selectClients,
} from "##/src/app/clientSlice.js";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addClient } from "##/src/app/clientSlice.js";
import { CloseButton, SaveButton } from "##/src/components/buttons/index.js";
import AddClient from "##/src/components/client/AddClient.jsx";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const CreateProject = ({ open, onClose, onSave, theme, user }) => {
  const [projectName, setProjectName] = useState("");
  const [projectTime, setProjectTime] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [client, setClient] = useState("");
  const [clientId, setClientId] = useState("");
  const [isNewClient, setIsNewClient] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientRequestLoading, setClientRequestLoading] = useState(false);

  const users = useSelector(selectUserDetails);
  const clients = useSelector(selectClients);

  const selectAllRef = useRef(null);
  const dispatchToRedux = useDispatch();

  const { setNotification } = useSetNotification();

  const handleNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleTimeChange = (event) => {
    setProjectTime(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setProjectDescription(event.target.value);
  };

  const handleClientChange = (event) => {
    setClient(event.target.value);
  };

  const handleUsersChange = (event) => {
    if (!event.target.value.includes("all")) {
      setSelectedUsers(event.target.value);
    }
  };

  const handleProjectModalOpen = () => {
    setAddProjectModalOpen(true);
  };

  const handleAddClientClose = () => {
    setAddProjectModalOpen(false);
  };

  const handleAddClientSave = async () => {
    setClientRequestLoading(true);
    try {
      await dispatchToRedux(
        addClient({
          clientName: client,
          userId: user._id,
          workspaceId: user.currentWorkspace,
        })
      ).unwrap();
      setIsNewClient(true);
      setAddProjectModalOpen(false);
      setClientRequestLoading(false);
    } catch (error) {
      setClientRequestLoading(false);
      setNotification(`Failed to save client, ${error.message}`, "error");
    }
  };

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedUsers(users.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleMenuItemClick = (event) => {
    if (event.target.tagName !== "INPUT") {
      const allCheckbox = selectAllRef.current;
      allCheckbox.checked = !selectAllRef.current.checked;
      handleSelectAll({ target: allCheckbox });
    }
  };
  const renderUserLabel = (selected) => {
    if (selected.length === users.length) {
      return "All selected";
    } else if (selected.length > 0) {
      return `${selected.length} selected`;
    } else {
      return ["Select Team"];
    }
  };

  const handleSave = async () => {
    if (
      projectName.trim() === "" ||
      projectTime.trim() === "" ||
      projectDescription.trim() === "" ||
      clientId.trim() === "" ||
      selectedUsers.length === 0
    ) {
      setNotification(
        "Please fill in all required fields: Project Name, Project Time, Project Description, Client, and select at least one User.",
        "warning"
      );
      return;
    }
    setLoading(true);
    await onSave(
      projectName,
      projectTime,
      projectDescription,
      clientId,
      selectedUsers
    );
    setLoading(false);
    onClose();
    setProjectName("");
    setProjectTime("");
    setProjectDescription("");
    setClientId("");
    setSelectedUsers([]);
  };

  // setting the client id as selected client after adding a new client
  useEffect(() => {
    if (clients.length && isNewClient) {
      setClientId(clients[clients.length - 1]._id);
      setIsNewClient(false);
    }
  }, [clients, isNewClient]);

  useEffect(() => {
    if (user && users.length && !selectedUsers.length) {
      setSelectedUsers([...selectedUsers, user._id]);
    }
  }, [user, users]);

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
            color: theme?.secondaryColor,
            fontSize: "18px",
            paddingTop: "10px",
          }}
        >
          Add New Project
        </Typography>
        <TextField
          label="Project name"
          onChange={handleNameChange}
          sx={{ width: "96%" }}
          value={projectName}
          variant="standard"
        />
        <TextField
          label="Project estimated time (Hours)"
          onChange={handleTimeChange}
          sx={{ width: "96%" }}
          type="number"
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
        <FormControl sx={{ width: "96%" }}>
          <InputLabel>Client</InputLabel>
          <Select
            label="Client"
            onChange={(event) => setClientId(event.target.value)}
            value={clientId}
          >
            {clients.map((client) => (
              <MenuItem key={client._id} value={client._id}>
                {capitalizeFirstWord(client.name)}
              </MenuItem>
            ))}
            <MenuItem
              onClick={handleProjectModalOpen}
              sx={{ color: theme?.secondaryColor }}
              value=""
            >
              + Add Client
            </MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ width: "96%" }}>
          <InputLabel>Select Team</InputLabel>
          <Select
            multiple
            label="Select Team"
            onChange={handleUsersChange}
            renderValue={(selected) => renderUserLabel(selected)}
            value={selectedUsers}
          >
            <MenuItem
              input={<Checkbox inputRef={selectAllRef} />}
              onClick={handleMenuItemClick}
              value="all"
            >
              <Checkbox
                checked={selectedUsers.length === users.length}
                inputRef={selectAllRef}
                onChange={handleSelectAll}
              />
              <ListItemText primary="Select All" />
            </MenuItem>
            {users.map((u) => {
              return (
                <MenuItem
                  key={u._id}
                  sx={{ marginLeft: "20px", height: "35px" }}
                  value={u._id}
                >
                  <Checkbox checked={selectedUsers.includes(u._id)} />
                  <ListItemText primary={capitalizeFirstWord(u.name)} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {loading ? (
          <Button
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
            <CircularProgress color="inherit" />
          </Button>
        ) : (
          <SaveButton onSave={handleSave} theme={theme} />
        )}
        <CloseButton onClose={onClose} theme={theme} />
        <AddClient
          clientName={client}
          isLoading={clientRequestLoading}
          onChange={handleClientChange}
          onClose={handleAddClientClose}
          onSave={handleAddClientSave}
          open={addProjectModalOpen}
          theme={theme}
        />
      </Box>
    </Modal>
  );
};

export default CreateProject;
