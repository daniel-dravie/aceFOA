import React, { useState, useEffect } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Container,
  TextField,
  InputAdornment,
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../helpers/firebase";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const Revenue = () => {
  const [revenue, setRevenue] = useState(0);
  const [deliveryOrder, setDeliveryOrder] = useState(0);
  const [pickupOrder, setPickupOrder] = useState(0);
  const [countDelivery, setCountDelivery] = useState(0);
  const [countPickup, setCountPickup] = useState(0);

  const handlePrintRevenueExcel = () => {
    // Define the revenue data
    const orderData = [
      ["Order Type", "Total Orders", "Amount (GH₵)"],
      ["Delivery", countDelivery, deliveryOrder.toFixed(2)],
      ["Pick-Up", countPickup, pickupOrder.toFixed(2)],
      ["Gross Revenue", "", revenue.toFixed(2)],
      ["Tax", `${(tax*100).toFixed(1)}%`, (tax * revenue).toFixed(2)],
      ["Net revenue", "", netRevenue.toFixed(2)],
    ];

   

    // Create a new workbook and add two sheets
    const wb = XLSX.utils.book_new();

    // Convert the orderData array to a sheet
    const orderSheet = XLSX.utils.aoa_to_sheet(orderData);
    
    // Append both sheets to the workbook
    XLSX.utils.book_append_sheet(wb, orderSheet, "Order Data");
   

    // Export the workbook to Excel format
    XLSX.writeFile(wb, "revenue_details.xlsx");
  };

  const handlePrintRevenuePDF = () => {
    const doc = new jsPDF();
    doc.text("Revenue Details", 20, 10);
    doc.autoTable({
      head: [["Order Type", "Total Orders", "Amount (GH₵)"]],
      body: [
        ["Delivery", countDelivery, deliveryOrder.toFixed(2)],
        ["Pick-Up", countPickup, pickupOrder.toFixed(2)],
      ],
    });
    doc.autoTable({
      head: [["", "Description", "Amount (GH₵)"]],
      body: [
        ["", "Gross Revenue", revenue.toFixed(2)],
        ["", `Tax (${(tax * 100).toFixed(1)}%)`, (tax * revenue).toFixed(2)],
        ["", "Net Revenue", netRevenue.toFixed(2)],
      ],
    });
    doc.save("revenue_details.pdf");
  };

  useEffect(() => {
    const fetchTotalPrice = async () => {
      try {
        const revenueSnapshot = await getDocs(collection(db, "orders"));
        let revenue = 0;

        revenueSnapshot.forEach((doc) => {
          revenue += doc.data().totalPrice; // Assuming each document has a `totalPrice` field
        });

        const deliveryQuery = query(
          collection(db, "orders"),
          where("orderType", "==", "delivery")
        );
        const deliveryQuerySnapshot = await getDocs(deliveryQuery);
        let deliveryOrder = 0;
        let countDelivery = 0;
        deliveryQuerySnapshot.forEach((doc) => {
          countDelivery = deliveryQuerySnapshot.size;
          deliveryOrder += doc.data().totalPrice; // Assuming each document has a `totalPrice` field
        });

        const pickUpQuery = query(
          collection(db, "orders"),
          where("orderType", "==", "pickup")
        );

        const pickUpQuerySnapshot = await getDocs(pickUpQuery);

        let pickupOrder = 0;
        let countPickup = 0;
        pickUpQuerySnapshot.forEach((doc) => {
          countPickup = pickUpQuerySnapshot.size;
          pickupOrder += doc.data().totalPrice; // Assuming each document has a `totalPrice` field
        });
        setRevenue(revenue);
        setDeliveryOrder(deliveryOrder);
        setPickupOrder(pickupOrder);
        setCountDelivery(countDelivery);
        setCountPickup(countPickup);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchTotalPrice();
  }, []);

  const tax = 0.1;
  let netRevenue = revenue - tax * revenue;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          variant="contained"
          sx={{ mb: 2 }}
        >
          PRINT REVENUE DETAILS
        </Button>

        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handlePrintRevenuePDF}>
            <Button
              sx={{
                "&:hover": {
                  background: "#1565C0",
                  color: "white",
                },
              }}
            >
              PDF
            </Button>
          </MenuItem>
          <MenuItem onClick={handlePrintRevenueExcel}>
            <Button
              sx={{
                "&:hover": {
                  background: "#1565C0",
                  color: "white",
                },
              }}
            >
              Excel
            </Button>
          </MenuItem>
        </Menu>
      </div>
      <TableContainer component={Paper} sx={{ marginTop: 5 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2} sx={{ fontWeight: "bold" }}>
                REVENUE DETAILS
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ORDER TYPE</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                TOTAL ORDER
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                AMOUNT GH₵
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Delivery</TableCell>
              <TableCell align="center">{countDelivery}</TableCell>
              <TableCell align="center">{deliveryOrder.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Pick-Up</TableCell>
              <TableCell align="center">{countPickup}</TableCell>
              <TableCell align="center">{pickupOrder.toFixed(2)}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell colSpan={1} sx={{ fontWeight: "bold" }}>
                Gross Revenue
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {revenue.toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Tax</TableCell>
              <TableCell align="center">{`${(tax * 100).toFixed(
                1
              )}%`}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={1} sx={{ fontWeight: "bold" }}>
                Net Revenue
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                {netRevenue.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Revenue;
