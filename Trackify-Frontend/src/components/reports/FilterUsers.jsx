import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";

import { useCallback, useMemo ,useEffect} from "react";
const FilterUsers = ({ allUsers, selectedUsers, setSelectedUsers }) => {
  const selectedUsersSet = useMemo(() => {
    return new Set(selectedUsers);
  }, [selectedUsers]);

  const isAllSelected = useMemo(() => {
    return selectedUsers.length === allUsers.length;
  }, [selectedUsers.length, allUsers.length]);

  const handleSelectAllUsers = useCallback(() => {
    if (isAllSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(allUsers.map((user) => user._id));
    }
  }, [isAllSelected, allUsers, setSelectedUsers]);

  const handleUsersChange = useCallback(
    (event) => {
      const value = event.target.value;
      if (!value.includes("all")) {
        setSelectedUsers(value);
      }
    },
    [setSelectedUsers]
  );

  useEffect(() => {
  if (allUsers?.length) {
    setSelectedUsers(allUsers.map((user) => user._id));
  }
}, [allUsers]);

  const renderUserLabel = useMemo(() => {
    if (selectedUsers.length === allUsers.length) {
      return "All selected";
    } else if (selectedUsers.length > 0) {
      return `${selectedUsers.length} selected`;
    } else {
      return "Select User";
    }
  }, [selectedUsers.length, allUsers.length]);

  const userMenuItems = useMemo(() => {
    return allUsers.map((user) => (
      <MenuItem
        key={user._id}
        sx={{
          // marginLeft: "20px",
          height: "35px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
        value={user._id}
      >
        <Checkbox checked={selectedUsersSet.has(user._id)} />
        <ListItemText primary={user.name} />
      </MenuItem>
    ));
  }, [allUsers, selectedUsersSet]);

  if (!allUsers?.length) {
    return null;
  }

  return (
    <FormControl sx={{ width: { xs: "100%", md: "30%" } }}>
      <InputLabel>Users</InputLabel>
      <Select
        label="Users"
        multiple
        onChange={handleUsersChange}
        renderValue={() => renderUserLabel}
        value={selectedUsers}
        variant="standard"
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
              width: 250,
            },
          },
          disableScrollLock: true,
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
        }}
      >
        <MenuItem value="all" onClick={handleSelectAllUsers}>
          <Checkbox checked={isAllSelected} />
          <ListItemText primary="Select All" />
        </MenuItem>
        {userMenuItems}
      </Select>
    </FormControl>
  );
};
export default FilterUsers;
