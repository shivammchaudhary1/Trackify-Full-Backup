import { Box, Button, Container, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentWorkspace, selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import Rules from "##/src/components/calculation/Rules.jsx";
import LeaveType from "##/src/components/holidays/LeaveType.jsx";
import TimezoneSelect from "react-timezone-select";
import { makeSelectWorkspace } from "##/src/app/workspaceSlice.js";
import { updateWorkspace } from "##/src/app/workspaceSlice.js";
import { useDispatch } from "react-redux";
import useSetNotification from "##/src/hooks/notification/useSetNotification.js";

const TAB_VALUE = { tabOne: 0, tabTwo: 1, tabThree: 2 };

const WorkspaceSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTimezone, setSelectedTimezone] = useState();
  const currentWorkspaceId = useSelector(selectCurrentWorkspace);
  const selectWorkspace = useMemo(makeSelectWorkspace, []);
  const currentWorkspace = useSelector((state) =>
    selectWorkspace(state, currentWorkspaceId)
  );
  const { setNotification } = useSetNotification();

  const dispatchToRedux = useDispatch();

  const theme = useSelector(selectCurrentTheme);

  function changeTabValue(newValue) {
    setTabValue(newValue);
  }

  async function handleChangeWorkspace() {
    try {
      await dispatchToRedux(
        updateWorkspace({
          timeZone: selectedTimezone,
          workspaceId: currentWorkspaceId,
        })
      ).unwrap();
      setNotification(`Time zone changed`, "success");
    } catch (error) {
      setNotification(
        `Failed to change time time zone, ${error.message}`,
        "error"
      );
    }
  }

  function handleChange(event) {
    setSelectedTimezone(event.value);
  }

  useEffect(() => {
    if (currentWorkspace) {
      setSelectedTimezone(currentWorkspace.timeZone);
    }
  }, [currentWorkspace]);
  return (
    <Box sx={{ ml: -3 }}>
      <Container maxWidth="100%">
        <Tabs
          TabIndicatorProps={{
            sx: { backgroundColor: theme?.secondaryColor },
          }}
          onChange={(_, newTabValue) => changeTabValue(newTabValue)}
          sx={{
            mb: "20px",
            mt: "20px",
            ":focus": {
              color: theme?.secondaryColor,
              borderBottom: `2px solid ${theme?.secondaryColor}`,
            },
            borderBottom: "1px solid #ddd",
          }}
          value={tabValue}
        >
          <Tab
            label="Rules"
            sx={{
              "&.Mui-selected": {
                color: "#5a5a5a",
                fontWeight: "500",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              textTransform: "capitalize",
            }}
          />
          <Tab
            label="Leave Types"
            sx={{
              "&.Mui-selected": {
                color: "#5a5a5a",
                fontWeight: "500",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              textTransform: "capitalize",
            }}
          />
        </Tabs>

        {tabValue === TAB_VALUE.tabOne && <Rules />}
        {tabValue === TAB_VALUE.tabTwo && <LeaveType />}
      </Container>

      <Box
        sx={{
          position: "absolute",
          right: "40px",
          top: "140px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>Time Zone</Typography>
        <Box
          sx={{
            width: "200px",
          }}
        >
          <TimezoneSelect value={selectedTimezone} onChange={handleChange} />
        </Box>
        <Button
          disabled={selectedTimezone === currentWorkspace.timeZone}
          sx={{
            border: `1px solid ${theme.secondaryColor}`,
            color: theme.primaryColor,
          }}
          onClick={handleChangeWorkspace}
        >
          Change
        </Button>
      </Box>
    </Box>
  );
};

export default WorkspaceSettings;
