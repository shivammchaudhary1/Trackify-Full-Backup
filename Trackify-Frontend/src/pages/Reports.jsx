import { Container, Tab, Tabs, Typography } from "@mui/material";
import React, { Suspense, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUserRole } from "##/src/app/profileSlice.js";
import { resetDate } from "##/src/app/reportSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import FallBackLoader from "##/src/components/loading/FallBackLoader.jsx";

const Summary = React.lazy(
  () => import("##/src/components/reports/Summary.jsx")
);

// const SummaryByDev = React.lazy(
//   () => import("##/src/components/reports/SummaryByDev.jsx")
// );

const AdminReport = React.lazy(
  () => import("##/src/components/reports/AdminReport.jsx")
);
const UserReport = React.lazy(
  () => import("##/src/components/reports/UserReport.jsx")
);

const Reports = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useSelector(selectCurrentTheme);
  const dispatchToRedux = useDispatch();

  const isAdmin = useSelector(selectUserRole);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
    dispatchToRedux(resetDate());
  };

  return (
    <Container maxWidth="100%">
      <Typography
        fontWeight="bold"
        sx={{
          ml: "0px",
          mt: "30px",
          color: theme?.secondaryColor,
        }}
        variant="h5"
      >
        Reports
      </Typography>
      <Tabs
        TabIndicatorProps={{ sx: { backgroundColor: theme?.secondaryColor } }}
        onChange={handleChangeTab}
        sx={{ mb: "20px", mt: "20px", borderBottom: "1px solid #eee" }}
        value={tabValue}
      >
        {isAdmin ? (
          [
            <Tab
              key={0 + "Summary"}
              label="Summary"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  fontWeight: "bold",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
              }}
            />,
            // <Tab
            //   key={1}
            //   label="Summary by Member"
            //   sx={{
            //     "&.Mui-selected": {
            //       color: "#000",
            //       fontWeight: "bold",
            //       borderLeft: "1px solid #eee",
            //       borderRight: "1px solid #eee",
            //     },
            //   }}
            // />,
            <Tab
              key={1}
              label="Detailed"
              sx={{
                "&.Mui-selected": {
                  color: "#5a5a5a",
                  fontWeight: "bold",
                },
              }}
            />,
          ]
        ) : (
          <Tab
            label="User"
            sx={{
              "&.Mui-selected": {
                color: theme?.secondaryColor,
                fontWeight: "bold",
              },
            }}
          />
        )}
      </Tabs>

      {tabValue === 0 && (
        <Suspense fallback={<FallBackLoader />}>
          {isAdmin ? <Summary /> : <UserReport />}
        </Suspense>
      )}
      {/* {tabValue === 1 && (
        <Suspense fallback={<FallBackLoader />}>
          <SummaryByDev theme={theme} />
        </Suspense>
      )} */}
      {/* {tabValue === 2 && <Detailed theme={theme} />} */}
      {tabValue === 1 && (
        <Suspense fallback={<FallBackLoader />}>
          <AdminReport theme={theme} />
        </Suspense>
      )}
    </Container>
  );
};

export default Reports;
