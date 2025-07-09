import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

const BillableFilter = ({ selectedBillable, onSelect }) => {
  const billableOptions = [
    { value: 'All', label: "All" },
    { value: true, label: "Billable" },
    { value: false, label: "Not Billable" }
  ];

  const handleBillableChange = (event) => {
    onSelect(event.target.value);
  };

  const renderBillableLabel = (selected) => {
    if (selected === true) {
      return "Billable";
    } else if (selected === false) {
      return "Not Billable";
    } else {
      return "All";
    }
  };

  return (
    <FormControl sx={{ flex: 1 }}>
      <InputLabel>Select Billable</InputLabel>
      <Select
        renderValue={(selected) => renderBillableLabel(selected)}
        label="Select Billable"
        onChange={handleBillableChange}
         value={selectedBillable}
        variant="standard"
      >
        {billableOptions.map((option, index) => (
          <MenuItem
            key={index}
            value={option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default BillableFilter;