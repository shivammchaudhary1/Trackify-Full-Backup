import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import { updateStatusOfLeave } from "../../app/leaveSlice";
import ConfirmationModal from "../holidayAndLeaveModal/ConfirmationModal";
import useSetNotification from "##/src/hooks/notification/useSetNotification";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

const HolidayRequests = ({ leaveData, leaveTypes, setProgress }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const dispatchToRedux = useDispatch();
  const user = useSelector(selectMe);
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

  const handleAction = (id, status) => {
    setSelectedRequestId(id);
    setSelectedActionType(status === "approved" ? "Approve" : "Reject");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setRejectionReason("");
  };

  const handleConfirmAction = async () => {
    setProgress(30);
    setButtonLoading(true);
    try {
      let newStatus =
        selectedActionType === "Approve" ? "approved" : "rejected";

      if (newStatus === "rejected" && rejectionReason) {
        // Include rejection reason if provided
        await dispatchToRedux(
          updateStatusOfLeave({
            leaveId: selectedRequestId,
            status: newStatus,
            rejectionReason: rejectionReason,
            workspaceId: user.currentWorkspace,
          })
        ).unwrap();
      } else {
        // Update leave status without rejection reason
        await dispatchToRedux(
          updateStatusOfLeave({
            leaveId: selectedRequestId,

            status: newStatus,
            workspaceId: user.currentWorkspace,
          })
        ).unwrap();
      }
      setNotification("Leave status updated successfully", "success");

      setProgress(100);
      setModalOpen(false);
      setButtonLoading(false);
      setSelectedRequestId(null);
      setSelectedActionType("");
      setRejectionReason("");
    } catch (error) {
      setProgress(100);
      setButtonLoading(false);
      setSelectedRequestId(null);
      setSelectedActionType("");
      setRejectionReason("");
      handleError("Failed to update leave status");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box>
      <TableContainer sx={{ scrollBehavior: "smooth" }}>
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
                  textAlign: "left",
                }}
              >
                Employee Name
              </TableCell>
              <TableCell sx={tableHeadStyle}>Leave Type</TableCell>
              <TableCell sx={tableHeadStyle}>Type</TableCell>
              <TableCell sx={tableHeadStyle}>Leave Period</TableCell>
              <TableCell sx={tableHeadStyle}>Days</TableCell>
              <TableCell sx={tableHeadStyle}>Date of Request</TableCell>
              <TableCell sx={tableHeadStyle}>Status</TableCell>
              <TableCell sx={tableHeadStyle}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveData.length > 0 ? (
              leaveData.map((request) => {
                const correspondingLeaveType = leaveTypes.find(
                  (type) => type.leaveType === request.type
                );
                const paidStatus =
                  correspondingLeaveType && correspondingLeaveType.paid
                    ? "Paid"
                    : "Unpaid";

                return (
                  <TableRow key={request._id}>
                    <TableCell
                      sx={{
                        fontFamily: FONTS.body,
                        fontSize: "14px",
                        textAlign: "left",
                      }}
                    >
                      {request.user.name}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {capitalizeFirstWord(request.type)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>{paidStatus}</TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {`${formatDate(request.startDate)} to ${formatDate(
                        request.endDate
                      )}`}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {request.numberOfDays}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {capitalizeFirstWord(request.status)}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      <Button
                        onClick={() => handleAction(request._id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAction(request._id, "rejected")}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8} // Adjust the colspan based on the number of columns
                  sx={{
                    textAlign: "center",
                    backgroundColor: "#eee",
                  }}
                >
                  <Typography sx={{ py: "20px" }}>No Request Found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <ConfirmationModal
        actionType={selectedActionType}
        buttonLoading={buttonLoading}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        open={modalOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        theme={theme}
      />
    </Box>
  );
};

export default HolidayRequests;
