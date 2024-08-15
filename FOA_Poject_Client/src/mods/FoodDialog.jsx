import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  Grid,
  Box,
  Tooltip,
  TextField,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";
import { db } from "../helpers/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../context/AuthContext";

const FoodDialog = ({
  open,
  onClose,
  name,
  rating,
  price,
  imageSrc,
  description,
  id,
}) => {
  const [toppings, setToppings] = useState([]);
  const [totalPrice, setTotalPrice] = useState(price);
  const [selectedToppings, setSelectedToppings] = useState({});
  const [instructions, setInstructions] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const { currentUser } = useContext(AuthContext);
  const [clientId, setClientId] = useState(null);

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
    const fetchToppings = async () => {
      try {
        const q = query(
          collection(db, "toppings"),
          where("foods", "array-contains", id)
        );
        const querySnapshot = await getDocs(q);
        let toppingsList = [];
        querySnapshot.forEach((doc) => {
          toppingsList.push({ id: doc.id, ...doc.data() });
        });
        setToppings(toppingsList);
        const initialSelectedToppings = {};
        toppingsList.forEach((topping) => {
          initialSelectedToppings[topping.id] = false;
        });
        setSelectedToppings(initialSelectedToppings);
      } catch (error) {
        console.error("Error fetching toppings:", error);
      }
    };

    if (id) {
      fetchToppings();
    }
  }, [id]);

  useEffect(() => {
    if (alertOpen) {
      const timer = setTimeout(() => {
        setAlertOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertOpen]);

  const handleToppingChange = (toppingId, isChecked) => {
    setSelectedToppings((prev) => ({ ...prev, [toppingId]: isChecked }));

    const topping = toppings.find((t) => t.id === toppingId);
    if (topping) {
      setTotalPrice((prevPrice) =>
        isChecked ? prevPrice + topping.price : prevPrice - topping.price
      );
    }
  };

  const handleAddToCart = async () => {
    if (!clientId) {
      setAlertMessage(
        "User not authenticated or client ID not found. Please log in."
      );
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    const orderDetails = {
      foodId: id,
      foodName: name,
      foodPrice: price,
      toppings: toppings
        .filter((topping) => selectedToppings[topping.id])
        .map((topping) => ({
          name: topping.name,
          price: topping.price,
        })),
      clientId: clientId, // Using the fetched clientId here
      totalPrice: totalPrice,
      instructions: instructions,
    };

    try {
      await addDoc(collection(db, "tempOrders"), orderDetails);
      setAlertMessage("Order added to cart successfully!");
      setAlertSeverity("success");
      setAlertOpen(true);
      onClose();
    } catch (error) {
      console.error("Error adding to TempOrders:", error);
      setAlertMessage("Error adding order to cart. Please try again.");
      setAlertSeverity("error");
      setAlertOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>FOOD CHECK OUT</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={imageSrc}
                alt={name}
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 5,
                  boxShadow: "0 0 10px grey",
                  mt: 2,
                }}
              />
              <Typography sx={{ fontWeight: "bold", fontSize: "large" }}>
                {name.toUpperCase()}
              </Typography>
              <Typography
                sx={{ fontWeight: "bold", color: "#333", fontSize: "small" }}
              >
                GH₵ {price}
              </Typography>
              <Rating
                value={rating}
                readOnly
                size="small"
                sx={{ position: "relative", top: -10 }}
              />
              <Tooltip title={description} arrow placement="bottom-start">
                <Typography
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    cursor: "pointer",
                    color: "333",
                    fontSize: "0.8rem"
                  }}
                >
                  {description}
                </Typography>
              </Tooltip>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: "bold" }}>
                Choose Additional Toppings
              </Typography>
              <Grid container spacing={1} my={2}>
                {toppings.map((topping) => (
                  <Grid item xs={12} key={topping.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedToppings[topping.id] || false}
                          onChange={(e) =>
                            handleToppingChange(topping.id, e.target.checked)
                          }
                        />
                      }
                      label={
                        <Typography>
                          {topping.name}{" "}
                          <sup
                            style={{
                              background: "#6439ff",
                              color: "#fff",
                              padding: "0.1rem 0.2rem",
                              borderRadius: ".3rem",
                            }}
                          >
                            GH₵ {topping.price}
                          </sup>
                        </Typography>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
              <hr />
              <Typography sx={{ fontWeight: "bold", mt: 3 }}>
                Special Instructions
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
              <Button
                fullWidth
                startIcon={<ShoppingCart />}
                sx={{
                  mt: 2,
                  backgroundColor: "black",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
                variant="contained"
                onClick={handleAddToCart}
              >
                Add GH₵ {totalPrice.toFixed(2)} To Cart
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {alertOpen && (
        <Alert
          severity={alertSeverity}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setAlertOpen(false)}
            >
              <CloseIcon />
            </Button>
          }
          sx={{
            position: "fixed",
            top: "10%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "600px",
            zIndex: 1500,
          }}
        >
          {alertMessage}
        </Alert>
      )}
    </>
  );
};

export default FoodDialog;
