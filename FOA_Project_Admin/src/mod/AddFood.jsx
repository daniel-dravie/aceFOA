import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../helpers/firebase";

const AddFood = ({ open, onClose, onFoodAdded }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [imageSrc, setImageSrc] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [ratings, setRatings] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        setSnackbar({
          open: true,
          message: "Error loading categories. Please try again.",
          severity: "error",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImageSrc(e.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !price ||
      !ratings ||
      selectedCategories.length === 0 ||
      !imageFile
    ) {
      setSnackbar({
        open: true,
        message: "Please fill all fields and select an image",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const storageRef = ref(
        storage,
        `food_images/${Date.now()}_${imageFile.name}`
      );
      const snapshot = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const foodsCollection = collection(db, "foods");
      const newFood = {
        name,
        price: parseFloat(price),
        ratings: parseFloat(ratings),
        categories: selectedCategories,
        image: imageUrl,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(foodsCollection, newFood);

      onFoodAdded({ id: docRef.id, ...newFood });
      setSnackbar({
        open: true,
        message: "Food added successfully",
        severity: "success",
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding food: ", error);
      setSnackbar({
        open: true,
        message: "Error adding food. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setImageSrc(null);
    setImageFile(null);
    setName("");
    setPrice("");
    setRatings("");
    setSelectedCategories([]);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
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
        <DialogTitle>Add Food</DialogTitle>
        <DialogContent>
          <Avatar
            src={imageSrc}
            sx={{
              width: 100,
              height: 100,
              mb: 2,
              cursor: "pointer",
              boxShadow: "0 0 3px #333",
            }}
            onClick={handleImageClick}
          />
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
          <TextField
            label="Ratings"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            inputProps={{ min: 0, max: 5, step: 0.1 }}
            value={ratings}
            onChange={(e) => setRatings(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <p>Categories:</p>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                onClick={() => handleCategoryToggle(category.name)}
                color={
                  selectedCategories.includes(category.name)
                    ? "primary"
                    : "default"
                }
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

export default AddFood;
