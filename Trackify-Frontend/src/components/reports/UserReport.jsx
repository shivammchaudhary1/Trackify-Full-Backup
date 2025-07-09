import {
  Box,
  CircularProgress,
  Container,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useEffect, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectProjects } from "##/src/app/projectSlice.js";
import { selectUserReport, setUserReport } from "##/src/app/reportSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import ComponentLoader from "##/src/components/loading/ComponentLoader.jsx";
import FilterDateRange from "##/src/components/reports/FilterDateRange";
import ProjectFilter from "##/src/components/reports/ProjectFilter";
import SummaryChart from "##/src/components/reports/SummaryChart";
import DataDisplay from "##/src/components/reports/UserReportData.jsx";
import { getUserEntries } from "##/src/utility/report.js";
import { FONTS } from "##/src/utility/utility.js";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";
import useErrorHandler from "##/src/hooks/error/useErrorHandler.js";

function UserReport() {
  const workspaceProjects = useSelector(selectProjects);
  const reports = useSelector(selectUserReport);
  const user = useSelector(selectMe);
  const dispatchToRedux = useDispatch();
  const [loading, setLoading] = useState(false);
  const [toggle, setToggle] = useState("table");
  const [isRequested, setIsRequested] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [range, setRange] = useState([
    {
      startDate: (() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
      })(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [isLoading, startTransition] = useTransition();

  const theme = useSelector(selectCurrentTheme);

  const { setNotification } = useSetNotification();
  const { handleError } = useErrorHandler();

  async function handleGetUserEntries() {
    setLoading(true);
    startTransition(async () => {
      try {
        const entriesData = await getUserEntries(
          selectedProjects,
          range,
          user?._id
        );
        dispatchToRedux(setUserReport(entriesData));
        setNotification("Report generated successfully.", "success");
      } catch (error) {
        handleError(`Failed to get the report: ${error.message}`);
      } finally {
        setLoading(false);
      }
    });
    setIsRequested(true);
  }

  useEffect(() => {
    if (user && !reports.length && !isRequested) {
      handleGetUserEntries();
    }
  }, [user, reports]);

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
        <ProjectFilter
          onSelect={setSelectedProjects}
          projects={workspaceProjects}
          selectedProjects={selectedProjects}
        />
        <FilterDateRange range={range} setRange={setRange} />
        <Box
          onClick={!loading ? handleGetUserEntries : null}
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
          {/* TODO: Enable once chart is ready */}
          {/* <ToggleButton value="graph" sx={{ fontFamily: FONTS.body }}>
            Graph View
          </ToggleButton> */}
        </ToggleButtonGroup>
      </Container>
      {toggle === "table" ? (
        <ComponentLoader
          isLoading={!isRequested && !reports.length ? true : false}
        >
          <DataDisplay data={reports} />
        </ComponentLoader>
      ) : (
        <SummaryChart reportData={reports} />
      )}
      {}
    </Box>
  );
}

export default UserReport;
