import React, { useState, useContext, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Profile = ({ open, onOpen, onClose }) => {
    const { currentUser } = useContext(AuthContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
   const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [lastName, setSecondName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const { clientID } = useParams();

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      setSnackbarMessage("Both password fields must be filled!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (oldPassword !== newPassword) {
      setSnackbarMessage("Old and new password do not match");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle id="form-dialog-title" >PROFILE</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
          <TextField
              required
              margin="dense"
              id="firstName"
              label="First Name"
              type="text"
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <hr />
            <TextField
              required
              autoFocus
              margin="dense"
              id="lastName"
              label=" Last Name"
              type="text"
              fullWidth
              value={lastName}
              onChange={(e) => setSecondName(e.target.value)}
            />
            <TextField
              required
              margin="dense"
              id="email"
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              required
              margin="dense"
              id="contact"
              label="Contact"
              type="text"
              fullWidth
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            
            <TextField
              required
              autoFocus
              margin="dense"
              id="old-password"
              label="Old Password"
              type="password"
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              required
              margin="dense"
              id="new-password"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Change
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Profile
