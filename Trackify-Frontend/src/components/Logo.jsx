import LogoImg from "##/src/assets/images/logo/logo.png";
import { Box } from "@mui/material";

export default function Logo({ height = "80px", width = "200px" }) {
    
  return (
    <Box height={height} width={width} sx={{overflow:'hidden'}}>
      <img
        alt="Trackify"
        src={LogoImg}
        style={{ width: "100%", transform:"translateY(-33%)"}}
        />
    </Box>
  )
}
