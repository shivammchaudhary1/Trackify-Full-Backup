import {
  Box,
  Container,
  CssBaseline,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { lazy, useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import {
  changeUserRole,
  changeUserStatus,
  getWorkspaceUsers,
  inviteUser,
  removeUser,
  selectUserDetails,
} from "##/src/app/userDetailsSlice.js";
import { selectWorkspace } from "##/src/app/workspaceSlice.js";

const DeleteModal = lazy(
  () => import("##/src/components/common/DeleteModal.jsx")
);
const InviteUser = lazy(() => import("##/src/components/user/InviteUser.jsx"));

import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import UserRow from "##/src/components/user/UserRow.jsx";

import LoadWithSuspense from "##/src/components/loading/LoadWithSuspense.jsx";
import SkeletonThreeBars from "##/src/components/loading/SkeletonThreeBars.jsx";

const tableHeadStyle = {
  fontFamily: FONTS.subheading,
  fontSize: "16px",
  fontWeight: "bold",
  textAlign: "center",
  color: "#5a5a5a",
};

const Users = ({ setProgress }) => {
  const dispatchToRedux = useDispatch();
  const [inviteUserModalOpen, setInviteUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isUserRoleChanged, setIsUserRoleChanged] = useState(false);
  const [userInviteEmail, setUserInviteEmail] = useState("");

  const [isLoading, startTransition] = useTransition();
  const [isUserFetching, startUsersFetchTransition] = useTransition();

  const theme = useSelector(selectCurrentTheme);
  const userDetails = useSelector(selectUserDetails);
  const user = useSelector(selectMe);
  const workspace = useSelector(selectWorkspace);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  /**
   * Invite a user to join a workspace.
   * @param {string} email The email address of the user to invite.
   * @returns {Promise<void>}
   */
  async function handleInviteUser() {
    if (!userInviteEmail) {
      setNotification(
        "Please enter an email address before inviting the user",
        "warning"
      );
    }
    setProgress(50);
    startTransition(async () => {
      try {
        await dispatchToRedux(
          inviteUser({
            workspaceId: user.currentWorkspace,
            email: userInviteEmail,
          })
        ).unwrap();
        setNotification("User invited successfully", "success");
        setProgress(100);
        closeInviteUserModel();
      } catch (error) {
        handleError(`Error inviting user, ${error.message}`);
        setProgress(100);
      }
    });
  }

  const handleConfirmDelete = async () => {
    if (userDetails.length === 1) {
      setNotification("Can not delete last user", "warning");
      return;
    }

    startTransition(async () => {
      try {
        setProgress(30);
        await dispatchToRedux(
          removeUser({
            userId: deleteUserId,
            workspaceId: user.currentWorkspace,
          })
        ).unwrap();
        setProgress(100);
        setNotification("User removed successfully", "success");
        setDeleteUserId(null);
        setIsDeleteUserModalOpen(false);
      } catch (error) {
        setProgress(100);
        handleError(`Error removing user, ${error.message}`);
      }
    });
  };

  async function handleChangeUserRole(id, isAdmin) {
    if (!id) {
      return;
    }

    startTransition(async () => {
      try {
        setProgress(30);
        await dispatchToRedux(
          changeUserRole({
            userId: id,
            isAdmin,
          })
        ).unwrap();
        setProgress(100);
        setNotification("User role updated successfully", "success");
        setIsUserRoleChanged(!isUserRoleChanged);
      } catch (error) {
        setProgress(100);
        handleError(`Error updating user role, ${error.message}`);
      }
    });
  }

  async function handleChangeUserStatus(userId, status) {
    try {
      setProgress(30);
      await dispatchToRedux(
        changeUserStatus({
          userId,
          status,
        })
      ).unwrap();
      setProgress(100);
      setNotification("User status updated successfully", "success");
      setIsUserRoleChanged(!isUserRoleChanged);
    } catch (error) {
      setProgress(100);
      handleError(`Error updating user status, ${error.message}`);
    }
  }

  const handleDelete = (id) => {
    setDeleteUserId(id);
    setIsDeleteUserModalOpen(true);
  };

  function openInviteUserModel() {
    setInviteUserModalOpen(true);
  }

  function closeInviteUserModel() {
    setInviteUserModalOpen(false);
    setUserInviteEmail("");
  }

  useEffect(() => {
    function handleGetUsers() {
      startUsersFetchTransition(async () => {
        try {
          await dispatchToRedux(getWorkspaceUsers()).unwrap();
        } catch (error) {
          handleError(`Failed to get users, ${error.message}`);
        }
      });
    }
    if (!userDetails.length) {
      handleGetUsers();
    }
  }, []);

  return (
    <>
      <Typography
        fontWeight="bold"
        sx={{
          ml: "25px",
          mt: "50px",
          color: theme?.secondaryColor,
          mb: "30px",
        }}
        variant="h5"
      >
        Users
      </Typography>
      <CssBaseline />
      <Container maxWidth="100%">
        <Box
          onClick={openInviteUserModel}
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
            + Invite User
          </Typography>
        </Box>
        <TableContainer>
          <Table
            stickyHeader
            aria-label="a dense table"
            size="small"
            sx={{
              boxShadow: "none",
              "& .MuiTableCell-root": {
                padding: "15px 0px",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  borderTop: "1px solid rgba(230, 230, 230, .5)",
                  borderBottom: "1px solid rgba(230, 230, 230, .5)",
                }}
              >
                <TableCell sx={tableHeadStyle}></TableCell>
                <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                  Name
                </TableCell>
                <TableCell sx={tableHeadStyle}>Email</TableCell>
                <TableCell sx={tableHeadStyle}>Role</TableCell>
                <TableCell sx={tableHeadStyle}>Make Admin</TableCell>
                <TableCell sx={tableHeadStyle}>Status</TableCell>
                <TableCell sx={tableHeadStyle}>Make Inactive</TableCell>
                <TableCell sx={tableHeadStyle}>Actions</TableCell>
                {/* <TableCell sx={tableHeadStyle}>View</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {!!userDetails.length &&
                userDetails.map(
                  (user) =>
                    user && (
                      <UserRow
                        key={user._id}
                        onDelete={handleDelete}
                        onToggle={handleChangeUserRole}
                        onStatusChange={handleChangeUserStatus}
                        user={user}
                        workspace={workspace}
                      />
                    )
                )}
              {!userDetails.length && !isUserFetching && (
                <TableRow>
                  <TableCell align="center" colSpan={7}>
                    {userDetails.length === 0
                      ? "No Data to show User Details"
                      : "Unauthorized action: You are not an admin"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      {isDeleteUserModalOpen && (
        <LoadWithSuspense>
          <DeleteModal
            buttonLoading={isLoading}
            onClose={() => setIsDeleteUserModalOpen(false)}
            onDelete={handleConfirmDelete}
            open={isDeleteUserModalOpen}
            text={
              "User will be removed permanently, Are you sure you want to delete this user?"
            }
            theme={theme}
            title={"Delete User"}
          />
        </LoadWithSuspense>
      )}
      {inviteUserModalOpen && (
        <LoadWithSuspense>
          <InviteUser
            buttonLoading={isLoading}
            onChange={setUserInviteEmail}
            onClose={closeInviteUserModel}
            onSave={handleInviteUser}
            open={inviteUserModalOpen}
            theme={theme}
          />
        </LoadWithSuspense>
      )}
      {isUserFetching && <SkeletonThreeBars shouldDisplay={isUserFetching} />}
    </>
  );
};

export default Users;
