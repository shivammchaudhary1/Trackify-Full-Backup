import {Autorenew} from "@mui/icons-material";
import { Box } from "@mui/material";
import React from "react";
export const EmptyPage = () => {
  return (
    <Box sx={{width:"100%", display:"flex", justifyContent:"center", alignItems:"center", height:"400px"}}>
      <Autorenew sx={{fontSize:"200px"}}/>
    </Box>
  );
};
