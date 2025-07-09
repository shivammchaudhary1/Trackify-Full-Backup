import { CircularProgress } from "@mui/material";
import React, { Suspense } from "react";

export default function LoadWithSuspense({ children }) {
  return (
    <Suspense
      fallback={
        <CircularProgress
          sx={{ position: "fixed", top: "47%", left: "47%", zIndex: 1000 }}
        />
      }
    >
      {children}
    </Suspense>
  );
}
