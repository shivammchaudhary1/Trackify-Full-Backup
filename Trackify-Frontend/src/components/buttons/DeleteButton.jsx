import {Button} from "@mui/material";
import React from "react";

export const DeleteButton = ({onDelete, theme}) => {
  return (
    <Button onClick={onDelete}
      sx={{
        backgroundColor:theme?.secondaryColor,
        width:"96%",
        fontSize:"16px",
        ":hover":{
          backgroundColor: theme?.secondaryColor
        }
      }}
      variant="contained"
    >
    Delete
    </Button> 
  );
};
