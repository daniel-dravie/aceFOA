import React from "react";
import Slideshow from "../components/Slideshow";
import { Typography, Container } from "@mui/material";
import { Outlet, NavLink, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/rootLayout.css";
import MostOrderedFoods from "../components/MostOrderedFoods";

const Dashboard = () => {
  const { clientID } = useParams();
  const location = useLocation();

  return (
    <Container>
      <Slideshow />
      <MostOrderedFoods />
      <div className="">
        <div className="links">
          <NavLink to={`/client/dashboard`} className="navLink" end>
            <Typography sx={{ fontWeight: "bold" }}>Category</Typography>
          </NavLink>

          <NavLink
            to={`/client/dashboard/all-foods`}
            className={({ isActive }) =>
              isActive && location.pathname.endsWith("/ood")
                ? "navLink active"
                : "navLink"
            }
          >
            <Typography sx={{ fontWeight: "bold" }}>All Foods</Typography>
          </NavLink>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};

export default Dashboard;
