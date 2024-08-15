import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Typography, Box } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../helpers/firebase";

const MostPurchased = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMostPurchasedFoods = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const querySnapshot = await getDocs(ordersRef);

        const foodCounts = {};
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          orderData.orders.forEach((order) => {
            if (foodCounts[order.foodId]) {
              foodCounts[order.foodId].count += order.quantity;
            } else {
              foodCounts[order.foodId] = {
                name: order.foodName,
                count: order.quantity,
              };
            }
          });
        });

        const sortedFoods = Object.values(foodCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);  // Get top 5 most purchased foods

        setData(sortedFoods);
      } catch (error) {
        console.error("Error fetching most purchased foods:", error);
      }
    };

    fetchMostPurchasedFoods();
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
        MOST PURCHASED FOOD:
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MostPurchased;