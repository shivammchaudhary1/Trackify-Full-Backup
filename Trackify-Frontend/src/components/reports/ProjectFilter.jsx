import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useCallback, useMemo, useEffect } from "react";

const ProjectFilter = ({ projects, selectedProjects, onSelect }) => {
  const selectedProjectsSet = useMemo(() => {
    return new Set(selectedProjects);
  }, [selectedProjects]);

  const isAllSelected = useMemo(() => {
    return selectedProjects.length === projects.length;
  }, [selectedProjects.length, projects.length]);

  const handleSelectAllProjects = useCallback(() => {
    if (isAllSelected) {
      onSelect([]);
    } else {
      onSelect(projects.map((project) => project._id));
    }
  }, [projects, onSelect, isAllSelected]);

  useEffect(() => {
    if (projects.length && selectedProjects.length === 0) {
      onSelect(projects.map((project) => project._id));
    }
  }, [projects]);

  const handleProjectsChange = useCallback(
    (event) => {
      if (!event.target.value.includes("all")) {
        onSelect(event.target.value);
      }
    },
    [onSelect]
  );

  const renderProjectLabel = useMemo(() => {
    if (selectedProjects.length === projects.length) {
      return "All selected";
    } else if (selectedProjects.length > 0) {
      return `${selectedProjects.length} selected`;
    } else {
      return ["Select Project"];
    }
  }, [projects.length, selectedProjects.length]);

  // const handleMenuItemClick = (event) => {
  //   if (event.target.tagName !== "INPUT") {
  //     const allCheckbox = selectAllProjectsRef.current;
  //     allCheckbox.checked = !selectAllProjectsRef.current.checked;
  //     handleSelectAllProjects({ target: allCheckbox });
  //   }
  // };

  const projectMenuItems = useMemo(() => {
    return projects.map((project) => (
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
  }, [projects, selectedProjectsSet]);

  if (!projects?.length) {
    return null;
  }

  return (
    <FormControl sx={{ flex: 1 }}>
      <InputLabel>Select Project</InputLabel>
      <Select
        multiple
        label="Select Project"
        onChange={handleProjectsChange}
        renderValue={() => renderProjectLabel}
        value={selectedProjects}
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
        <MenuItem value="all" onClick={handleSelectAllProjects}>
          <Checkbox checked={isAllSelected} />
          <ListItemText primary="Select All" />
        </MenuItem>
        {projectMenuItems}
      </Select>
    </FormControl>
  );
};

export default ProjectFilter;
