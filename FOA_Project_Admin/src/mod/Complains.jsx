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
      email: doc.data().email,
    }));
    setCustomers(customersList);
    setFilteredCustomers(customersList);
  };

  const fetchComplaints = async () => {
    const complaintsRef = collection(db, "tempComplaints");
    const sentQuery = query(complaintsRef, where("mode", "==", "sentByAdmin"));
    const receivedQuery = query(
      complaintsRef,
      where("mode", "==", "sentByCustomer")
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
  };

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
    console.log(
      newMessage.subject,
      newMessage.content,
      selectedCustomers.length > 0
    );
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
          mode: "sentByAdmin",
          customerIds: selectedCustomers,
          recipients: selectedCustomers.map(
            (id) => customers.find((c) => c.id === id).email
          ),
        };
        console.log(newComplaint);

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
        Messages
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Received" />
        <Tab label="Sent" />
      </Tabs>

      {tabValue === 1 && (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            sx={{ mb: 3 }}
          >
            New Message
          </Button>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#1b32bb" }}
          >
            Messages sent
          </Typography>
        </>
      )}
      {tabValue === 0 && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#275a04" }}
        >
          Messages Received
        </Typography>
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

                  <Typography
                    component="p"
                    variant="body2"
                    color="text.secondary"
                  >
                    {message.mode == "sentByCustomer"
                      ? `By: ${message.email} `
                      : `To: ${message.recipients}`}
                  </Typography>
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
            email="subject"
            label="Subject"
            type="text"
            fullWidth
            variant="outlined"
            value={newMessage.subject}
            onChange={(e) => {
              setNewMessage({ ...newMessage, subject: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            email="content"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newMessage.content}
            onChange={(e) => {
              setNewMessage({ ...newMessage, content: e.target.value });
            }}
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
            email="search"
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
              label={customer.email}
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
