import {
  Box,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { subMonths } from "date-fns";
import { useContext, useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReport, selectReport } from "##/src/app/reportSlice.js";
import {
  selectCurrentTheme,
  selectCurrentWorkspace,
} from "##/src/app/profileSlice.js";
import FilterUsers from "##/src/components/reports/FilterUsers";
import FilterDateRange from "##/src/components/reports/FilterDateRange";
import FilterProjects from "##/src/components/reports/FilterProjects";
import SummaryChart from "##/src/components/reports/SummaryChart";
import { formatDuration } from "##/src/utility/timer.js";
import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import { selectProjects } from "##/src/app/projectSlice.js";
import {
  fetchClientsforSelectedWorkspace,
  selectClients,
} from "##/src/app/clientSlice.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { AuthContext } from "##/src/context/authcontext.js";
import {
  getWorkspaceUsers,
  selectUserDetails,
} from "##/src/app/userDetailsSlice.js";
const EntryRow = ({ report }) => {
  return (
    <TableRow>
      <TableCell sx={{ textAlign: "left", fontFamily: FONTS.body }}>
        {report.name}
      </TableCell>
      <TableCell sx={{ textAlign: "left", fontFamily: FONTS.body }}>
        {report.client.name}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {formatDuration(report.timeSpent)}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {report.estimatedHours} Hr
      </TableCell>
    </TableRow>
  );
};
export default function Summary() {
  const [toggle, setToggle] = useState("table");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setLoadingBarProgress } = useContext(AuthContext);
  const [range, setRange] = useState([
    {
      startDate: subMonths(new Date(), 1),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const allProjects = useSelector(selectProjects);
  const clients = useSelector(selectClients);
  const users = useSelector(selectUserDetails);
  const [isLoadingClients, startClientsTransition] = useTransition();
  const workspaceId = useSelector(selectCurrentWorkspace);
  const { allReports } = useSelector(selectReport);
  const theme = useSelector(selectCurrentTheme);
  const dispatchToRedux = useDispatch();
  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();
  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#5a5a5a",
    textAlign: "center",
  };

  useEffect(() => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    const endDate = new Date().toISOString();
    dispatchToRedux(getReport({ startDate: startDate.toISOString(), endDate }));
  }, [workspaceId]);
  // Fetch workspace users if not already loaded
  useEffect(() => {
    if (!users.length) {
      dispatchToRedux(getWorkspaceUsers());
    }
  }, [users.length, dispatchToRedux]);

  const handleFilter = async () => {
    if (selectedProjects.length === 0) {
      setNotification("Please select a project", "warning");
      return;
    }
    setLoading(true);
    setLoadingBarProgress(30);
    try {
      await dispatchToRedux(
        getReport({
          startDate: range[0].startDate,
          endDate: range[0].endDate,
          projects: selectedProjects,
          users: selectedUsers,
        })
      ).unwrap();
      setToggle("table");
      setNotification("Filtered Successfully", "success");
      setLoadingBarProgress(100);
    } catch (error) {
      setLoadingBarProgress(100);
      setNotification("Failed to filter", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleToggle = (event) => {
    if (toggle == event.target.value || !event.target.value) {
      return;
    }
    setToggle(event.target.value);
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
    <Box>
      <Container
        maxWidth="100%"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <FilterUsers
          allUsers={users}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
        <FilterProjects
          allProjects={allProjects}
          selectedProjects={selectedProjects}
          setSelectedProjects={setSelectedProjects}
        />
        {/* <FilterClients
          allClients={clients}
          selectedClients={selectedClients}
          setSelectedClients={setSelectedClients}
        /> */}
        <FilterDateRange range={range} setRange={setRange} />
        <Box
          onClick={!loading ? handleFilter : null}
          sx={{
            color: loading ? "gray" : theme?.secondaryColor,
            fontFamily: FONTS.body,
            fontWeight: "bold",
            fontSize: "20px",
            "&:hover": {
              cursor: loading ? "not-allowed" : "pointer",
            },
          }}
        >
          Go
        </Box>
      </Container>
      <Container
        maxWidth="100%"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          marginBottom: "20px",
        }}
      >
        <ToggleButtonGroup
          exclusive
          onChange={handleToggle}
          sx={{
            height: "30px",
          }}
          value={toggle}
        >
          <ToggleButton
            sx={{
              fontFamily: FONTS.body,
            }}
            value="table"
          >
            Table View
          </ToggleButton>
          <ToggleButton sx={{ fontFamily: FONTS.body }} value="graph">
            Graph View
          </ToggleButton>
        </ToggleButtonGroup>
      </Container>
      {toggle === "table" ? (
        <Box sx={{ width: "100%" }}>
          <TableContainer>
            <Table aria-label="a dense table" size="small">
              <TableHead>
                <TableRow
                  sx={{
                    borderTop: "1px solid #eee",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                    Project Name
                  </TableCell>
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "center" }}>
                    Time Spent
                  </TableCell>
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "center" }}>
                    Estimated Hours
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allReports?.length > 0 ? (
                  allReports?.map((report) => {
                    return <EntryRow key={report._id} report={report} />;
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      sx={{ textAlign: "center", backgroundColor: "#eee" }}
                    >
                      <Typography sx={{ py: "30px" }}>
                        No records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <SummaryChart reportData={allReports} />
      )}
    </Box>
  );
}
