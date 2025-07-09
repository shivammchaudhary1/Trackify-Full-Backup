import React, { useContext, useTransition } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Radio,
  Typography,
} from "@mui/material";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize";
import { AuthContext } from "##/src/context/authcontext.js";

export default function WorkspaceCard({
  workspace,
  onChange,
  currentWorkspaceId,
  openEditModal,
  isAdmin,
  handleDeleteWorkspace,
  handleOpenDelete,
}) {
  const [isLoading, startTransition] = useTransition();
  const { loadingBarProgress, setLoadingBarProgress } = useContext(AuthContext);

  function handleChange(event) {
    setLoadingBarProgress(30);
    startTransition(async () => {
      try {
        await onChange(event);
        setLoadingBarProgress(100);
      } catch (error) {
        console.error(error);
        setLoadingBarProgress(100);
      }
    });
  }

  return (
    <Box
      key={workspace._id}
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        boxShadow:
          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        padding: "0px 5px",
        gap: "6px",
        margin: "10px 1px",
        backgroundColor: workspace._id === currentWorkspaceId ? "#BAD2ED" : "",
      }}
    >
      <FormControlLabel
        checked={workspace._id === currentWorkspaceId}
        disabled={!!loadingBarProgress}
        control={
          isLoading ? (
            <Box
              sx={{
                marginLeft: "10px",
                paddingLeft: "5px",
                paddingRight: "12px",
                borderRadius: "5px",
              }}
            >
              <CircularProgress color="inherit" size="1rem" />
            </Box>
          ) : (
            <Radio />
          )
        }
        label={
          <Typography
            sx={{
              maxWidth: "120px",
              whiteSpace: "pre-wrap",
            }}
          >
            {capitalizeFirstWord(workspace.name)}
          </Typography>
        }
        onChange={handleChange}
        sx={{
          "&.Mui-checked": {
            color: "#1976D2",
          },
          textWrap: "wrap",
        }}
        value={workspace._id}
      />
      {isAdmin && (
        <Box sx={{ display: "flex" }}>
          <IconButton
            sx={{
              width: "20px",
            }}
            onClick={() => openEditModal(workspace)}
          >
            <EditOutlinedIcon />
          </IconButton>
          <IconButton
            sx={{
              color: "red",
            }}
            onClick={() => handleOpenDelete(workspace._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
