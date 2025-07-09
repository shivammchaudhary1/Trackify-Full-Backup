import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, IconButton } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeUserWorkspace,
  selectCurrentTheme,
  selectMe,
} from "##/src/app/profileSlice.js";
import { setProjects } from "##/src/app/projectSlice.js";
import {
  selectRunningTimer,
  setEntries,
  setEntryDay,
} from "##/src/app/timerSlice.js";
import { selectUserRole } from "##/src/app/profileSlice.js";
import FetchApi from "##/src/client.js";
import AddWorkspaceModal from "##/src/modals/WorkspaceModal/AddWorkspace.jsx";
import EditWorkspaceModal from "##/src/modals/WorkspaceModal/EditWorkspace.jsx";
import { config } from "##/src/utility/config/config.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import WorkspaceCard from "##/src/components/theme/WorkspaceCard.jsx";
import { setClients } from "##/src/app/clientSlice";
import { setUsers } from "##/src/app/userDetailsSlice";
import { setAdminReport, setUserReport } from "##/src/app/reportSlice";
import { USER_ROLE, USER_STATUS } from "##/src/utility/utility.js";
import { deleteWorkspace } from "##/src/app/workspaceSlice";
import DeleteWorkspaceModal from "##/src/modals/WorkspaceModal/DeleteWorkspace";
import { set } from "date-fns";

const WorkspaceSection = ({
  workspaces,
  currentWorkspaceId,
  isWorkspaceExpanded,
  onCollapse,
  setProgress,
}) => {
  const dispatchToRedux = useDispatch();
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteWorkspaceModalOpen, setDeleteWorkspaceModalOpen] =
    useState(false);
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState(null);
  const [editWorkspace, setEditWorkspace] = useState({});

  const handleOpenEdit = (workspace) => {
    setOpenEdit(true);
    setEditWorkspace(workspace);
  };
  const handleCloseEdit = () => setOpenEdit(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCloseDelete = () => {
    setDeleteWorkspaceModalOpen(false);
    setDeleteWorkspaceId(null);
  };
  const handleOpenDelete = (workspaceId) => {
    setDeleteWorkspaceModalOpen(true);
    setDeleteWorkspaceId(workspaceId);
  };
  const user = useSelector(selectMe);
  const isAdmin = useSelector(selectUserRole);
  const theme = useSelector(selectCurrentTheme);

  const { isRunning } = useSelector(selectRunningTimer);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const changeWorkspace = async (event) => {
    if (isRunning) {
      setNotification("Please stop timer before switch workspace", "error");
      return;
    }
    const workspaceId = event.target.value;
    const date = new Date();
    try {
      const {
        workspace: changedWorkspace,
        projects,
        entries,
        lastEntryDate,
      } = await FetchApi.fetch(
        `${config.api}/api/workspace/workspace-actions/switch/${user._id}/${workspaceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            changeDate: new Date(
              date.getUTCFullYear(),
              date.getUTCMonth(),
              date.getUTCDate()
            ),
          }),
        }
      );

      dispatchToRedux(
        changeUserWorkspace({
          workspaceId: changedWorkspace._id,
          isWorkspaceAdmin: changedWorkspace?.users?.find(
            (workspaceUser) => workspaceUser.user === user._id
          )?.isAdmin,
        })
      );

      dispatchToRedux(setProjects({ projects: projects }));
      dispatchToRedux(setEntries({ entries, lastEntryDate }));
      dispatchToRedux(setClients({ clients: [] }));
      dispatchToRedux(setUsers({ users: [] }));
      dispatchToRedux(setEntryDay({ day: 0 }));
      dispatchToRedux(setUsers({ users: [] }));
      dispatchToRedux(setAdminReport([]));
      dispatchToRedux(setUserReport([]));
      setNotification(
        `Successfully switched to ${capitalizeFirstWord(changedWorkspace.name)}`,
        "success"
      );
    } catch (error) {
      handleError("Failed to change workspace");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (currentWorkspaceId === deleteWorkspaceId) {
      setNotification(
        "You cannot delete the current workspace, please switch to another workspace first.",
        "error"
      );
      return;
    }
    if (isRunning && currentWorkspaceId === deleteWorkspaceId) {
      setNotification("Please stop timer before delete workspace", "error");
      return;
    }
    try {
      await dispatchToRedux(
        deleteWorkspace({ workspaceId: deleteWorkspaceId })
      ).unwrap();
      setNotification("Workspace deleted successfully", "success");
    } catch (error) {
      handleError(`Failed to delete workspace, ${error.message}`);
    }
    handleCloseDelete();
  };
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            onClick={onCollapse}
            sx={{
              paddingBottom: "10px",
              "&:hover": {
                cursor: "pointer",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 0,
              padding: 0,
            }}
          >
            Workspaces
            {isWorkspaceExpanded ? (
              <ArrowDropDownIcon
                sx={{
                  fontSize: "32px",
                  alignSelf: "center",
                  // marginRight: "8px",
                  marginLeft: "36%",
                  // marginLeft: "80px",
                }}
              />
            ) : (
              <ArrowDropUpIcon
                sx={{
                  fontSize: "32px",
                  alignSelf: "center",
                  marginLeft: "36%",
                }}
              />
            )}
          </Box>
        </Box>
        {isWorkspaceExpanded && (
          <Box
            sx={{
              maxHeight: 400,
              overflowY: "scroll",
            }}
          >
            {workspaces.map((workspace) => {
              const shouldDisplayWorkspace =
                user.statuses[workspace._id] === USER_STATUS.ACTIVE;
              const isWorkspaceAdmin = user.roles[workspace._id]?.includes(
                USER_ROLE.ADMIN
              );
              return (
                shouldDisplayWorkspace && (
                  <WorkspaceCard
                    key={workspace._id}
                    workspace={workspace}
                    onChange={changeWorkspace}
                    openEditModal={handleOpenEdit}
                    currentWorkspaceId={currentWorkspaceId}
                    isAdmin={isWorkspaceAdmin}
                    handleOpenDelete={handleOpenDelete}
                  />
                )
              );
            })}
          </Box>
        )}
        {isAdmin && (
          <IconButton
            aria-label="add workspace"
            sx={{
              padding: "7px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginTop: "10px",
              width: "100%",
              backgroundColor: "#ffffff",
              color: "#333333",
              transition: "all 0.3s ease",
              ":hover": {
                color: theme?.secondaryColor,
                borderColor: theme?.secondaryColor,
                backgroundColor: "white",
                boxShadow: "0 3px 4px rgba(0, 0, 0, 0.1)",
              },
              fontSize: "16px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handleOpen}
          >
            <AddIcon sx={{ marginRight: "8px", fontSize: 32 }} />
            Add New Workspace
          </IconButton>
        )}
      </Box>
      {open && isAdmin && (
        <AddWorkspaceModal
          handleClose={handleClose}
          open={open}
          setProgress={setProgress}
        />
      )}
      {openEdit && isAdmin && (
        <EditWorkspaceModal
          handleClose={handleCloseEdit}
          open={openEdit}
          setProgress={setProgress}
          workspace={editWorkspace}
        />
      )}
      {deleteWorkspaceModalOpen && isAdmin && (
        <DeleteWorkspaceModal
          handleClose={handleCloseDelete}
          open={deleteWorkspaceModalOpen}
          onSave={handleDeleteWorkspace}
        />
      )}
    </>
  );
};

export default WorkspaceSection;
