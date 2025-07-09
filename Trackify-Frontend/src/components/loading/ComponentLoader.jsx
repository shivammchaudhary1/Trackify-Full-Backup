import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";

const ComponentLoader = (props) => {
  const [isLoading, setIsLoading] = useState(props.isLoading || false);
    
  useEffect(() => {
    setIsLoading(props.isLoading);
  }, [props.isLoading]);

  return isLoading ? (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <CircularProgress /> 
    </Box>
  ): props.children;
};


export default ComponentLoader;
