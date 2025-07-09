import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Grid2 as Grid,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  IconButton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { selectMe } from "##/src/app/profileSlice.js";
import { selectCurrentTheme } from "##/src/app/profileSlice.js";
import {
  addAsset,
  fetchAssets,
  updateAsset,
  deleteAsset,
} from "##/src/app/assetSlice.js";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const CompanyAssets = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectMe);
  const theme = useSelector(selectCurrentTheme);
  const { items: assets, status, error } = useSelector((state) => state.assets);

  const [assetName, setAssetName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleEditAsset = (asset) => {
    setAssetName(asset.name);
    setSerialNumber(asset.serialNumber);
    setIsPrimary(asset.isPrimary);
    setEditingAsset(asset);
  };

  useEffect(() => {
    if (editingAsset) {
      setIsPrimary(editingAsset.isPrimary);
    }
  }, [editingAsset]);

  const handleUpdateAsset = async () => {
    if (!assetName || !serialNumber) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      return;
    }

    try {
      await dispatch(
        updateAsset({
          assetId: editingAsset._id,
          name: assetName,
          serialNumber,
          isPrimary: editingAsset.isPrimary, // Keep original primary status
          userId: currentUser._id,
        })
      ).unwrap();

      resetForm();
      setSnackbar({
        open: true,
        message: "Asset updated successfully!",
        severity: "success",
      });
      dispatch(fetchAssets());
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to update asset",
        severity: "error",
      });
    }
  };

  const handleDeleteAsset = async (asset) => {
    if (!asset?._id) {
      console.error("Asset ID is missing in the asset object:", asset);
      setSnackbar({
        open: true,
        message: "Cannot delete asset: Missing asset ID",
        severity: "error",
      });
      return;
    }

    try {
      const result = await dispatch(
        deleteAsset({
          assetId: asset._id,
          isPrimary: asset.isPrimary,
          userId: currentUser._id,
        })
      ).unwrap();

      setSnackbar({
        open: true,
        message: "Asset deleted successfully!",
        severity: "success",
      });
      dispatch(fetchAssets());
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete asset",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (currentUser?._id && currentUser?.currentWorkspace) {
      dispatch(fetchAssets());
    }
  }, [dispatch, currentUser?._id, currentUser?.currentWorkspace]);

  // Filter assets to only show the current user's assets
  const userAssets = React.useMemo(() => {
    if (!assets || !currentUser?._id) return [];

    return assets.filter(
      (asset) =>
        asset.userId === currentUser._id &&
        ((asset.isPrimary && asset.name && asset.serialNumber) || asset.name)
    );
  }, [assets, currentUser?._id]);

  // Check if user already has a primary asset
  const hasPrimaryAsset = React.useMemo(() => {
    return userAssets.some((asset) => asset.isPrimary);
  }, [userAssets]);

  const handleAddAsset = async () => {
    if (!assetName || !serialNumber) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "error",
      });
      return;
    }

    if (isPrimary && hasPrimaryAsset) {
      setSnackbar({
        open: true,
        message: "You can only have one primary asset",
        severity: "error",
      });
      return;
    }

    try {
      await dispatch(
        addAsset({
          name: assetName,
          serialNumber,
          isPrimary,
          userId: currentUser._id,
        })
      ).unwrap();

      resetForm();
      setSnackbar({
        open: true,
        message: "Asset added successfully!",
        severity: "success",
      });
      dispatch(fetchAssets());
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Failed to add asset",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (status === "failed") {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error.includes("workspace information not available")
            ? "Please select a workspace first"
            : `Error loading assets: ${error}`}
        </Alert>
      </Box>
    );
  }

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const resetForm = () => {
    setAssetName("");
    setSerialNumber("");
    setIsPrimary(false);
    setEditingAsset(null);
  };

  return (
    <Box sx={{ p: 3,  }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Grid
        container
        spacing={3}
        sx={{
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
        }}
      >
        {/* Left Column – Add Asset Form */}
        <Grid size={[12, 3]}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, maxHeight:"380px"  }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Add New Asset
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                fullWidth
                label="Asset Name"
                placeholder="e.g., Laptop"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Serial Number"
                placeholder="e.g., SN123456"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    disabled={hasPrimaryAsset}
                  />
                }
                label="Primary Asset"
              />
              <Button
                variant="contained"
                onClick={editingAsset ? handleUpdateAsset : handleAddAsset}
                disabled={status === "loading"}
                sx={{
                  mt: 1,
                  backgroundColor: theme?.secondaryColor,
                  "&:hover": { backgroundColor: theme?.secondaryColor },
                }}
              >
                {status === "loading"
                  ? editingAsset
                    ? "Updating..."
                    : "Adding..."
                  : editingAsset
                    ? "Save Changes"
                    : "Add Asset"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column – Asset Table */}
        <Grid size={[12, 9]}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, overflowY: "auto" }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Assigned Assets
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Name</TableCell>
                    <TableCell>Serial No/ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userAssets.map((asset, index) => (
                    <TableRow
                      key={`${asset.userId}-${asset.serialNumber}-${index}`}
                    >
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>{asset.serialNumber}</TableCell>
                      <TableCell>
                        {asset.isPrimary ? (
                          <Chip
                            label="Primary"
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          "Other"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleEditAsset(asset)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteAsset(asset)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {userAssets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No assets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyAssets;
