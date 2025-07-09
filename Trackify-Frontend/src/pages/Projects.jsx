import {
  Box,
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { lazy, useCallback, useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectClients } from "##/src/app/clientSlice.js";
import { selectMe } from "##/src/app/profileSlice.js";
import {
  addProject,
  deleteProject as deleteProjectAction,
  getProjects,
  selectProjects,
  updateProject,
} from "##/src/app/projectSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { selectUserDetails } from "##/src/app/userDetailsSlice.js";
import { selectUserRole } from "##/src/app/profileSlice.js";
import CreateProject from "##/src/components/project/AddProject.jsx";
import SkeletonThreeBars from "##/src/components/loading/SkeletonThreeBars.jsx";
const IsCompleteModal = lazy(
  () => import("##/src/components/project/IsComplete.jsx")
);
const DeleteModal = lazy(
  () => import("##/src/components/common/DeleteModal.jsx")
);
const ProjectsTable = lazy(
  () => import("##/src/components/project/ProjectsTable.jsx")
);
const UpdateProject = lazy(
  () => import("##/src/components/project/UpdateProject.jsx")
);
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import LoadWithSuspense from "##/src/components/loading/LoadWithSuspense.jsx";

function Projects({ setProgress }) {
  const [tabValue, setTabValue] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updatedProject, setUpdatedProject] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState({});
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isProjectLoading, startProjectLoadTransition] = useTransition();

  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);

  const user = useSelector(selectMe);
  const clients = useSelector(selectClients);
  const allProjects = useSelector(selectProjects);
  const isAdmin = useSelector(selectUserRole);
  const theme = useSelector(selectCurrentTheme);
  const users = useSelector(selectUserDetails);

  const dispatchToRedux = useDispatch();

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const handleOpenUpdateModal = (project) => {
    setIsUpdateModalOpen(true);
    setUpdatedProject(project);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddProject = async (
    projectName,
    projectTime,
    projectDescription,
    client,
    selectedUsers
  ) => {
    const data = {
      name: projectName,
      workspace: user.currentWorkspace,
      user: user._id,
      client: client,
      estimatedHours: projectTime,
      description: projectDescription,
      team: selectedUsers,
    };
    setProgress(30);
    try {
      await dispatchToRedux(addProject({ data })).unwrap();

      setIsAddModalOpen(false);
      handleCloseModal();
      setNotification("Project Added Successfully", "success");
    } catch (error) {
      handleError(`Error adding project. ${error.message}`);
    }
    setProgress(100);
  };

  const handleUpdateProject = async ({
    projectName,
    projectTime,
    projectDescription,
    projectId,
    client,
    selectedUsers,
    timeSpend,
  }) => {
    if (
      projectName.trim() === "" ||
      projectTime.trim() === "" ||
      projectDescription.trim() === "" ||
      projectId.trim() === "" ||
      client.trim() === "" ||
      selectedUsers.length === 0
    ) {
      setNotification(
        "Please fill in all required fields: Project Name, Project Time, Project Description, Project ID, Client, and select at least one User.",
        "warning"
      );
      return;
    }
    setProgress(30);
    try {
      await dispatchToRedux(
        updateProject({
          projectId,
          name: projectName,
          estimatedHours: projectTime,
          description: projectDescription,
          clientId: client,
          selectedUsers,
          timeSpend,
        })
      ).unwrap();
      handleCloseUpdateModal();
      setUpdatedProject({});
      setNotification("Project Updated Successfully", "success");
    } catch (error) {
      handleError(`Error updating the project, ${error.message}`);
    }
    setProgress(100);
  };

  const handleCompleteProject = (project) => {
    setIsCompleteModalOpen(true);
    setUpdatedProject(project);
  };

  const handleCloseCompleteModal = () => {
    setIsCompleteModalOpen(false);
  };

  const handleConfirmComplete = async () => {
    setProgress(30);
    try {
      await dispatchToRedux(
        updateProject({
          projectId: updatedProject._id,
          toggleIsComplete: true,
          isProjectCompleted: !updatedProject.isCompleted,
        })
      ).unwrap();
      await dispatchToRedux(getProjects()).unwrap();
      setNotification("Project is shift to completed / ongoing", "success");
      handleCloseCompleteModal();
      setUpdatedProject({});
    } catch (error) {
      setProgress(100);
      handleError(`Failed to update project, ${error.message}`);
    }
    setProgress(100);
  };

  const handleOpenDeleteModal = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteProject = async () => {
    setProgress(30);
    setButtonLoading(true);
    try {
      await dispatchToRedux(
        deleteProjectAction({
          projectId: projectToDelete._id,
        })
      ).unwrap();
      handleCloseDeleteModal();
      setNotification("Project Deleted Successfully", "success");
    } catch (error) {
      handleError(`Error deleting project, ${error.message}`);
    }
    setButtonLoading(false);
    setProgress(100);
  };

  const handleUpdateProjectFilters = useCallback(() => {
    const filterOnGoingProjects = allProjects.filter(
      (project) => !project.isCompleted
    );
    const filteredCompletedProjects = allProjects.filter(
      (project) => project.isCompleted
    );

    setOngoingProjects(filterOnGoingProjects);
    setCompletedProjects(filteredCompletedProjects);
  }, [allProjects]);

  useEffect(() => {
    function handleGetProjects() {
      startProjectLoadTransition(async () => {
        try {
          await dispatchToRedux(getProjects()).unwrap();
        } catch (error) {
          handleError(`Failed to get the projects: ${error.message}`);
        }
      });
    }

    if (!allProjects.length || !allProjects[0].client) {
      handleGetProjects();
    }
  }, []);

  useEffect(() => {
    if (!allProjects.length) {
      return;
    }
    handleUpdateProjectFilters();
  }, [allProjects]);

  return (
    <Box>
      <Typography
        fontWeight="bold"
        sx={{
          ml: "25px",
          mt: "50px",
          color: theme?.secondaryColor,
        }}
        variant="h5"
      >
        Projects
      </Typography>
      <CssBaseline />
      <Container maxWidth="100%">
        {isAdmin && (
          <Box
            onClick={handleAdd}
            sx={{
              position: "absolute",
              top: "145px",
              right: "22px",
              cursor: "pointer",
              padding: "7px",
              zIndex: 5,
            }}
          >
            <Typography
              color={theme?.secondaryColor}
              fontWeight="bold"
              variant="h6"
            >
              + Add Project
            </Typography>
          </Box>
        )}

        <Tabs
          TabIndicatorProps={{ sx: { backgroundColor: theme?.secondaryColor } }}
          onChange={handleChangeTab}
          sx={{ mb: "40px", mt: "20px", borderBottom: "1px solid #ddd" }}
          value={tabValue}
        >
          <Tab
            label="Ongoing Projects"
            sx={{
              "&.Mui-selected": {
                color: "#000",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              color: "#5a5a5a",
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          />
          <Tab
            label="Completed Projects"
            sx={{
              "&.Mui-selected": {
                color: "#000",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              color: "#5a5a5a",
              fontSize: "16px",
              textTransform: "capitalize",
            }}
          />
        </Tabs>
        {tabValue === 0 && (
          <LoadWithSuspense>
            <ProjectsTable
              handleCompleteProject={handleCompleteProject}
              handleOpenDeleteModal={handleOpenDeleteModal}
              handleOpenUpdateModal={handleOpenUpdateModal}
              isAdmin={isAdmin}
              projects={ongoingProjects}
              theme={theme}
            />
          </LoadWithSuspense>
        )}
        {tabValue === 1 && !isProjectLoading && (
          <LoadWithSuspense>
            <ProjectsTable
              handleCompleteProject={handleCompleteProject}
              handleOpenDeleteModal={handleOpenDeleteModal}
              handleOpenUpdateModal={handleOpenUpdateModal}
              isAdmin={isAdmin}
              projects={completedProjects}
              theme={theme}
            />
          </LoadWithSuspense>
        )}
      </Container>
      {isAddModalOpen && (
        <LoadWithSuspense>
          <CreateProject
            clients={clients}
            onClose={handleCloseModal}
            onSave={handleAddProject}
            open={isAddModalOpen}
            theme={theme}
            user={user}
            users={users}
          />
        </LoadWithSuspense>
      )}
      {isUpdateModalOpen && (
        <LoadWithSuspense>
          <UpdateProject
            clients={clients}
            onClose={handleCloseUpdateModal}
            onUpdate={handleUpdateProject}
            open={isUpdateModalOpen}
            project={updatedProject}
            theme={theme}
            users={users ?? []}
          />
        </LoadWithSuspense>
      )}
      {isCompleteModalOpen && (
        <LoadWithSuspense>
          <IsCompleteModal
            body={
              updatedProject.isCompleted
                ? "Are you sure you want to mark this project as ongoing?"
                : "Are you sure you want to mark this project as completed?"
            }
            handleClose={handleCloseCompleteModal}
            handleConfirm={handleConfirmComplete}
            open={isCompleteModalOpen}
            theme={theme}
            title={
              updatedProject.isCompleted
                ? "Confirm Ongoing"
                : "Confirm Completion"
            }
          />
        </LoadWithSuspense>
      )}
      {isDeleteModalOpen && (
        <LoadWithSuspense>
          <DeleteModal
            buttonLoading={buttonLoading}
            onClose={handleCloseDeleteModal}
            onDelete={handleDeleteProject}
            open={isDeleteModalOpen}
            text={
              "Project will be removed permanently, Are you sure you want to delete this project?"
            }
            theme={theme}
            title={"Delete Project"}
          />
        </LoadWithSuspense>
      )}
      {isProjectLoading && (
        <SkeletonThreeBars shouldDisplay={isProjectLoading} top="40%" />
      )}
    </Box>
  );
}

export default Projects;
