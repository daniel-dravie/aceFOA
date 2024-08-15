import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../helpers/firebase";

const OrderAnalysisChart = () => {
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          orderBy("orderTime", "desc"),
          limit(100)  // Limit to last 100 orders for performance
        );

        const querySnapshot = await getDocs(q);

        const processedData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            date: new Date(data.orderTime).toLocaleDateString(),
            orderType: data.orderType,
            totalPrice: data.totalPrice
          };
        });

        // Calculate the total counts for delivery and pickup orders
        const totalCounts = processedData.reduce((acc, curr) => {
          const orderType = curr.orderType.toLowerCase();
          if (orderType === 'delivery' || orderType === 'pickup') {
            acc[orderType] = (acc[orderType] || 0) + 1;
          }
          return acc;
        }, {});

        // Calculate the total number of orders
        const totalOrders = totalCounts.delivery + totalCounts.pickup;

        // Prepare data for PieChart
        const pieChartData = [
          { name: 'Delivery Orders', value: totalCounts.delivery, percentage: ((totalCounts.delivery / totalOrders) * 100).toFixed(2) },
          { name: 'Pickup Orders', value: totalCounts.pickup, percentage: ((totalCounts.pickup / totalOrders) * 100).toFixed(2) }
        ];

        setPieData(pieChartData);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchOrderData();
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", mb: 2 }}>
        MOST PURCHASED FOOD:
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label

            
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? '#8884d8' : '#82ca9d'} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} (${pieData.find(d => d.name === name).percentage}%)`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default OrderAnalysisChart;