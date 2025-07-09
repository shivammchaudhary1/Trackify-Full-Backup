import {
  Box,
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import LeaveSettings from "##/src/components/settings/LeaveSettings.jsx";
import NotificationSettings from "##/src/components/settings/NotificationSettings.jsx";
import WorkspaceSettings from "##/src/components/settings/WorkspaceSettings.jsx";

const TAB_VALUE = { tabOne: 0, tabTwo: 1, tabThree: 2 };

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);

  function changeTabValue(newValue) {
    setTabValue(newValue);
  }

  return (
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
        Settings
      </Typography>
      <CssBaseline />
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
            label="Leave"
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
            label="Notifications"
            sx={{
              "&.Mui-selected": {
                color: "#5a5a5a",
                fontWeight: "400",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              textTransform: "capitalize",
            }}
          />
          <Tab
            label="Workspace"
            sx={{
              "&.Mui-selected": {
                color: "#5a5a5a",
                fontWeight: "400",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              textTransform: "capitalize",
            }}
          />
        </Tabs>

        {tabValue === TAB_VALUE.tabOne && <LeaveSettings />}
        {tabValue === TAB_VALUE.tabTwo && <NotificationSettings />}
        {tabValue === TAB_VALUE.tabThree && <WorkspaceSettings />}
      </Container>
    </Box>
  );
};

export default Settings;
