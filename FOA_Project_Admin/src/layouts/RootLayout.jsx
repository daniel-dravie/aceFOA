import React from "react";
import { Container, Box } from "@mui/material";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Widget from "../components/Widget";

const RootLayout = () => {
  return (
    <Box>
      <Navbar />

      <Box sx={{ marginTop: "5rem", p: 1 }}>
        <div
          className="widgets"
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <Widget title="CUSTOMERS" />
          <Widget title="TOTAL REVENUE" />
          <Widget title="ORDERS" />
        </div>
      </Box>

      <Container maxWidth="xl">
        <Outlet />
      </Container>
    </Box>
  );
};

export default RootLayout;
