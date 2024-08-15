import React, { useState, useEffect } from "react";
import { Box, Grid, TextField, Container, Typography } from "@mui/material";
import FoodCard from "./FoodCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";

const AllFood = () => {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFoods = async () => {
      const foodsCollection = collection(db, "foods");
      const foodSnapshot = await getDocs(foodsCollection);
      const foodList = foodSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFoods(foodList);
    };

    fetchFoods();
  }, []);

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          All Foods
        </Typography>
        <TextField
          fullWidth
          label="Search foods"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
        />
        <Grid container spacing={3}>
          {filteredFoods.map((food) => (
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
      </Box>
    </Container>
  );
};

export default AllFood;
