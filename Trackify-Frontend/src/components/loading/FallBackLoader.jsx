import { Box, CircularProgress } from "@mui/material";

function FallBackLoader() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
      }}
    >
      <CircularProgress color="inherit" />
    </Box>
  );
}

export default FallBackLoader;
