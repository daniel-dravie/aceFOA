import React, { useState, useEffect } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Box,
  TextField, InputAdornment,
} from "@mui/material";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";
import { Person, Search } from "@mui/icons-material";

const Customers = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customers, setCustomers] = useState([]);
 
  const open = Boolean(anchorEl);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [showAllCustomers, setShowAllcustomers] = useState(false);
  const handleShowAllCustomers = () => {
    setShowAllcustomers(!showAllCustomers);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const customerCollection = collection(db, "customers");
      const customerSnapshot = await getDocs(customerCollection);
      const customerList = customerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(customerList);
    } catch (error) {
      console.error("Error fetching customers: ", error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const filteredCustomer = customers.filter((customer) =>
    customer.firstName.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(
      customers.map((customer) => ({
        Name: `${customer.firstName} ${customer.lastName}`,
        Address: customer.address,
        Phone: customer.contact,
        Location: customer.location,
        Status: customer.status,
      }))
    );

    XLSX.utils.book_append_sheet(workBook, workSheet, "Customers");
    XLSX.writeFile(workBook, "customers.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("All Customers", 20, 10);
    doc.autoTable({
      head: [["Name", "Address", "Phone", "Status"]],
      body: customers.map((customer) => [
        customer.name,
        customer.address,
        customer.contact,
        customer.status,
      ]),
    });
    doc.save("customers.pdf");
  };

  const toggleStatus = (customerId) => {
    console.log("Toggle status for customer:", customerId);
  };

  return (
    <Box my={5}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          startIcon={<Person />}
        >
          PRINT CUSTOMERS
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleExportPDF}>PDF</MenuItem>
          <MenuItem onClick={handleExportExcel}>Excel</MenuItem>
        </Menu>
        <Button variant="contained" onClick={handleShowAllCustomers}>
          {showAllCustomers ? "Hide Customers" : "Show Customers"}
        </Button>
      </div>
      
      <>
      {showAllCustomers? (<> 
        <TextField
          fullWidth
          placeholder="Search Customer..."
          label="Search Customer"
          variant="outlined"
          value={searchCustomer}
          onChange={(e) => setSearchCustomer(e.target.value)}
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Image</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomer.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Avatar src={customer.imageUrl} alt={customer.name} />
                  </TableCell>
                  <TableCell>
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.contact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>{" "}</>):("")}
        
      </>
    </Box>
  );
};

export default Customers;