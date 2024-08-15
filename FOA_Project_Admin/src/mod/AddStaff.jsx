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
import { auth, db, storage } from "../helpers/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddStaff = ({ open, onClose, onAdminAdded }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("admin");
  const [location, setLocation] = useState("");
  const [locations, setLocations] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setAvatarSrc(e.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (
      !email ||
      !name ||
      !phone ||
      !address ||
      (role === "deliveryGuy" && !location)
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        "123456"
      );
      const user = userCredential.user;

      let imageUrl = "";
      if (avatarFile) {
        const storageRef = ref(storage, `staff/${user.uid}`);
        await uploadBytes(storageRef, avatarFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      const staffData = {
        name,
        email,
        phone,
        address,
        role,
        status: true,
        image: imageUrl,
        uid: user.uid,
        createdAt: serverTimestamp(),
      };

      if (role === "deliveryGuy") {
        staffData.location = location;
      }

      const docRef = await addDoc(collection(db, "staff"), staffData);

      onAdminAdded({ id: docRef.id, ...staffData });
      setSnackbar({
        open: true,
        message: "Staff added successfully",
        severity: "success",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding staff:", error);
      setSnackbar({
        open: true,
        message: "Error adding staff: " + error.message,
        severity: "error",
      });
    }
  };

  const resetForm = () => {
    setAvatarFile(null);
    setAvatarSrc(null);
    setEmail("");
    setName("");
    setPhone("");
    setAddress("");
    setRole("admin");
    setLocation("");
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
        <DialogTitle>Add Staff</DialogTitle>
        <DialogContent>
          <Avatar
            src={avatarSrc}
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              cursor: "pointer",
              boxShadow: "0 0 3px #333",
            }}
            onClick={handleAvatarClick}
          />
          <TextField
            type="email"
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Phone"
            variant="outlined"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="super">Super</MenuItem>
            <MenuItem value="deliveryGuy">Delivery Guy</MenuItem>
          </TextField>
          {role === "deliveryGuy" && (
            <TextField
              select
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {`${loc.name} - $${loc.price}`}
                </MenuItem>
              ))}
              {/* Add more locations as needed */}
            </TextField>
          )}
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

export default AddStaff;
