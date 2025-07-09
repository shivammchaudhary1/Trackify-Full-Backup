import { Box, Container, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import AutoAddLeaveBaLance from "##/src/components/holidays/AutoAddLeaveBaLance.jsx";

const TAB_VALUE = { tabOne: 0, tabTwo: 1, tabThree: 2 };

const LeaveSettings = () => {
  const [tabValue, setTabValue] = useState(0);

  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);

  function changeTabValue(newValue) {
    setTabValue(newValue);
  }

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
            label="Auto Leave balance settings"
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

        {tabValue === TAB_VALUE.tabOne && <AutoAddLeaveBaLance />}
      </Container>
    </Box>
  );
};

export default LeaveSettings;
