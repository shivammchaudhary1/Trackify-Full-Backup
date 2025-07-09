import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { subDays, subMonths } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  detailedAdminReport,
  makeSelectAdminDetailedReport,
} from "##/src/app/reportSlice.js";
import { selectProjects } from "##/src/app/projectSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import {
  getWorkspaceUsers,
  selectUserDetails,
} from "##/src/app/userDetailsSlice.js";
import FilterDateRange from "##/src/components/reports/FilterDateRange.jsx";
import FilterProjects from "##/src/components/reports/ProjectFilter.jsx";
import { convertSecondsToHoursAndMinutes } from "##/src/utility/time/time.utility.js";
import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";
import { config } from "##/src/utility/config/config.js";
import BillableFilter from "##/src/components/reports/BillableFilter";
import { useCallback, useMemo } from "react";

const AdminReport = () => {
  const theme = useSelector(selectCurrentTheme);
  const data = useSelector(makeSelectAdminDetailedReport, shallowEqual);
  const projects = useSelector(selectProjects);
  const dispatchToRedux = useDispatch();
  const [range, setRange] = useState([
    {
      startDate: subDays(new Date(new Date().setHours(0, 0, 0, 0)), 31),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectIsBillable, setSelectIsBillable] = useState("All");

  const users = useSelector(selectUserDetails);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  function handleProjectSelect(value) {
    setSelectedProjects(value);
  }
  function handleBillableSelect(value) {
    setSelectIsBillable(value);
  }

  useEffect(() => {
    if (!users || !users.length) {
      dispatchToRedux(getWorkspaceUsers());
    }
  }, [users]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (
          !Object.keys(data).length &&
          range[0].startDate &&
          range[0].endDate
        ) {
          await dispatchToRedux(
            detailedAdminReport({
              startDate: range[0].startDate,
              endDate: range[0].endDate,
              userIds: [],
              projectIds: [],
              selectIsBillable,
            })
          ).unwrap();
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
      setLoading(false);
    };

    fetchData();
  }, [dispatchToRedux, users]);

  const handleUsersChange = useCallback((event) => {
    if (event.target.value.includes("all")) {
      if (selectedUsers.length === users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(users.map((developer) => developer._id));
      }
    } else {
      setSelectedUsers(event.target.value);
    }
  });

  const renderUserLabel = useCallback(
    (selected) => {
      if (selected.length === users.length) {
        return "All selected";
      } else if (selected.length > 0) {
        return `${selected.length} selected`;
      } else {
        return "Select User";
      }
    },
    [users.length]
  );

  useEffect(() => {
    if (users.length && selectedUsers.length === 0) {
      setSelectedUsers(users.map((user) => user._id));
    }
  }, [users]);

  const handleFilter = async () => {
    if (selectedUsers.length === 0) {
      setNotification("Please select at least one user", "warning");
      return;
    }

    setLoading(true); // Start loading
    await dispatchToRedux(
      detailedAdminReport({
        userIds: selectedUsers,
        projectIds: selectedProjects,
        selectIsBillable: selectIsBillable,
        start: `${range[0].startDate.getFullYear()}-${range[0].startDate.getMonth() + 1}-${range[0].startDate.getDate()}`,
        end: `${range[0].endDate.getFullYear()}-${range[0].endDate.getMonth() + 1}-${range[0].endDate.getDate()}`,
        startDate: range[0].startDate,
        endDate: range[0].endDate,
      })
    ).unwrap();
    setLoading(false);
  };

  async function handleDownload(event) {
    let userIds = [];
    let projectsIds = [];
    if (!selectedUsers.length) {
      userIds = users.map((user) => user._id);
    }

    if (!selectedProjects.length) {
      projectsIds = projects.map((project) => project._id);
    }

    const startDate = range[0].startDate;
    const endDate = range[0].endDate;

    event.preventDefault();

    const form = document.createElement("form");
    form.method = "GET";
    console.log("selectIsBillable", selectIsBillable);
    form.action = `${config.api}/api/reports/admin-report?startDate=${startDate}&endDate=${endDate}&userIds=${selectedUsers.length ? selectedUsers : userIds}&projectIds=${selectedProjects.length ? selectedProjects : projectsIds}&shouldDownload=${true}&selectIsBillable=${selectIsBillable}`;
    console.log(form.action);
    // Open the download in a new tab
    form.target = "_blank";

    const formData = {
      userIds: selectedUsers,
      projectIds: selectedProjects,
      startDate,
      endDate,
      shouldDownload: "true",
      selectIsBillable,
    };

    Object.keys(formData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });

    // Ensure the cookies are included in the form request
    document.cookie = "cross-site-cookie=your-cookie; SameSite=None; Secure";

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  return (
    <Box>
      <Button
        disabled={!Object.keys(data).length}
        sx={{
          position: "absolute",
          top: "180px",
          right: "50px",
          border: "1px solid #ccc",
        }}
        onClick={handleDownload}
      >
        Export Pdf
      </Button>
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
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Select User</InputLabel>
          <Select
            multiple
            label="Select User"
            onChange={handleUsersChange}
            renderValue={(selected) => renderUserLabel(selected)}
            value={selectedUsers}
            variant="standard"
            // Configure dropdown positioning
            MenuProps={{
              // Position dropdown right below the select
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "left",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "left",
              },
              // Styling and behavior
              PaperProps: {
                style: {
                  maxHeight: 400,
                },
              },
              disableScrollLock: true,
              disablePortal: false,
              getContentAnchorEl: null,
            }}
          >
            <MenuItem value="all">
              <Checkbox checked={selectedUsers.length === users.length} />
              <ListItemText primary="Select All" />
            </MenuItem>
            {users?.map((developer) => {
              return (
                <MenuItem
                  key={developer._id}
                  sx={{  height: "35px" }}
                  value={developer._id}
                >
                  <Checkbox checked={selectedUsers.includes(developer._id)} />
                  <ListItemText primary={developer.name} />
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FilterProjects
          projects={projects}
          selectedProjects={selectedProjects}
          onSelect={handleProjectSelect}
        />
        <FilterDateRange range={range} setRange={setRange} />
        <BillableFilter
          onSelect={handleBillableSelect}
          selectedBillable={selectIsBillable}
        />
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
        component={Paper}
        maxWidth="xl"
        sx={{
          marginTop: "20px",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          Object.keys(data).map((userId) => {
            const user = data[userId];

            return (
              <Accordion
                key={userId}
                sx={{
                  backgroundColor: "#d3d3d3",
                  marginBottom: "15px",
                }}
              >
                <AccordionSummary
                  aria-controls={`panel${userId}-content`}
                  expandIcon={<ExpandMoreIcon />}
                  id={`panel${userId}-header`}
                >
                  <Typography
                    sx={{
                      width: "30%",
                      fontFamily: FONTS.heading,
                      fontSize: "16px",
                    }}
                  >
                    {user.userName}
                  </Typography>
                  <Typography
                    sx={{
                      width: "30%",
                      fontFamily: FONTS.heading,
                      fontSize: "16px",
                    }}
                  >
                    {user.email}
                  </Typography>
                  <Typography
                    sx={{
                      width: "30%",
                      fontFamily: FONTS.heading,
                      fontSize: "16px",
                    }}
                  >
                    Total Hours:{" "}
                    <span style={{ fontWeight: "bold" }}>
                      {convertSecondsToHoursAndMinutes(user.totalHoursWorked)}
                    </span>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DateTable
                    entries={user.entries}
                    selectIsBillable={selectIsBillable}
                  />
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Container>
    </Box>
  );
};

const DateTable = ({ entries, selectIsBillable }) => {
  const theme = useSelector(selectCurrentTheme);

  return (
    <div>
      {Object.keys(entries).map((date, index) => {
        const entry = entries[date];
        let totalEntries = entry.totalEntries || [];
        return (
          <Accordion
            key={date}
            sx={{
              backgroundColor: index % 2 === 0 ? theme.secondaryColor : "white",
              marginBottom: "10px",
            }}
          >
            <AccordionSummary
              aria-controls={`panel${date}-content`}
              expandIcon={<ExpandMoreIcon />}
              id={`panel${date}-header`}
            >
              <Typography
                sx={{
                  flex: "1 1 auto",
                  color: index % 2 === 0 ? theme?.textColor : "",
                }}
              >
                {date}
              </Typography>
              <Typography
                sx={{
                  flex: "flex-end",
                  marginRight: "20px",
                  color: index % 2 === 0 ? theme?.textColor : "",
                }}
              >
                Total: {convertSecondsToHoursAndMinutes(entry.hoursWorked)}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <EntryTable entries={totalEntries} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

const EntryTable = ({ entries = [] }) => {
  // Create an array of objects combining startTime and endTime
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime);
  });

  return (
    <TableContainer sx={{ backgroundColor: "white" }}>
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
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#5a5a5a",
              }}
            >
              Task
            </TableCell>
            <TableCell
              sx={{
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#5a5a5a",
              }}
            >
              Project Name
            </TableCell>
            <TableCell
              sx={{
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#5a5a5a",
              }}
            >
              Start Time
            </TableCell>
            <TableCell
              sx={{
                fontFamily: "Arial, sans-serif",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#5a5a5a",
              }}
            >
              End Time
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedEntries.map((entry, index) => (
            <TableRow
              key={`${entry._id}-${index}`}
              sx={{
                backgroundColor: index % 2 === 0 ? "lightgrey" : "white",
              }}
            >
              <TableCell>{entry.title}</TableCell>
              <TableCell>{entry.project.name}</TableCell>
              <TableCell>
                {new Date(entry.startTime).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </TableCell>
              <TableCell>
                {entry.endTime === "-"
                  ? "-"
                  : new Date(entry.endTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminReport;
