import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../helpers/firebase"; 

const AddCategory = ({ open, onClose, onCategoryAdded }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [name, setName] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async () => {
    if (!name) {
      setSnackbar({
        open: true,
        message: "Please enter a category name",
        severity: "error",
      });
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "categories"), {
        name: name,
        createdAt: serverTimestamp(),
      });

      const newCategory = {
        id: docRef.id,
        name,
      };

      onCategoryAdded(newCategory);
      setSnackbar({
        open: true,
        message: "Category added successfully",
        severity: "success",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbar({
        open: true,
        message: "Error adding category. Please try again.",
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setName("");
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            width: { xs: "90%", md: "50%" },
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddCategory;
