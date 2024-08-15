import React, { useState, useEffect } from "react";
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

const Complains = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [tabValue, setTabValue] = useState(0);
  const [messages, setMessages] = useState({
    received: [],
    sent: [],
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: "", content: "" });
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchComplaints();
  }, []);

  const fetchCustomers = async () => {
    const customersCollection = collection(db, "customers");
    const customersSnapshot = await getDocs(customersCollection);
    const customersList = customersSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setCustomers(customersList);
    setFilteredCustomers(customersList);
  };

  const fetchComplaints = async () => {
    const complaintsRef = collection(db, "complaints");
    const sentQuery = query(complaintsRef, where("mode", "==", "sent"));
    const receivedQuery = query(complaintsRef, where("mode", "==", "received"));

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
  };

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomers([]);
  };

  const handleOpenCustomerDialog = () => setOpenCustomerDialog(true);
  const handleCloseCustomerDialog = () => setOpenCustomerDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage({ ...newMessage, [name]: value });
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = (event) => {
    if (event.target.checked) {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSubmit = async () => {
    if (
      newMessage.subject &&
      newMessage.content &&
      selectedCustomers.length > 0
    ) {
      try {
        const complaintsRef = collection(db, "complaints");

        const newComplaint = {
          subject: newMessage.subject,
          content: newMessage.content,
          date: serverTimestamp(),
          mode: "sent",
          customerIds: selectedCustomers,
          recipients: selectedCustomers.map(
            (id) => customers.find((c) => c.id === id).name
          ),
        };

        const docRef = await addDoc(complaintsRef, newComplaint);
        console.log("Complaint added with ID: ", docRef.id);

        await fetchComplaints();

        setNewMessage({ subject: "", content: "" });
        setSelectedCustomers([]);
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
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Complaints
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
                  {message.recipients && (
                    <Typography
                      component="p"
                      variant="body2"
                      color="text.secondary"
                    >
                      To: {message.recipients.join(", ")}
                    </Typography>
                  )}
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>New Complaint</DialogTitle>
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
          <Button onClick={handleOpenCustomerDialog} sx={{ mt: 2 }}>
            Select Recipients ({selectedCustomers.length})
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCustomerDialog} onClose={handleCloseCustomerDialog}>
        <DialogTitle>Select Recipients</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="search"
            label="Search Customers"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedCustomers.length === filteredCustomers.length}
                onChange={handleSelectAllCustomers}
              />
            }
            label="Select All"
          />
          {filteredCustomers.map((customer) => (
            <FormControlLabel
              key={customer.id}
              control={
                <Checkbox
                  checked={selectedCustomers.includes(customer.id)}
                  onChange={() => handleCustomerSelect(customer.id)}
                />
              }
              label={customer.name}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomerDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Complains;
