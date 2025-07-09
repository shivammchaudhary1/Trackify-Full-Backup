import { PlayArrow, Stop } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  IconButton,
  Input,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import LoadingBar from "react-top-loading-bar";
import {
  Suspense,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Timer from "##/src/components/header/Timer";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import { selectClients } from "##/src/app/clientSlice.js";
import { selectMe } from "##/src/app/profileSlice.js";
import { addProject, selectProjects } from "##/src/app/projectSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import {
  selectRunningTimer,
  inputTextChange,
  setProjectChangeInTimer,
  startTimer,
  stopTimer,
} from "##/src/app/timerSlice.js";
import { selectUserDetails } from "##/src/app/userDetailsSlice.js";
import { changeWorkspace, selectWorkspace } from "##/src/app/workspaceSlice.js";
import { selectUserRole } from "##/src/app/profileSlice.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { AuthContext } from "##/src/context/authcontext.js";
import { getDemoState, nextSlide } from "../../app/demoSlice.js";

// Lazy components
const CreateProject = lazy(
  () => import("##/src/components/project/AddProject.jsx")
);

const Header = () => {
  const theme = useSelector(selectCurrentTheme);
  const workspaceClients = useSelector(selectClients);
  const workspaceProjects = useSelector(selectProjects);
  const user = useSelector(selectMe);
  const workspace = useSelector(selectWorkspace);
  const isAdmin = useSelector(selectUserRole);
  const users = useSelector(selectUserDetails);
  const demoState = useSelector((state) => state.demo);
  const {
    projectId: optionState = "null",
    title: text = "",
    isRunning,
  } = useSelector(selectRunningTimer);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const navigate = useNavigate();
  const { loadingBarProgress, setLoadingBarProgress } = useContext(AuthContext);

  const [isPending, startTransition] = useTransition();
  const { handleError } = useErrorHandler();
  const { setNotification } = useSetNotification();
  const dispatchToRedux = useDispatch();

  const projectOptions = useMemo(
    () =>
      workspaceProjects.map((project) => (
        <MenuItem key={project._id} value={project._id}>
          {capitalizeFirstWord(project.name)}
        </MenuItem>
      )),
    [workspaceProjects]
  );

  const handleOpenAddProjectModal = () => setIsProjectModalOpen(true);
  const handleCloseAddProjectModal = () => setIsProjectModalOpen(false);

  /**
   * Handles the timer title change event and auto-advances demo if on task name slide
   */
  const handleTimerTitleChange = useCallback(
    (event) => {
      dispatchToRedux(inputTextChange({ text: event.target.value }));
      // Auto-advance demo slide if on the task name slide (index 1) and text is entered
      if (demoState?.currentSlide === 1 && event.target.value.trim() !== "") {
        dispatchToRedux(nextSlide());
      }
    },
    [dispatchToRedux, demoState?.currentSlide]
  );

  /**
   * Handles the timer projectId change event and auto-advances demo if on project selection slide
   */
  const handleProjectIdChange = useCallback(
    (event) => {
      if (event.target.value === "add-project") {
        handleOpenAddProjectModal();
      } else {
        dispatchToRedux(
          setProjectChangeInTimer({ option: event.target.value })
        );
        // Auto-advance demo slide if on the project selection slide (index 2) and a project is selected
        if (demoState?.currentSlide === 2 && event.target.value !== "null") {
          dispatchToRedux(nextSlide());
        }
      }
    },
    [dispatchToRedux, demoState?.currentSlide]
  );

  const handleAddProject = async (
    projectName,
    projectTime,
    projectDescription,
    client,
    selectedUsers
  ) => {
    try {
      setLoadingBarProgress(30);
      const { project } = await dispatchToRedux(
        addProject({
          data: {
            name: projectName,
            estimatedHours: projectTime,
            description: projectDescription,
            client,
            team: selectedUsers,
            workspace: user.currentWorkspace,
            user: user._id,
          },
        })
      ).unwrap();
      setLoadingBarProgress(100);
      handleCloseAddProjectModal();
      setNotification("Project Added Successfully", "success");
      dispatchToRedux(
        setProjectChangeInTimer({
          option: project._id,
        })
      );
    } catch (error) {
      setLoadingBarProgress(100);
      handleError("Error adding project. Please try again.");
    }
  };

  /**
   * Handles the timer start action and auto-advances demo if on timer slide
   */
  const handleTimerStart = () => {
    if (!optionState || optionState === "null") {
      return handleError("Please select project");
    }

    const payload = {
      projectId: optionState,
      title: text || "",
    };

    startTransition(async () => {
      try {
        await dispatchToRedux(startTimer(payload)).unwrap();
        // Auto-advance demo slide if on the timer start slide (index 3)
        if (demoState?.currentSlide === 3) {
          dispatchToRedux(nextSlide());
        }
      } catch (error) {
        handleError(`Failed to start the timer, ${error.message}`);
      }
    });
  };

  /**
   * Handles the timer stop action and auto-advances demo if on pause/resume slide
   */
  const handleTimerStop = async () => {
    // Check if the title is not empty
    if (!text) {
      handleError("Please add a title to stop the timer");
      return;
    }

    startTransition(async () => {
      try {
        // Dispatch the stopTimer action with the title and projectId
        await dispatchToRedux(
          stopTimer({ projectId: optionState, title: text })
        ).unwrap();
        // Auto-advance demo slide if on the pause/resume slide (index 4)
        if (demoState?.currentSlide === 4) {
          dispatchToRedux(nextSlide());
        }
      } catch (error) {
        handleError(`Failed to stop the timer, ${error.message}`);
      }
    });
  };

  useEffect(() => {
    async function handleChangeWorkspace(currentWorkspace, currentUser) {
      try {
        dispatchToRedux(
          changeWorkspace({
            workspace: currentWorkspace,
            isWorkspaceAdmin: currentUser.isAdmin,
          })
        );
        dispatchToRedux(setEntryDay({ day: 0 }));
      } catch (error) {
        handleError(`Failed to change workspace: ${error.message}`);
      }
    }
    if (workspace?.workspaces?.length && user) {
      const currentWorkspace = workspace.workspaces.find(
        (workspace) => workspace._id === user.currentWorkspace
      );
      const currentUser = currentWorkspace?.users?.find(
        (workspaceUser) => workspaceUser.user === user._id
      );
      if (currentUser) {
        handleChangeWorkspace(currentWorkspace, currentUser);
      }
    }
  }, [workspace, user, dispatchToRedux]);

  return (
    <>
      {!!loadingBarProgress && (
        <LoadingBar
          color="#f11946"
          height="3px"
          progress={loadingBarProgress}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: theme?.backgroundColor ?? "#fff",
          color: theme?.textColor,
          p: ["10px 10px", "10px 10px", "30px 10px"],
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "left",
          gap: "20px",
          height: "87px",
          position:"sticky",
          top:0,
          zIndex:10
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: ["column", "column", "row"],
            justifyContent: ["flex-start", "flex-start", "space-between"],
            width: ["80%", "70%", "80%"],
            alignItems: ["flex-start", "flex-start", "center"],
            marginLeft: ["10px", "40px", "40px"],
            gap: ["10px", "10px", "30px"],
          }}
        >
          <Box
            sx={{
              position: "fixed",
              top: ["25%", "22%"],
              left: ["10%", "40%", "32%"],
              width: ["80%", "50%", "35%"],
              height: "50vh",
              borderRadius: "5px",
            }}
          >
            {isProjectModalOpen && (
              <Suspense
                fallback={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "70vh",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                }
              >
                <CreateProject
                  clients={workspaceClients}
                  onClose={handleCloseAddProjectModal}
                  onSave={handleAddProject}
                  open={isProjectModalOpen}
                  theme={theme}
                  user={user}
                  users={users}
                />
              </Suspense>
            )}
          </Box>
          <Input
            disableUnderline
            inputProps={{
              "aria-label": "Without label",
            }}
            onChange={handleTimerTitleChange}
            placeholder="What are you working on?"
            sx={{
              width: ["80%", "70%", "30%"],
              color: theme?.textColor,
              fontSize: "18px",
            }}
            value={text}
          />
          <Select
            disableUnderline
            aria-label="select-projects"
            onChange={handleProjectIdChange}
            disabled={isRunning}
            sx={{
              width: ["80%", "80%", "25%"],
              color: theme?.textColor,
              // Target the disabled state for both
              "&.Mui-disabled .MuiSelect-select": {
                color: theme?.textColor,
                WebkitTextFillColor: theme?.textColor,
                opacity: 1,
              },
            }}
            title="Select Project"
            value={optionState === "" ? "null" : optionState}
            variant="standard"
          >
            <MenuItem value="null">Select Project</MenuItem>
            {projectOptions}
            {isAdmin && (
              <MenuItem
                sx={{
                  color: theme?.secondaryColor,
                }}
                value="add-project"
              >
                + Add Project
              </MenuItem>
            )}
          </Select>

          <Timer />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            width: ["20%", "30%", "20%"],
          }}
        >
          {isPending && (
            <CircularProgress
              color="inherit"
              sx={{
                width: "80px",
                height: "80px",
                position: "absolute",
                right: "30px",
                top: "50%",
              }}
            />
          )}
          {!isPending && (
            <IconButton
              disabled={isPending}
              onClick={isRunning ? handleTimerStop : handleTimerStart}
              sx={{
                color: theme?.textColor,
                width: "80px",
                height: "80px",
                position: "absolute",
                right: "10px",
                top: "50%",
                backgroundColor: theme?.secondaryColor,
                boxShadow: "revert",
                ":hover": {
                  backgroundColor: theme?.secondaryColor,
                },
              }}
              variant="contained"
            >
              {isRunning && (
                <Stop
                  sx={{
                    color: theme?.textColor,
                    fontSize: "2em",
                    backgroundColor: theme?.secondaryColor,
                  }}
                />
              )}

              {!isRunning && (
                <PlayArrow sx={{ color: theme?.textColor, fontSize: "2em" }} />
              )}
            </IconButton>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Header;
