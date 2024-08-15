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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";

const Customers = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customers, setCustomers] = useState([]);
  const open = Boolean(anchorEl);

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

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(
      customers.map((customer) => ({
        Name: customer.name,
        Address: customer.address,
        Phone: customer.phone,
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
      head: [["Name", "Address", "Phone", "Location", "Status"]],
      body: customers.map((customer) => [
        customer.name,
        customer.address,
        customer.phone,
        customer.location,
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
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        startIcon={<InfoIcon />}
      >
        PRINT CUSTOMERS
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleExportPDF}>PDF</MenuItem>
        <MenuItem onClick={handleExportExcel}>Excel</MenuItem>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Avatar src={customer.image} alt={customer.name} />
                </TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.location}</TableCell>
                <TableCell>{customer.status ? "Active" : "InActive"}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={
                      customer.status === "active" ? "secondary" : "primary"
                    }
                    onClick={() => toggleStatus(customer.id)}
                  >
                    {customer.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Customers;
