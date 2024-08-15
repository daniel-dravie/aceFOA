import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { db } from "../helpers/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const Complains = () => {
  const [staffs, setStaff] = useState([]);
  const { currentUser, dispatch } = useContext(AuthContext);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [tabValue, setTabValue] = useState(0);
  const [messages, setMessages] = useState({
    received: [],
    sent: [],
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [openCustomerDialog, setOpenStaffsDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: "", content: "" });
  const [selectedCustomers, setSelectedStaffs] = useState([]);

  useEffect(() => {
    fetchStaff();
    fetchComplaints();
    console.log(currentUser)
  }, []);

  const fetchStaff = async () => {
    const staffCollection = collection(db, "staff");
    const staffSnapshot = await getDocs(staffCollection);
    const staffList = staffSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setStaff(staffList);
    setFilteredStaffs(staffList);
  };

  const fetchComplaints = async () => {
    const complaintsRef = collection(db, "complaints" );
    const sentQuery = query(
      complaintsRef,
      where("mode", "==", "sentByCustomer")
    );
    const receivedQuery = query(
      complaintsRef,
      where("mode", "==", "sentByAdmin")
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);

    const sentComplaints = sentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    }));

    const receivedComplaints = receivedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    }));

    setMessages({
      sent: sentComplaints,
      received: receivedComplaints,
    });

    console.log(messages.sent);
    console.log(messages.received);
  };

  useEffect(() => {
    const filtered = staffs.filter((staff) =>
      staff.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStaffs(filtered);
  }, [searchQuery, staffs]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaffs([]);
  };

  const handleOpenStaffDialog = () => setOpenStaffsDialog(true);
  const handleCloseStaffDialog = () => setOpenStaffsDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({ ...newMessage, [name]: value });
  };

  const handleCustomerSelect = (staffID) => {
    setSelectedStaffs((prev) =>
      prev.includes(staffID)
        ? prev.filter((id) => id !== staffID)
        : [...prev, staffID]
    );
  };

  const handleSelectAllCustomers = (event) => {
    if (event.target.checked) {
      setSelectedStaffs(filteredStaffs.map((staff) => staff.id));
    } else {
      setSelectedStaffs([]);
    }
  };

  const handleSubmit = async () => {
    if (newMessage.subject && newMessage.content) {
      try {
        const complaintsRef = collection(db, "complaints");

        const newComplaint = {
          subject: newMessage.subject,
          content: newMessage.content,
          date: serverTimestamp(),
          mode: "sentByCustomer",
          email: currentUser.email,
        };

        const docRef = await addDoc(complaintsRef, newComplaint);
        console.log("Complaint added with ID: ", docRef.id);

        await fetchComplaints();

        setNewMessage({ subject: "", content: "" });
        setSelectedStaffs([]);
        handleCloseDialog();
      } catch (error) {
        console.error("Error adding complaint: ", error);
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  return (
    <Box sx={{ p: 3, marginTop: 10 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Messages
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Received" />
        <Tab label="Sent" />
      </Tabs>

      {tabValue === 1 && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenDialog}
          sx={{ mb: 3 }}
        >
          New Message
        </Button>
      )}

      <List>
        {messages[tabValue === 0 ? "received" : "sent"].map((message) => (
          <ListItem key={message.id} divider>
            <ListItemText
              primary={message.subject}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {message.content}
                  </Typography>
                  {` — ${message.date}`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="subject"
            label="Subject"
            type="text"
            fullWidth
            variant="outlined"
            value={newMessage.subject}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="content"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newMessage.content}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complains;
