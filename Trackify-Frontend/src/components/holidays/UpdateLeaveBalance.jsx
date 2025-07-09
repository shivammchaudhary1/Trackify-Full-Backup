import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLeaveBalances,
  selectHolidayTypes,
  selectLeaveBalances,
  updateLeaveBalance,
  updateLeaveBalanceForAllUsers,
} from "##/src/app/holidaySlice.js";
import { selectMe } from "##/src/app/profileSlice.js";

import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { selectWorkspace } from "##/src/app/workspaceSlice.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import UpdateLeaveBalanceForAllUserModal from "../holidayAndLeaveModal/UpdateLeaveBalanceForAllUser.jsx";
import UpdateLeaveBalanceModal from "../holidayAndLeaveModal/UpdateLeaveBalanceModal.jsx";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const UpdateLeaveBalance = ({ setProgress }) => {
  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);
  const leaveBalances = useSelector(selectLeaveBalances);

  const leaveTypes = useSelector(selectHolidayTypes);

  const [isUpdateLeaveModalOpen, setIsUpdateLeaveModalOpen] = useState(false);
  const [userCurrentLeaveBalance, setUserCurrentLeaveBalance] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [componentLoading, setComponentLoading] = useState(false);
  const [userIdToBeUpdated, setUserIdToBeUpdated] = useState(null);
  // Bulk action
  const [isUpdateAllUsersModalOpen, setIsUpdateAllUsersModalOpen] =
    useState(false);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5a5a5a",
  };

  useEffect(() => {
    const fetchLeaveBalancesForUsers = async () => {
      try {
        setComponentLoading(true);
        setProgress(30);

        await dispatchToRedux(
          getLeaveBalances({
            workspaceId: user?.currentWorkspace,
          })
        );

        setProgress(100);
        setComponentLoading(false);
      } catch (error) {
        setProgress(100);
        setComponentLoading(false);
        handleError("Error getting User's Leave Balances, Try Again");
      }
    };

    if (leaveBalances.length === 0) {
      fetchLeaveBalancesForUsers();
    }
  }, [user?.currentWorkspace]);

  const calculateTotalLeaveBalance = (leaveBalance) => {
    return leaveBalance
      .reduce((total, type) => total + parseFloat(type.value), 0)
      .toFixed(2);
  };

  const handleUpdateLeaveBalance = (leaveBalance) => {
    setIsUpdateLeaveModalOpen(true);
    setUserCurrentLeaveBalance(leaveBalance);
    setUserIdToBeUpdated(leaveBalance.user._id);
  };

  const handleModalSubmit = async ({ leaveType, amount }) => {
    if (!leaveType) {
      setNotification("Please select leave type", "warning");
      return;
    }

    try {
      setProgress(30);
      setButtonLoading(true);
      await dispatchToRedux(
        updateLeaveBalance({
          userId: userIdToBeUpdated,
          workspaceId: user.currentWorkspace,
          leaveType,
          amount,
        })
      ).unwrap();
      setButtonLoading(false);
      closeModal();
      setProgress(100);
      setNotification("Leave balance updated", "success");
    } catch (error) {
      setProgress(100);
      setButtonLoading(false);
      handleError("Failed to update leave");
    }
  };

  const closeModal = () => {
    setIsUpdateLeaveModalOpen(false);
    setUserIdToBeUpdated(null);
    setUserCurrentLeaveBalance(null);
  };

  const handleAddLeaveBalanceForAllUsers = () => {
    setIsUpdateAllUsersModalOpen(true);
  };

  const handleModalSubmitForAll = async (
    setAmount,
    setLeaveType,
    { leaveType, amount }
  ) => {
    if (!leaveType) {
      setNotification("Please select Leave Type", "warning");
      return;
    }

    if (!amount || isNaN(amount)) {
      setNotification("Please enter a valid number for amount", "warning");
      return;
    }

    try {
      setProgress(30);
      setButtonLoading(true);
      await dispatchToRedux(
        updateLeaveBalanceForAllUsers({
          workspaceId: user.currentWorkspace,
          leaveType,
          amount,
        })
      ).unwrap();
      setButtonLoading(false);
      setIsUpdateAllUsersModalOpen(false);
      setProgress(100);
      setAmount(0);
      setLeaveType("");
      setNotification(
        "Leave balances for all users updated successfully",
        "success"
      );
    } catch (error) {
      setProgress(100);
      setButtonLoading(false);
      setAmount(0);
      setLeaveType("");
      handleError("Failed to update leave balances for all users");
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: "0px" }}>
        <Button
          color="inherit"
          onClick={handleAddLeaveBalanceForAllUsers}
          variant="outlined"
        >
          Bulk Action
        </Button>
      </Box>
      <TableContainer>
        <Table
          stickyHeader
          aria-label="a dense table"
          size="small"
          sx={{
            "& .MuiTableCell-root": {
              padding: "10px 0px",
            },
            padding: "10px 0px",
            margin: "10px 0px",
            borderCollapse: "collapse",
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                borderTop: "1px solid #ddd",
                borderBottom: "1px solid #ddd",
              }}
            >
              <TableCell sx={tableHeadStyle}>Employee Name</TableCell>
              <TableCell sx={tableHeadStyle}>Leave Balances</TableCell>
              <TableCell sx={tableHeadStyle}>Total Leave Balance</TableCell>
              <TableCell sx={tableHeadStyle}>Action</TableCell>
            </TableRow>
          </TableHead>
          {!componentLoading && (
            <TableBody>
              {leaveBalances.map((leaveBalance) => {
                return (
                  leaveBalance?.user && (
                    <TableRow key={leaveBalance.user._id}>
                      <TableCell>
                        {capitalizeFirstWord(leaveBalance.user?.name)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex" }}>
                          {leaveBalance.leaveBalance.map((type) => (
                            <Box
                              key={type.type}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                margin: "0 5px",
                                minWidth: "100px",
                                // border: "1px solid red",
                                gap: "5px",
                              }}
                            >
                              <Paper
                                sx={{
                                  padding: "10px",
                                  minWidth: "180px",
                                }}
                              >
                                <Typography sx={{ fontWeight: "bold" }}>
                                  {capitalizeFirstWord(type.title)}{" "}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "space-between",
                                    gap: "20px",
                                  }}
                                >
                                  <Typography>Available:</Typography>
                                  <Typography>{type.value}</Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "space-between",
                                    gap: "20px",
                                  }}
                                >
                                  <Typography>Consumed:</Typography>
                                  <Typography>{type.consumed}</Typography>
                                </Box>
                              </Paper>
                            </Box>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {calculateTotalLeaveBalance(leaveBalance.leaveBalance)}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleUpdateLeaveBalance(leaveBalance)}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                );
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>
      {componentLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {isUpdateLeaveModalOpen && (
        <UpdateLeaveBalanceModal
          buttonLoading={buttonLoading}
          isOpen={isUpdateLeaveModalOpen}
          leaveTypes={leaveTypes}
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          theme={theme}
          userCurrentLeaveBalance={userCurrentLeaveBalance}
        />
      )}
      {isUpdateAllUsersModalOpen && (
        <UpdateLeaveBalanceForAllUserModal
          buttonLoading={buttonLoading}
          isOpen={isUpdateAllUsersModalOpen}
          leaveTypes={leaveTypes}
          onClose={() => setIsUpdateAllUsersModalOpen(false)}
          onSubmit={handleModalSubmitForAll}
          theme={theme}
        />
      )}
    </>
  );
};

export default UpdateLeaveBalance;
