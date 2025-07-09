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
import DetailedChart from "##/src/components/reports/DetailedChart.jsx";
import FilterClients from "##/src/components/reports/FilterClients";
import FilterDateRange from "##/src/components/reports/FilterDateRange";
import FilterProjects from "##/src/components/reports/FilterProjects";
import FilterUsers from "##/src/components/reports/FilterUsers";
import { filterProjectsByCriteria } from "##/src/utility/report.js";
import { formatDuration, formatISOdate } from "##/src/utility/timer.js";
import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const EntryRow = ({ project }) => {
  return (
    <TableRow>
      <TableCell sx={{ textAlign: "left", fontFamily: FONTS.body }}>
        {project.projectDetails.name}
      </TableCell>
      <TableCell sx={{ textAlign: "left", fontFamily: FONTS.body }}>
        {project.projectDetails.description}
      </TableCell>
      <TableCell sx={{ textAlign: "left", fontFamily: FONTS.body }}>
        {project.developers?.map((developer) => (
          <p key={developer._id}>{developer.name}</p>
        ))}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {project.developers?.map((developer, i) => (
          <p key={i}>{formatDuration(developer.timeSpent)}</p>
        ))}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {project.projectDetails.isCompleted ? "Completed" : "OnGoing"}
      </TableCell>
      <TableCell sx={{ textAlign: "center", fontFamily: FONTS.body }}>
        {formatISOdate(project.projectDetails.createdDate)}
      </TableCell>
    </TableRow>
  );
};

export default function SummaryByDev() {
  const headings = ["Duration", "Status", "Created Date"];
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [range, setRange] = useState([
    {
      startDate: subMonths(new Date(), 1),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const { allReports, tempDateReports } = useSelector(selectReport);
  const [report, setReport] = useState(allReports);
  const [toggle, setToggle] = useState("table");
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
      setReport(tempDateReports);
    } else {
      setReport(allReports);
    }
  }, [allReports, tempDateReports]);
  const handleFilter = async () => {
    // const startDate = subMonths(new Date(), 1);
    // const endDate = new Date();
    // let dateFilter = false;
    // if (
    //   range[0].startDate.getDate() !== startDate.getDate() ||
    //   range[0].startDate.getMonth() !== startDate.getMonth() ||
    //   range[0].startDate.getFullYear() !== startDate.getFullYear() ||
    //   range[0].endDate.getDate() !== endDate.getDate() ||
    //   range[0].endDate.getMonth() !== endDate.getMonth() ||
    //   range[0].endDate.getFullYear() !== endDate.getFullYear()
    // ) {
    //   dateFilter = true;
    //   await dispatchToRedux(
    //     getReport({
    //       startDate: range[0].startDate,
    //       endDate: range[0].endDate,
    //     })
    //   );
    // }
    // if (
    //   selectedClients.length === 0 &&
    //   selectedProjects.length === 0 &&
    //   selectedUsers.length === 0
    // ) {
    //   return;
    // }
    // const filteredReport = filterProjectsByCriteria(
    //   dateFilter ? tempDateReports : allReports,
    //   selectedUsers,
    //   selectedClients,
    //   selectedProjects
    // );
    // setReport(filteredReport);
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
        }}
      >
        <FilterProjects
          allProjects={allReports}
          selectedProjects={selectedProjects}
          setSelectedProjects={setSelectedProjects}
        />
        <FilterClients
          allClients={allReports}
          selectedClients={selectedClients}
          setSelectedClients={setSelectedClients}
        />
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
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                    Project Name
                  </TableCell>
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ ...tableHeadStyle, textAlign: "left" }}>
                    Developer Name
                  </TableCell>

                  {headings?.map((heading, i) => {
                    return (
                      <TableCell key={i} sx={tableHeadStyle}>
                        {heading}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {report?.length > 0 ? (
                  report?.map((project) => {
                    return <EntryRow key={project._id} project={project} />;
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
        <DetailedChart data={report} />
      )}
    </Box>
  );
}
