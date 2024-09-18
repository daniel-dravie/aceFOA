import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
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
        `${customer.firstName} ${customer.lastName}`,
        customer.address,
        customer.contact,
        customer.status,
      ]),
    });
    doc.save("customers.pdf");
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
  return (
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
            <TableCell align="center">{`${(tax * 100).toFixed(0)}%`}</TableCell>
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
  );
};

export default Revenue;
