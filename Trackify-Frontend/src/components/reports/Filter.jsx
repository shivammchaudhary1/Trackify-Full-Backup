import { Container } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { selectClients } from "##/src/app/clientSlice.js";
import { selectProjects } from "##/src/app/projectSlice.js";
import { selectWorkspace } from "##/src/app/workspaceSlice.js";
import FilterClients from "./FilterClients";
import FilterDateRange from "./FilterDateRange";
import FilterProjects from "./FilterProjects";
import FilterUsers from "./FilterUsers";

const Filter = () => {
  const allClients = useSelector(selectClients);
  const allProjects = useSelector(selectProjects);
  const workspace = useSelector(selectWorkspace);
  const allUsers = workspace.selectedWorkspace?.users || [];

  return (
    <Container
      maxWidth="100%"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}
    >
      <FilterClients allClients={allClients} />
      <FilterProjects allProjects={allProjects} />
      <FilterUsers allUsers={allUsers} />
      <FilterDateRange />
    </Container>
  );
};

export default Filter;
