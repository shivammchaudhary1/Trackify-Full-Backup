import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, Skeleton } from "@mui/material";
import {
  lazy,
  Suspense,
  useContext,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { editTimer, selectWorkspaces } from "##/src/app/workspaceSlice.js";
import {
  selectCurrentWorkspace,
  selectUserRole,
} from "##/src/app/profileSlice.js";
import { nextSlide } from "##/src/app/demoSlice.js";
import ThemeIcon from "##/src/assets/images/icons/themeicon.webp";

import "./theme.css";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { makeSelectWorkspace } from "##/src/app/workspaceSlice.js";
import { AuthContext } from "##/src/context/authcontext.js";

const ColorsSelectionModal = lazy(
  () => import("##/src/components/theme/ColorsSelectionModal.jsx")
);
const WorkspaceSection = lazy(
  () => import("##/src/components/theme/WorkspaceSection.jsx")
);
const ToggleTimerEdit = lazy(
  () => import("##/src/components/theme/ToggleTimerEdit.jsx")
);

const Theme = ({ setProgress }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatchToRedux = useDispatch();
  const workspaces = useSelector(selectWorkspaces);
  const theme = useSelector(selectCurrentTheme);
  const isAdmin = useSelector(selectUserRole);
  const currentWorkspaceId = useSelector(selectCurrentWorkspace);
  const demoState = useSelector((state) => state.demo);

  const [isThemeExpanded, setIsThemeExpanded] = useState(false);
  const [isWorkspaceExpanded, setIsWorkspaceExpanded] = useState(true);

  const [isEditTimerToggleLoading, startTransition] = useTransition();

  const selectWorkspace = useMemo(makeSelectWorkspace, []);
  const currentWorkspace = useSelector((state) =>
    selectWorkspace(state, currentWorkspaceId)
  );

  const { setLoadingBarProgress } = useContext(AuthContext);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  function handleToggle() {
    setIsMenuOpen(!isMenuOpen);

    // Auto-advance demo if on settings slide
    if (demoState?.currentSlide === 5) {
      dispatchToRedux(nextSlide());
    }
  }

  function toggleThemeExpand() {
    if (isWorkspaceExpanded) {
      setIsWorkspaceExpanded(false);
    }
    setIsThemeExpanded(!isThemeExpanded);
  }

  function toggleWorkspaceExpand() {
    if (isThemeExpanded) {
      setIsThemeExpanded(false);
    }
    setIsWorkspaceExpanded(!isWorkspaceExpanded);
  }

  const handleEditToggle = async (e) => {
    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        await dispatchToRedux(
          editTimer({
            workspace: currentWorkspaceId,
            isEditable: e.target.checked,
          })
        ).unwrap();
        setLoadingBarProgress(100);
        setNotification(
          e.target.checked
            ? "Entry editing has been enabled"
            : "Entry editing has been disabled",
          "success"
        );
      } catch (error) {
        setLoadingBarProgress(100);
        handleError("Failed to switch entry editing");
      }
    });
  };

  return (
    <Box>
      {isMenuOpen && (
        <Box
          sx={{
            padding: "0px 10px 10px",
            boxShadow: 3,
            borderTopLeftRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              padding: "10px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box as="h3">Workspace</Box>
            <IconButton onClick={handleToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ width: "250px" }}>
            <Suspense fallback={<Skeleton variant="rectangular" height={40} />}>
              <ColorsSelectionModal
                currentThemeId={theme?.themeId}
                isThemeExpanded={isThemeExpanded}
                onCollapse={toggleThemeExpand}
                setProgress={setProgress}
                workspace={currentWorkspace}
              />
            </Suspense>
            {isAdmin && (
              <Suspense
                fallback={
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    sx={{ marginTop: "10px" }}
                  />
                }
              >
                <ToggleTimerEdit
                  isChecked={currentWorkspace?.isEditable}
                  handleEditToggle={handleEditToggle}
                  toggleLoading={isEditTimerToggleLoading}
                />
              </Suspense>
            )}
            <Suspense
              fallback={
                <Skeleton
                  variant="rectangular"
                  height={40}
                  sx={{ marginTop: "10px" }}
                />
              }
            >
              <WorkspaceSection
                currentWorkspaceId={currentWorkspaceId}
                isWorkspaceExpanded={isWorkspaceExpanded}
                onClose={handleToggle}
                onCollapse={toggleWorkspaceExpand}
                setProgress={setProgress}
                theme={theme}
                workspaces={workspaces}
              />
            </Suspense>
          </Box>
        </Box>
      )}
      {!isMenuOpen && (
        <Box
          sx={{
            width: "50px",
            position: "fixed",
            bottom: "10px",
            right: "10px",
          }}
        >
          <img
            alt="Theme Icon"
            aria-hidden="true"
            className={`dashboard__SettingsIcon image rotate ${
              demoState?.currentSlide === 5 || demoState?.currentSlide === 6
                ? "pulse"
                : ""
            }`}
            height={"100%"}
            onClick={handleToggle}
            src={ThemeIcon}
            width={"100%"}
          />
        </Box>
      )}
    </Box>
  );
};

export default Theme;
