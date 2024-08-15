import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext"; 

const Profile = ({ open, onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    password: "",
    contact: currentUser?.contact || "",
    address: currentUser?.address || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    console.log("Updated profile data:", profileData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Profile</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" my={2}>
          <Avatar
            src={currentUser?.avatarUrl}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" hidden />
          </Button>
        </Box>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={profileData.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          value={profileData.email}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          name="password"
          type="password"
          value={profileData.password}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Contact"
          name="contact"
          value={profileData.contact}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Address"
          name="address"
          multiline
          rows={3}
          value={profileData.address}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Profile;