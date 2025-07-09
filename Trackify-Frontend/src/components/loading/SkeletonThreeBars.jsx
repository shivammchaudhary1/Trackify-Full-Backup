import { Box, Skeleton } from "@mui/material";
import React from "react";

export default function SkeletonThreeBars({ shouldDisplay, top = "31%" }) {
  if (!shouldDisplay) {
    return;
  }

  return (
    <Box sx={{ width: "96%", position: "fixed", top: top, marginLeft: "2%" }}>
      <Skeleton sx={{ width: "100%" }} />
      <Skeleton animation="wave" sx={{ width: "100%" }} />
      <Skeleton animation={false} sx={{ width: "100%" }} />
    </Box>
  );
}
