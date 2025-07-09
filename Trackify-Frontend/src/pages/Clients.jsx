import {
  Box,
  Container,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { lazy, useContext, useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addClient,
  deleteClient,
  fetchClientsforSelectedWorkspace,
  selectClients,
  updateClient,
} from "##/src/app/clientSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import { selectUserRole } from "##/src/app/profileSlice.js";
import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { useNavigate } from "react-router-dom";
import LoadWithSuspense from "##/src/components/loading/LoadWithSuspense.jsx";
import { AuthContext } from "##/src/context/authcontext.js";
import SkeletonThreeBars from "##/src/components/loading/SkeletonThreeBars.jsx";

const ClientRow = lazy(() => import("##/src/components/client/ClientRow.jsx"));
const AddClientModal = lazy(
  () => import("##/src/components/client/AddClient.jsx")
);
const DeleteModal = lazy(
  () => import("##/src/components/common/DeleteModal.jsx")
);

const tableHeadStyle = {
  fontFamily: FONTS.subheading,
  fontSize: "16px",
  fontWeight: "bold",
  color: "#5a5a5a",
};

const Clients = () => {
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState({});
  const [clientName, setClientName] = useState("");

  const [isLoading, startTransition] = useTransition();
  const [isLoadingClients, startClientsTransition] = useTransition();
  const { setLoadingBarProgress: setProgress } = useContext(AuthContext);

  const dispatchToRedux = useDispatch();

  const clients = useSelector(selectClients);
  const theme = useSelector(selectCurrentTheme);
  const isAdmin = useSelector(selectUserRole);

  const navigate = useNavigate();

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  function handleCloseAddClientModal() {
    setIsAddClientModalOpen(false);
  }

  const handleChangeClientName = (event) => {
    setClientName(event.target.value);
  };

  /**
   * Adds a new client
   * @param {string} clientName - Name of the client
   * @returns {Promise<void>}
   */
  const handleAddClient = async () => {
    if (!clientName) {
      setNotification(
        "Please enter a client name before adding a client.",
        "warning"
      );
      return;
    }
    startTransition(async () => {
      setProgress(30);
      try {
        await dispatchToRedux(addClient({ clientName })).unwrap();
        setProgress(100);
        setNotification("Client Added Successfully", "success");
        handleCloseAddClientModal();
      } catch (error) {
        setProgress(100);
        handleError(`Failed to add client: ${error.message}`);
      }
    });
  };

  /**
   * Deletes a client
   * @returns {Promise<void>}
   */
  const handleDeleteClient = async () => {
    setProgress(30);

    startTransition(async () => {
      try {
        if (clientId) {
          await dispatchToRedux(
            deleteClient({
              id: clientId,
            })
          ).unwrap();
          setClientId(null);
        }
        setProgress(100);
        setNotification("Client Deleted Successfully", "success");
        setDeleteModalOpen(false);
      } catch (error) {
        setProgress(100);
        handleError(`Failed to delete client: ${error.message}`);
      }
    });
  };

  /**
   * Updates the client name for a specified client ID.
   *
   * @param {string} newClientName - The new name to be set for the client. Must not be empty.
   * @param {string} clientId - The ID of the client to be updated. Must be provided.
   * @returns {Promise<void>}
   */

  const handleUpdateClient = async (newClientName, clientId) => {
    if (!newClientName) {
      setNotification(
        "Please enter a client name before updating a client.",
        "warning"
      );
      return;
    }

    startTransition(async () => {
      try {
        if (clientId && newClientName.trim() !== "") {
          setProgress(30);
          await dispatchToRedux(
            updateClient({
              id: clientId,
              clientName: newClientName,
            })
          ).unwrap();
          setProgress(100);
          setNotification("Client Updated Successfully", "success");
          setIsUpdateModalOpen({ ...isUpdateModalOpen, [clientId]: false });
          setClientId(null);
        }
      } catch (error) {
        setProgress(100);
        handleError(`Failed to update client: ${error.message}`);
      }
    });
  };

  const openUpdateModal = (clientId) => {
    setIsUpdateModalOpen({ ...isUpdateModalOpen, [clientId]: true });
    setClientId(clientId);
  };

  const handleDelete = (id) => {
    setClientId(id);
    setDeleteModalOpen(true);
  };

  useEffect(() => {
    async function handleFetchClients() {
      startClientsTransition(async () => {
        try {
          await dispatchToRedux(fetchClientsforSelectedWorkspace()).unwrap();
        } catch (error) {
          handleError(`Failed to get the clients: ${error.message}`);
        }
      });
    }

    if (!clients.length) {
      handleFetchClients();
    }
  }, []);

  return (
    <>
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
          Clients
        </Typography>
        <CssBaseline />
        <Container maxWidth="100%">
          <Box
            onClick={() => setIsAddClientModalOpen(true)}
            sx={{
              position: "absolute",
              top: "145px",
              right: "22px",
              cursor: "pointer",
              padding: "7px",
              // To ensure it's above other elements
              zIndex: 5,
            }}
          >
            <Typography
              color={theme?.secondaryColor}
              fontWeight="800"
              variant="h6"
            >
              + Add Client
            </Typography>
          </Box>
          <TableContainer sx={{ mt: "20px", scrollBehavior: "smooth"}}>
            <Table
              stickyHeader
              aria-label="a dense table"
              size="small"
              sx={{
                boxShadow: "none",
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
                  <TableCell sx={tableHeadStyle}>Client Name</TableCell>
                  <TableCell sx={tableHeadStyle}>Created On</TableCell>
                  <TableCell sx={tableHeadStyle}>Action</TableCell>
                  <TableCell sx={tableHeadStyle}>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!!clients.length &&
                  clients.map((client) => (
                    <ClientRow
                      buttonLoading={isLoading}
                      client={client}
                      isAdmin={isAdmin}
                      key={client._id}
                      onClose={setIsUpdateModalOpen}
                      onDelete={handleDelete}
                      onEdit={openUpdateModal}
                      onUpdate={handleUpdateClient}
                      open={isUpdateModalOpen}
                      theme={theme}
                    />
                  ))}
                {!clients.length && !isLoadingClients && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{ textAlign: "center", backgroundColor: "#eee" }}
                    >
                      <Typography sx={{ py: "30px" }}>
                        No Data to show Clients
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
      {/* Delete Client modal */}
      {deleteModalOpen && (
        <LoadWithSuspense>
          <DeleteModal
            content={
              <Box sx={{ width: "100%", pl: "20px", pb: "10px" }}>
                <Typography>
                  Deleting this client will also delete, all the projects and
                  time entries assigned to this client. Are you sure you want to
                  delete this client?
                </Typography>
              </Box>
            }
            buttonLoading={isLoading}
            onClose={() => setDeleteModalOpen(false)}
            onDelete={handleDeleteClient}
            open={deleteModalOpen}
            text={`Deleting Client permanently delete, all the projects and  
              time entries assigned to this client. Are you sure you want to delete this client?`}
            theme={theme}
            title={"Delete Client"}
          />
        </LoadWithSuspense>
      )}
      {/* Add Client modal */}
      {isAddClientModalOpen && (
        <LoadWithSuspense>
          <AddClientModal
            clientName={clientName}
            isLoading={isLoading}
            onClose={handleCloseAddClientModal}
            onChange={handleChangeClientName}
            onSave={handleAddClient}
            open={isAddClientModalOpen}
            theme={theme}
          />
        </LoadWithSuspense>
      )}
      {isLoadingClients && (
        <SkeletonThreeBars shouldDisplay={isLoadingClients} />
      )}
    </>
  );
};

export default Clients;
