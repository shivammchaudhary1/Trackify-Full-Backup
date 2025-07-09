import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useCallback, useMemo, useEffect } from "react";

const FilterProjects = ({
  allProjects,
  selectedProjects,
  setSelectedProjects,
}) => {
  const selectedProjectsSet = useMemo(() => {
    return new Set(selectedProjects);
  }, [selectedProjects]);

  const isAllSelected = useMemo(() => {
    return selectedProjects.length === allProjects.length;
  }, [selectedProjects.length, allProjects.length]);

  const handleSelectAllProjects = useCallback(() => {
    if (isAllSelected) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(allProjects.map((project) => project._id));
    }
  }, [isAllSelected, allProjects, setSelectedProjects]);

  useEffect(() => {
    if (allProjects?.length && selectedProjects.length === 0) {
      setSelectedProjects(allProjects.map((project) => project._id));
    }
  }, [allProjects]);

  const handleProjectsChange = useCallback(
    (event) => {
      const value = event.target.value;
      if (!value.includes("all")) {
        setSelectedProjects(value);
      }
    },
    [setSelectedProjects]
  );

  const renderProjectLabel = useMemo(() => {
    if (selectedProjects.length === allProjects.length) {
      return "All selected";
    } else if (selectedProjects.length > 0) {
      return `${selectedProjects.length} selected`;
    } else {
      return "Select Project";
    }
  }, [allProjects.length, selectedProjects.length]);

  // const handleMenuItemClick = (event) => {
  //   if (event.target.tagName !== "INPUT") {
  //     const allCheckbox = selectAllProjectsRef.current;
  //     allCheckbox.checked = !selectAllProjectsRef.current.checked;
  //     handleSelectAllProjects({ target: allCheckbox });
  //   }
  // };

  const projectMenuItems = useMemo(() => {
    return allProjects.map((project) => (
      <MenuItem
        key={project._id}
        sx={{
          // marginLeft: "20px",
          height: "35px",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
        value={project._id}
      >
        <Checkbox
          checked={selectedProjectsSet.has(project._id)}
          onClick={(e) => e.stopPropagation()}
        />
        <ListItemText primary={project.name} />
      </MenuItem>
    ));
  }, [allProjects, selectedProjectsSet]);

  if (!allProjects?.length) {
    return null;
  }

  return (
    <FormControl sx={{ flex: 1, minWidth: 200 }}>
      <InputLabel>Select Project</InputLabel>
      <Select
        multiple
        label="Select Project"
        onChange={handleProjectsChange}
        renderValue={() => renderProjectLabel}
        value={selectedProjects}
        variant="standard"
        // Performance optimizations for MUI Select
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
        <MenuItem
          value="all"
          onClick={handleSelectAllProjects}
          sx={{
            backgroundColor: "#f5f5f5",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          <Checkbox checked={isAllSelected} />
          <ListItemText primary="Select All" />
        </MenuItem>
        {projectMenuItems}
      </Select>
    </FormControl>
  );
};

export default FilterProjects;
