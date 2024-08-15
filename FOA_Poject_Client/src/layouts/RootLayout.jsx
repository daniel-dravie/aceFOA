import { Box, Container } from "@mui/material";
import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div>
      <Box>
        <Navbar />
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </div>
  );
};

export default RootLayout;
