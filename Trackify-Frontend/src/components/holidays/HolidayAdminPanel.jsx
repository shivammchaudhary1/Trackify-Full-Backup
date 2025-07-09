import { Box, Container, Tab, Tabs } from "@mui/material";
import { useState } from "react";

const HolidayAdminPanel = ({ theme, children, setProgress, renderFab }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Box>
        <Container maxWidth="100%">
          <Tabs
            TabIndicatorProps={{
              sx: { backgroundColor: theme?.secondaryColor },
            }}
            onChange={handleChange}
            sx={{ mb: "20px", mt: "-20px", borderBottom: "1px solid #ddd" }}
            value={value}
          >
            <Tab
              label="Holiday List"
              sx={{
                "&.Mui-selected": {
                  color: "#000",
                  borderLeft: "1px solid #eee",
                  borderRight: "1px solid #eee",
                },
                color: "#5a5a5a",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            />
          </Tabs>

          {value === 0 && (
            <>
              {children}
              {renderFab && renderFab()}
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

export default HolidayAdminPanel;
