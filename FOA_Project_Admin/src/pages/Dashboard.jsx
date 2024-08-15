import React from "react";
import Widget from "../components/Widget";
import { Box, Grid } from "@mui/material";
import "../styles/dashboard.css";
import AllOrders from "../components/AllOrders";
import MostPurchased from "../components/MostPurchased";
import FoodOrderChart from "../components/FoodOrderChart";
import Customers from "../components/Customers";

const Dashboard = () => {
  return (
    <Box my={5}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AllOrders />
        </Grid>
        <Grid item xs={12}>
          <Customers />
        </Grid>
        <Grid item xs={12}>
          <MostPurchased />
        </Grid>
        <Grid item xs={12}>
          <FoodOrderChart />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
