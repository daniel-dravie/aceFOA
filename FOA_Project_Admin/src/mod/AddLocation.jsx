import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  TextField,
  useTheme,
  useMediaQuery,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, storage } from "../helpers/firebase";
const AddLocation = ({ open, onClose, onAdminAdded }) => {
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [role, setRole] = useState("admin");
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubmit = async () => {
    if (!name || !price || (role === "deliveryGuy" && !location)) {
      setSnackbar({
        open: true,
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }

    try {
      const locationData = {
        name,
        price,
        status: true,
        createdAt: serverTimestamp(),
      };

      if (role === "deliveryGuy") {
        locationData.location = location;
      }

      const docRef = await addDoc(collection(db, "location"), locationData);

      onAdminAdded({ id: docRef.id, ...locationData });
      setSnackbar({
        open: true,
        message: "Location added successfully",
        severity: "success",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding Location:", error);
      setSnackbar({
        open: true,
        message: "Error adding Location: " + error.message,
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setPrice("");
    setName("");

    setRole("admin");
    setLocation("");
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsSnapshot = await getDocs(collection(db, "location"));
        const locationsData = locationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);
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
        <DialogTitle>Add Location</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Price"
            variant="outlined"
            fullWidth
            margin="normal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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

export default AddLocation;
