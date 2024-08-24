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
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InfoIcon from "@mui/icons-material/Info";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase";
import { Search } from "@mui/icons-material";
const AllOrders = () => {
  const [orderz, setOrderz] = useState([]);
  const [searchOrder, setSearchOrder] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showAllOrders, setShowAllOrders] = useState(false);

  const fetctOrderz = async () => {
    try {
      const orderCollection = collection(db, "orders");
      const orderSnapshot = await getDocs(orderCollection);
      const orderList = orderSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        status: doc.data().status || "pending", // Set default status if not present
      }));

      console.log("orders", orderList);

      const customerPromises = orderList.map(async (order) => {
        if (order.clientId && !customers[order.clientId]) {
          const customerDoc = await getDoc(
            doc(db, "customers", order.clientId)
          );
          if (customerDoc.exists()) {
            return {
              [order.clientId]: `${customerDoc.data().firstName} ${
                customerDoc.data().lastName
              }`,
            };
          }
        }
        return null;
      });

      const customerResults = await Promise.all(customerPromises);
      const newCustomers = Object.assign(
        {},
        ...customerResults.filter(Boolean)
      );

      setCustomers((prevCustomers) => ({ ...prevCustomers, ...newCustomers }));

      setOrderz(orderList);
    } catch (error) {
      console.error("Error fetching customers: ", error);
    }
  };

  useEffect(() => {
    fetctOrderz();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus ? "received" : "pending" });

      // Update the local state
      setOrderz(
        orderz.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus ? "received" : "pending" }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredFoods = orderz.filter((order) =>
    order.orderType.toLowerCase().includes(searchOrder.toLowerCase())
  );

  const fetchCustomers = async () => {
    try {
    } catch (error) {
      console.error("Error fetching customers: ", error);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    console.log("Excel printing");
    const workBook = XLSX.utils.book_new();
    const workSheet = XLSX.utils.json_to_sheet(
      orderz.map((order) => ({
        "Order Time": formatDate(order.orderTime),
        "Order Type": order.orderType,
        "Total Price": `GH₵ ${order.totalPrice.toFixed(2)}`,
        "Customer Name": customers[order.clientId] || "Unknown",
        "Delivery Guy Name": order.deliveryGuy?.name || "N/A",
      }))
    );

    XLSX.utils.book_append_sheet(workBook, workSheet, "Orders");
    XLSX.writeFile(workBook, "orders.xlsx");
  };

  const handleExportPDF = () => {
    console.log("PDF printing");

    const doc = new jsPDF();
    doc.text("All Orders", 20, 10);
    doc.autoTable({
      head: [
        [
          "Order Time",
          "Order Type",
          "Total Price",
          "Customer Name",
          "Delivery Guy Name",
        ],
      ],
      body: orderz.map((order) => [
        formatDate(order.orderTime),
        order.orderType,
        `GH₵ ${order.totalPrice.toFixed(2)}`,
        customers[order.clientId] || "Unknown",
        order.deliveryGuy?.name || "N/A",
      ]),
    });
    doc.save("orders.pdf");
  };

  const formatDate = (dateString) => {
    dateString = dateString.replace(/^"|"$/g, "");

    if (dateString.includes(" at ")) {
      const [datePart, timePart] = dateString.split(" at ");
      const [day, month, year] = datePart.split(" ");
      const [time, timezone] = timePart.split(" ");
      const [hours, minutes, seconds] = time.split(":");

      const date = new Date(
        Date.UTC(year, getMonthIndex(month), day, hours, minutes, seconds)
      );

      const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "UTC",
      };

      return date.toLocaleString("en-US", options) + " " + timezone;
    } else {
      // If it's not in the custom format, try to parse it as a standard date string
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  };

  const getMonthIndex = (monthName) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.indexOf(monthName);
  };

  const handleShowAllOrders = () => {
    setShowAllOrders(!showAllOrders);
  };

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
          <ShoppingCartIcon />
          PRINT ORDERS
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
          <MenuItem onClick={handleExportPDF}>
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
          <MenuItem onClick={handleExportExcel}>
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
        <Button variant="contained" onClick={handleShowAllOrders}>
          {showAllOrders ? "Hide Orders" : "Show Orders"}
        </Button>
      </div>

      {showAllOrders ? (
        <>
          <TextField
            fullWidth
            placeholder="Search Food Order..."
            label="Search Food Order"
            variant="outlined"
            value={searchOrder}
            onChange={(e) => setSearchOrder(e.target.value)}
            sx={{}}
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
                  <TableCell sx={{ fontWeight: "bold" }}>Order Time</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Order Type</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Total Price GH₵
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Customer Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFoods.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.orderTime)}</TableCell>
                    <TableCell>{order.orderType}</TableCell>
                    <TableCell>
                      GH₵ {parseFloat(order.totalPrice).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {customers[order.clientId] || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={order.status === "received"}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label={
                          order.status === "received" ? "Received" : "Pending"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title={
                          <React.Fragment>
                            <strong>Delivery Guy:</strong>{" "}
                            {order.deliveryGuy?.name || "N/A"}
                            <br />
                            <strong>Location:</strong>{" "}
                            {order.location?.name || "N/A"}
                            <br />
                            <strong>Orders:</strong>
                            <ul>
                              {order.orderz?.map((item, index) => (
                                <li key={index}>
                                  {item.foodName} x {item.quantity} - GH₵{" "}
                                  {item.foodPrice.toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </React.Fragment>
                        }
                      >
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default AllOrders;
