import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useRef } from "react";
import { extractUniqueClients } from "##/src/utility/report.js";

const FilterClients = ({ allClients, selectedClients, setSelectedClients }) => {
  const selectAllRef = useRef(null);
  // const filteredClient = extractUniqueClients(allClients);
  const filteredClient = allClients;
  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      setSelectedClients(filteredClient.map((client) => client._id));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientsChange = (event) => {
    if (!event.target.value.includes("all")) {
      setSelectedClients(event.target.value);
    }
  };

  const renderClientLabel = (selected) => {
    if (selected.length === filteredClient.length) {
      return "All selected";
    } else if (selected.length > 0) {
      return `${selected.length} selected`;
    } else {
      return ["Select Client"];
    }
  };

  const handleMenuItemClick = (event) => {
    if (event.target.tagName !== "INPUT") {
      const allCheckbox = selectAllRef.current;
      allCheckbox.checked = !selectAllRef.current.checked;
      handleSelectAll({ target: allCheckbox });
    }
  };

  return (
    <FormControl sx={{ flex: 1 }}>
      <InputLabel>Select Client</InputLabel>
      <Select
        multiple
        label="Select Client"
        onChange={handleClientsChange}
        renderValue={(selected) => renderClientLabel(selected)}
        value={selectedClients}
        variant="standard"
      >
        <MenuItem
          input={<Checkbox inputRef={selectAllRef} />}
          onClick={handleMenuItemClick}
          value="all"
        >
          <Checkbox
            checked={selectedClients.length === filteredClient.length}
            inputRef={selectAllRef}
            onChange={handleSelectAll}
          />
          <ListItemText primary="Select All" />
        </MenuItem>
        {filteredClient.map((client) => (
          <MenuItem
            key={client._id}
            sx={{  height: "35px" }}
            value={client._id}
          >
            <Checkbox checked={selectedClients.includes(client._id)} />
            <ListItemText primary={client.name} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterClients;
