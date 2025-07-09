import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLeaveType,
  deleteLeaveType,
  getHolidayTypes,
  selectHolidayTypes,
  updateLeaveType,
} from "##/src/app/holidaySlice.js";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import DeleteModal from "##/src/components/common/DeleteModal.jsx";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import AddLeaveTypeModal from "../holidayAndLeaveModal/AddLeaveTypeModal";
import UpdateLeaveTypeModal from "../holidayAndLeaveModal/UpdateLeaveTypeModal";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { AuthContext } from "##/src/context/authcontext.js";

const LeaveType = () => {
  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [leaveTypeToDelete, setLeaveTypeToDelete] = useState("");
  const { setLoadingBarProgress: setProgress } = useContext(AuthContext);

  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
  const leaveTypes = useSelector(selectHolidayTypes);
  const theme = useSelector(selectCurrentTheme);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
    textAlign: "center",
  };
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5a5a5a",
    textAlign: "center",
  };

  //ADD Leave Type
  const handleAddLeaveType = async ({
    leaveType: newLeaveType,
    leaveTitle,
  }) => {
    if (newLeaveType.trim() === "" || leaveTitle.trim() === "") {
      setNotification("Please Add Leave Type and Leave Title", "warning");
      return;
    }

    try {
      setProgress(30);
      await dispatchToRedux(
        addLeaveType({
          userId: user._id,
          leaveType: newLeaveType,
          leaveTitle,
        })
      ).unwrap();

      setProgress(100);
      setNotification("Leave type successfully added", "success");
    } catch (error) {
      setProgress(100);
      handleError(`Failed to add leave type, ${error.message}`);
    }
  };

  const handleUpdateLeaveType = async (
    { leaveType, paid, isActive, leaveTitle },
    handleClose,
    setLoading
  ) => {
    try {
      setProgress(30);
      setLoading(true);
      await Promise.all([
        dispatchToRedux(
          updateLeaveType({
            userId: user._id,
            newLeaveType: leaveType,
            oldLeaveType: selectedLeaveType.leaveType,
            paid: paid,
            isActive: isActive,
            title: leaveTitle,
          })
        ).unwrap(),
        dispatchToRedux(getHolidayTypes({ userId: user._id })).unwrap(),
      ]);
      setProgress(100);
      setLoading(false);
      handleClose();
      setNotification("Leave type successfully updated", "success");
    } catch (error) {
      setProgress(100);
      setLoading(false);
      handleError(`Failed to update leave type, ${error.message}`);
    }
  };

  //DELETE LEAVE TYPE
  const handleDeleteLeaveType = async () => {
    try {
      if (leaveTypeToDelete) {
        setProgress(30);
        await dispatchToRedux(
          deleteLeaveType({
            userId: user._id,

            leaveType: leaveTypeToDelete.leaveType,
          })
        ).unwrap();
      }
      setProgress(100);
      setDeleteModalOpen(false);
      setLeaveTypeToDelete("");
      setNotification("Leave type successfully deleted", "success");
    } catch (error) {
      setProgress(100);
      setDeleteModalOpen(false);
      setLeaveTypeToDelete("");
      handleError(`Failed to delete leave type, ${error.message}`);
    }
  };

  const handleOpenModal = () => {
    setIsLeaveTypeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLeaveTypeModalOpen(false);
  };

  const handleUpdateModalOpen = (leaveType) => {
    setIsUpdateModalOpen(true);
    setSelectedLeaveType(leaveType);
  };
  const handleEdit = (leaveType) => {
    handleUpdateModalOpen(leaveType);
  };

  const handleDelete = (leaveType) => {
    setDeleteModalOpen(true);
    setLeaveTypeToDelete(leaveType);
  };

  return (
    <Box>
      <TableContainer sx={{ maxHeight: "60vh" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: "20px" }}>
          <Button color="inherit" onClick={handleOpenModal} variant="outlined">
            Add Type
          </Button>
        </Box>

        <Table
          stickyHeader
          aria-label="a dense table"
          size="small"
          sx={{
            "& .MuiTableCell-root": {
              padding: "10px 0px",
            },
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                borderTop: "1px solid #ddd",
                borderBottom: "1px solid #ddd",
              }}
            >
              <TableCell
                sx={{
                  fontFamily: FONTS.subheading,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#5a5a5a",
                }}
              >
                Type
              </TableCell>
              <TableCell sx={tableHeadStyle}> Status</TableCell>
              <TableCell sx={tableHeadStyle}> Paid/Unpaid</TableCell>
              <TableCell sx={tableHeadStyle}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveTypes?.map((leaveType) => {
              return (
                <TableRow key={leaveType.leaveType}>
                  <TableCell sx={{ fontFamily: FONTS.body, fontSize: "14px" }}>
                    {capitalizeFirstWord(leaveType.title)}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {leaveType.isActive ? "Enabled" : "Disabled"}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {leaveType.paid ? "Paid" : "Unpaid"}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    <IconButton onClick={() => handleEdit(leaveType)}>
                      <EditOutlinedIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(leaveType)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {isLeaveTypeModalOpen && (
        <AddLeaveTypeModal
          handleAddLeaveType={handleAddLeaveType}
          onClose={handleCloseModal}
          open={isLeaveTypeModalOpen}
          theme={theme}
        />
      )}
      {isUpdateModalOpen && (
        <UpdateLeaveTypeModal
          handleClose={() => setIsUpdateModalOpen(false)}
          handleUpdateLeaveType={handleUpdateLeaveType}
          initialLeaveType={selectedLeaveType}
          open={isUpdateModalOpen}
          theme={theme}
        />
      )}
      {deleteModalOpen && (
        <DeleteModal
          onClose={() => setDeleteModalOpen(false)}
          onDelete={handleDeleteLeaveType}
          open={deleteModalOpen}
          text={
            "Leave Type and its data will be removed permanently. Are you sure you want to delete this type?"
          }
          theme={theme}
          title={"Delete Leave Type"}
        />
      )}
    </Box>
  );
};

export default LeaveType;
