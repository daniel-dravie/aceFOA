import React, { useState, useEffect, useContext, useRef } from "react";
import { Typography, Box, IconButton } from "@mui/material";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase";
import { AuthContext } from "../context/AuthContext";
import FoodDialog from "../mods/FoodDialog";

const MostOrderedFoods = () => {
  const [mostOrderedFoods, setMostOrderedFoods] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const containerRef = useRef(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedFood(null);
  };

  useEffect(() => {
    const fetchMostOrderedFoods = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const customerQuery = query(
            collection(db, "customers"),
            where("uid", "==", currentUser.uid)
          );
          const customerSnapshot = await getDocs(customerQuery);

          if (!customerSnapshot.empty) {
            const customerDoc = customerSnapshot.docs[0];
            const customerId = customerDoc.id;

            const ordersRef = collection(db, "orders");
            const q = query(ordersRef, where("clientId", "==", customerId));
            const querySnapshot = await getDocs(q);

            const foodCounts = {};
            querySnapshot.forEach((doc) => {
              const orderData = doc.data();
              orderData.orders.forEach((order) => {
                if (foodCounts[order.foodId]) {
                  foodCounts[order.foodId].count += order.quantity;
                } else {
                  foodCounts[order.foodId] = {
                    id: order.foodId,
                    name: order.foodName,
                    count: order.quantity,
                  };
                }
              });
            });

            const sortedFoods = Object.values(foodCounts).sort(
              (a, b) => b.count - a.count
            );
            const topTwentyFoods = sortedFoods.slice(0, 20);

            // Fetch food details including images
            const foodsWithImages = await Promise.all(
              topTwentyFoods.map(async (food) => {
                const foodDoc = await getDoc(doc(db, "foods", food.id));
                const foodData = foodDoc.data();
                return {
                  ...food,
                  image: foodData.image || "/api/placeholder/100/100", // Use placeholder if no image
                };
              })
            );

            setMostOrderedFoods(foodsWithImages);
          }
        } catch (error) {
          console.error("Error fetching most ordered foods:", error);
        }
      }
    };

    fetchMostOrderedFoods();
  }, [currentUser]);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Your Most Ordered Foods
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={scrollLeft} sx={{ mr: 1 }}>
          <ArrowLeft />
        </IconButton>
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            overflowX: "auto",
            gap: 2,
            scrollBehavior: "smooth",
            flexGrow: 1,
          }}
        >
          {mostOrderedFoods.map((food, index) => (
            <Box
              key={index}
              onClick={() => handleFoodClick(food)}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: 200,
                p: 1,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                boxShadow: 1,
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <img
                src={food.image}
                alt={food.name}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: "50%",
                  marginRight: 10,
                }}
              />
              <Box>
                <Typography variant="subtitle2" component="div">
                  {food.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ordered {food.count} times
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <IconButton onClick={scrollRight} sx={{ ml: 1 }}>
          <ArrowRight />
        </IconButton>
      </Box>

      {selectedFood && (
        <FoodDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          name={selectedFood.name}
          rating={selectedFood.ratings || 5}
          price={selectedFood.price || 0}
          imageSrc={selectedFood.image}
          description={selectedFood.description || ""}
          id={selectedFood.id}
        />
      )}
    </Box>
  );
};

export default MostOrderedFoods;
