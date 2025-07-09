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
import ChangePassword from "##/src/components/profile/ChangePassword.jsx";
import ProfileUpdate from "##/src/components/profile/ProfileUpdate.jsx";
// import Notifications from "##/src/components/profile/Notifications.jsx";
import CompanyAssets from "##/src/components/profile/CompanyAssets.jsx";

const TAB_VALUE = {
  profile: 0,
  companyAsset: 1,
  changePassword: 2,
};

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);

  const user = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);

  function changeTabValue(newValue) {
    setTabValue(newValue);
  }

  return (
    <Box sx={{
      overflowY:'auto'
    }}>
      <Typography
        fontWeight="bold"
        sx={{
          ml: "25px",
          mt: "50px",
          color: theme?.secondaryColor,
        }}
        variant="h5"
      >
        Profile
      </Typography>
      <CssBaseline />
      <Container maxWidth="100%">
        <Tabs
          TabIndicatorProps={{
            sx: { backgroundColor: theme?.secondaryColor },
          }}
          onChange={(_, newTabValue) => setTabValue(newTabValue)}
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
            label="profile"
            value={TAB_VALUE.profile}
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
            label="Company Asset"
            value={TAB_VALUE.companyAsset}
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
            label="Change Password"
            value={TAB_VALUE.changePassword}
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
          {/* <Tab
            label="Notifications"
            sx={{
              "&.Mui-selected": {
                color: "#5a5a5a",
                fontWeight: "500",
                borderLeft: "1px solid #eee",
                borderRight: "1px solid #eee",
              },
              textTransform: "capitalize",
            }}
          /> */}
        </Tabs>
      </Container>

      {tabValue === TAB_VALUE.profile && !!user && <ProfileUpdate />}
      {tabValue === TAB_VALUE.companyAsset && <CompanyAssets />}
      {tabValue === TAB_VALUE.changePassword && <ChangePassword />}
      {/* {tabValue === TAB_VALUE.tabThree && <Notifications />} */}
    </Box>
  );
};

export default Profile;
