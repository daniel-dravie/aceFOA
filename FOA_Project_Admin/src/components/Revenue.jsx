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

const Revenue = () => {
  const [revenue, setRevenue] = useState(0);
  const [deliveryOrder, setDeliveryOrder] = useState(0);
  const [pickupOrder, setPickupOrder] = useState(0);
  const [countDelivery, setCountDelivery] = useState(0);
  const [countPickup, setCountPickup] = useState(0);
  
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
        let countDelivery = 0
        deliveryQuerySnapshot.forEach((doc) => {
          countDelivery = (deliveryQuerySnapshot.size)
          deliveryOrder += doc.data().totalPrice; // Assuming each document has a `totalPrice` field
        });

        const pickUpQuery = query(
          collection(db, "orders"),
          where("orderType", "==", "pickup")
        );
        
        const pickUpQuerySnapshot = await getDocs(pickUpQuery);
        
        let pickupOrder = 0;
        let countPickup = 0
        pickUpQuerySnapshot.forEach((doc) => {
          countPickup = (pickUpQuerySnapshot.size)
          pickupOrder += doc.data().totalPrice; // Assuming each document has a `totalPrice` field
        });

        console.log(countDelivery)
        console.log(countPickup);
        console.log(deliveryOrder);
        console.log(revenue);
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
            <TableCell align="center">{deliveryOrder}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pick-Up</TableCell>
            <TableCell align="center">{countPickup}</TableCell>
            <TableCell align="center">{pickupOrder}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={1} sx={{ fontWeight: "bold" }}>
              Gross Revenue
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              {revenue}
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
