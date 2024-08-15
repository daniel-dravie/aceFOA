import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import { db } from "../helpers/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonAnimation from "@mui/lab/Skeleton";

const formatDate = (dateString) => {
  dateString = dateString.replace(/^"|"$/g, "");

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientId, setClientId] = useState(null);

  const { currentUser } = useContext(AuthContext);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  useEffect(() => {
    const fetchClientId = async () => {
      if (currentUser && currentUser.email) {
        try {
          const customersRef = collection(db, "customers");
          const q = query(
            customersRef,
            where("email", "==", currentUser.email)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setClientId(querySnapshot.docs[0].id);
          }
        } catch (error) {
          console.error("Error fetching client ID:", error);
        }
      }
    };

    fetchClientId();
  }, [currentUser]);

  useEffect(() => {
    setIsLoading(true);

    const ordersCollection = collection(db, "orders");
    const ordersQuery = query(
      ordersCollection,
      where("clientId", "==", clientId)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedOrders = fetchedOrders.sort(
        (a, b) => new Date(b.orderTime) - new Date(a.orderTime)
      );

      setOrders(sortedOrders);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [clientId]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ position: "relative", top: "3em", padding: "1em" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        ORDERS
      </Typography>
      {isLoading ? (
        <Box>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ marginBottom: "1em" }}>
              <SkeletonAnimation variant="rectangular" height={60} />
            </Box>
          ))}
        </Box>
      ) : orders.length === 0 ? (
        <Typography variant="body1">No orders found.</Typography>
      ) : (
        <>
          <AnimatePresence initial={false}>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              {currentOrders.map((order, index) => (
                <Accordion
                  key={order.id}
                  expanded={expanded === index}
                  onChange={handleChange(index)}
                  sx={{ marginBottom: "1em" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ backgroundColor: "#f5f5f5" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Typography variant="body1">
                        {formatDate(order.orderTime)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        GH₵ {order.totalPrice}
                      </Typography>
                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        {order.orderType}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: "#fafafa" }}>
                    <Box sx={{ marginBottom: "1em" }}>
                      <Typography variant="h6">
                        {order.orders.foodName}
                      </Typography>
                      {order.orderType === "delivery" ? (
                        <>
                          <Typography variant="body2">
                            Delivery Guy: {order.deliveryGuy.name}
                          </Typography>
                          <Typography variant="body2">
                            Contact: {order.deliveryGuy.phone}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2">
                            Token: {order.token}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: order.claimed ? "red" : "green",
                              fontWeight: "bold",
                            }}
                          >
                            Claimed: {order.claimed ? "Yes" : "No"}
                          </Typography>
                        </>
                      )}
                    </Box>

                    {order.orders.map((orderItem, index) => (
                      <Box key={index} sx={{ marginBottom: "1em" }}>
                        <Typography variant="body2">
                          Food Name: {orderItem.foodName}
                        </Typography>
                        <Typography variant="body2">
                          Total Price: GH₵ {orderItem.totalPrice.toFixed(2)}
                        </Typography>
                        <Typography variant="body2">
                          Quantity: {orderItem.quantity}
                        </Typography>
                        {orderItem.toppings && (
                          <Box sx={{ marginTop: "0.5em" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold" }}
                            >
                              Toppings:
                            </Typography>
                            {orderItem.toppings.map((topping, toppingIndex) => (
                              <Box
                                key={toppingIndex}
                                sx={{ marginLeft: "1em" }}
                              >
                                <Typography variant="body2">
                                  {topping.name} (Quantity: {topping.quantity})
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </motion.div>
          </AnimatePresence>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1em",
            }}
          >
            {Array.from(
              { length: Math.ceil(orders.length / ordersPerPage) },
              (_, index) => (
                <Typography
                  key={index}
                  variant="body1"
                  component="span"
                  sx={{
                    cursor: "pointer",
                    padding: "0.5em 1em",
                    borderRadius: "50%",
                    backgroundColor:
                      currentPage === index + 1 ? "#ccc" : "inherit",
                  }}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Typography>
              )
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default Orders;
