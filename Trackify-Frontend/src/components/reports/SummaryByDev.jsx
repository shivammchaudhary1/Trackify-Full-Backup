import {
  Box,
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
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getReport, selectReport } from "##/src/app/reportSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import FilterDateRange from "##/src/components/reports/FilterDateRange";
import FilterUsers from "##/src/components/reports/FilterUsers";
import SummaryByDevChart from "##/src/components/reports/SummaryByDevChart";
import {
  extractDevelopersWithProjects,
  filterUsers,
} from "##/src/utility/report.js";
import { formatDuration } from "##/src/utility/timer.js";
import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const EntryRow = ({ developer }) => {
  return (
    <TableRow>
      <TableCell
        sx={{ textAlign: "left", paddingLeft: "20px", fontFamily: FONTS.body }}
      >
        {developer.name}
      </TableCell>{" "}
      <TableCell
        sx={{ textAlign: "left", paddingLeft: "20px", fontFamily: FONTS.body }}
      >
        {developer.projects?.map((project, i) => (
          <p key={`${project.projectId}:${i}`}>{project.projectName}</p>
        ))}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {developer.projects?.map((project) => (
          <p key={project.projectId}>{formatDuration(project.timeSpent)}</p>
        ))}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {formatDuration(developer.totalTimeSpentByDeveloper)}
      </TableCell>
    </TableRow>
  );
};

export default function SummaryByDev() {
  const headings = ["Developer Name", "Project", "Time Spent", "Total Time"];
  const [toggle, setToggle] = useState("table");
  const { allReports, tempDateReports } = useSelector(selectReport);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [range, setRange] = useState([
    {
      startDate: subMonths(new Date(), 1),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [report, setReport] = useState(allReports);
  const theme = useSelector(selectCurrentTheme);
  const dispatchToRedux = useDispatch();

  const { setNotification } = useSetNotification();

  const tableHeadStyle = {
    fontFamily: FONTS.subheading,
    fontSize: "16px",
    fontWeight: "bold",
    // color: theme?.textColor,
    color: "#5a5a5a",
    textAlign: "center",
  };
  useEffect(() => {
    if (tempDateReports.length) {
      const filteredReports = extractDevelopersWithProjects(tempDateReports);
      const filteredUsers = filterUsers(filteredReports, selectedUsers);
      setReport(filteredUsers);
    } else {
      const filteredReports = extractDevelopersWithProjects(allReports);
      const filteredUsers = filterUsers(filteredReports, selectedUsers);
      setReport(filteredUsers);
    }
  }, [allReports, tempDateReports]);

  const handleFilter = async () => {
    // const startDate = subMonths(new Date(), 1);
    // const endDate = new Date();
    // if (
    //   range[0].startDate.getDate() !== startDate.getDate() ||
    //   range[0].startDate.getMonth() !== startDate.getMonth() ||
    //   range[0].startDate.getFullYear() !== startDate.getFullYear() ||
    //   range[0].endDate.getDate() !== endDate.getDate() ||
    //   range[0].endDate.getMonth() !== endDate.getMonth() ||
    //   range[0].endDate.getFullYear() !== endDate.getFullYear()
    // ) {
    //   await dispatchToRedux(
    //     getReport({
    //       startDate: range[0].startDate,
    //       endDate: range[0].endDate,
    //     })
    //   ).unwrap();
    // } else {
    //   const filteredReports = extractDevelopersWithProjects(allReports);
    //   const filteredUsers = filterUsers(filteredReports, selectedUsers);
    //   setReport(filteredUsers);
    // }
    // setNotification("Filter Applied", "success");
  };
  const handleToggle = (event) => {
    if (toggle == event.target.value || !event.target.value) {
      return;
    }
    setToggle(event.target.value);
  };

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
          width: "100%",
        }}
      >
        <FilterUsers
          allUsers={allReports}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
        <FilterDateRange range={range} setRange={setRange} />
        <Box
          onClick={handleFilter}
          sx={{
            color: theme?.secondaryColor,
            fontFamily: FONTS.body,
            fontWeight: "bold",
            fontSize: "20px",
            "&:hover": {
              cursor: "pointer",
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
          // color="primary"
          exclusive
          onChange={handleToggle}
          sx={{ height: "30px" }}
          value={toggle}
        >
          <ToggleButton sx={{ fontFamily: FONTS.body }} value="table">
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
                  <TableCell
                    sx={{
                      ...tableHeadStyle,
                      paddingLeft: "20px",
                      textAlign: "left",
                    }}
                  >
                    Developer Name
                  </TableCell>
                  <TableCell
                    sx={{
                      ...tableHeadStyle,
                      textAlign: "left",

                      paddingLeft: "20px",
                    }}
                  >
                    Project
                  </TableCell>
                  <TableCell
                    sx={{
                      ...tableHeadStyle,
                      paddingLeft: "20px",
                    }}
                  >
                    Time Spent
                  </TableCell>
                  <TableCell
                    sx={{
                      ...tableHeadStyle,
                      paddingLeft: "20px",
                    }}
                  >
                    Total Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report?.length > 0 ? (
                  report?.map((developer) => (
                    <EntryRow key={developer.userId} developer={developer} />
                  ))
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
        <SummaryByDevChart data={report} />
      )}
    </Box>
  );
}
