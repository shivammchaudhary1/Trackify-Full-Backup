import React from "react";
import bgImage from "##/src/assets/images/background-images/bg.svg";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SignUpLoginRightSection({
  title,
  description,
  buttonText,
  buttonLink,
}) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundImage: `url(${bgImage})`,
        width: "35%",
        display: ["none", "none", "flex"],
        height: "107vh",
        overflow: "hidden",
        backgroundSize: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "30px",
      }}
    >
      <Box
        sx={{
          color: "#fff",
          fontWeight: "600",
          fontSize: ["32px", "32px", "42px"],
          fontFamily: "Poppins,sans-serif",
          textAlign: "center",
          px: "2px",
        }}
      >
        {title}
      </Box>
      <Typography
        sx={{
          my: "15px",
          fontSize: "26px",
          fontWeight: "350",
          color: "#fff",
          maxWidth: "50%",
          textAlign: "center",
          mt: "45px",
        }}
        variant="p"
      >
        {description}
      </Typography>
      <Box
        onClick={() => {
          navigate(buttonLink);
        }}
        sx={{
          color: "#fff",
          fontSize: "23px",
          fontWeight: "300",
          textAlign: "center",
          padding: "7px 5px",
          border: "3px solid white",
          borderRadius: "35px",
          width: "180px",
          mt: "10px",
          "&:active": {
            backgroundColor: "#19acb4",
            boxShadow: "0 5px #40c1c8",
            transform: "translateY(4px)",
          },
          "&:hover": {
            animation: "ease-in",
            backgroundColor: "#1d777cb6",
            cursor: "pointer",
          },
        }}
      >
        <Typography sx={{ color: "#fff" }} variant="p">
          {buttonText}
        </Typography>
      </Box>
    </Box>
  );
}
