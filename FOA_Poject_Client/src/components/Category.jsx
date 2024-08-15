import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { ArrowForwardIos, Search } from "@mui/icons-material";
import FoodCard from "./FoodCard";
import { Link } from "react-router-dom";
import { db } from "../helpers/firebase"; // Adjust the import path as needed
import { collection, getDocs } from "firebase/firestore";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategoriesAndFoods = async () => {
      try {
        // Fetch categories
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);

        // Fetch foods
        const foodsCollection = collection(db, "foods");
        const foodsSnapshot = await getDocs(foodsCollection);
        const foodsList = foodsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFoods(shuffleArray(foodsList));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchCategoriesAndFoods();
  }, []);

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ textAlign: "left", my: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search foods..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      {categories.map((category) => {
        const categoryFoods = filteredFoods.filter(
          (food) => food.categories && food.categories.includes(category.name)
        );

        return (
          <Box key={category.id} sx={{ mb: 4 }}>
            <div
              className="head"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {category.name}
              </Typography>
              <Link to={`/category/${category.id}`}>
                <IconButton>
                  <ArrowForwardIos />
                </IconButton>
              </Link>
            </div>
            {categoryFoods.length > 0 ? (
              <Grid container spacing={3}>
                {categoryFoods.slice(0, 4).map((food) => (
                  <FoodCard
                    key={food.id}
                    id={food.id}
                    imageSrc={food.image}
                    name={food.name}
                    rating={food.ratings}
                    price={food.price}
                    description={food.description}
                  />
                ))}
              </Grid>
            ) : (
              <Typography variant="body1">
                No foods found for this category.
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default Categories;
