import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../helpers/firebase"; 

const AddToppings = ({ open, onClose, onToppingAdded }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const foodsCollection = collection(db, "foods");
        const foodsSnapshot = await getDocs(foodsCollection);
        const foodsList = foodsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFoods(foodsList);
      } catch (error) {
        console.error("Error fetching foods: ", error);
        setSnackbar({
          open: true,
          message: "Error loading foods. Please try again.",
          severity: "error",
        });
      }
    };

    fetchFoods();
  }, []);

  const handleSubmit = async () => {
    if (!name || !price || selectedFoods.length === 0) {
      setSnackbar({
        open: true,
        message: "Please fill all fields and select at least one food",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const toppingsCollection = collection(db, "toppings");
      const newTopping = {
        name,
        price: parseFloat(price),
        foods: selectedFoods,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(toppingsCollection, newTopping);

      onToppingAdded({ id: docRef.id, ...newTopping });
      setSnackbar({
        open: true,
        message: "Topping added successfully",
        severity: "success",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding topping: ", error);
      setSnackbar({
        open: true,
        message: "Error adding topping. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setSelectedFoods([]);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFoodToggle = (foodId) => {
    setSelectedFoods((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId]
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            width: { xs: "90%", md: "50%" },
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Add Topping</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Price"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <p>Foods:</p>
            {foods.map((food) => (
              <Chip
                key={food.id}
                label={food.name}
                onClick={() => handleFoodToggle(food.id)}
                color={selectedFoods.includes(food.id) ? "primary" : "default"}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToppings;