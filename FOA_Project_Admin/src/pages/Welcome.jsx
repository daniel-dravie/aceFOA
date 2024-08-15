import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Rating, Grid } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import {
  useScroll,
  useTransform,
  LazyMotion,
  domAnimation,
  m,
} from "framer-motion";

const gridItemStyles = {
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
  p: 2,
  display: "flex",
  flexDirection: "column",
  borderRadius: "5px",
};

const Welcome = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const [ratings, setRatings] = useState([]);

  return (
    <>
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <Box
            sx={{
              height: "90vh",
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0), #ffffffe1),url("https://img.freepik.com/free-photo/copy-space-italian-food-ingredients_23-2148551732.jpg?t=st=1717905942~exp=1717909542~hmac=998a46f341815ae1a92cb1c373722e148210a0ba95201f3b7ee8fee488283fbf&w=1380")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant={"h3"} sx={{ fontWeight: "bold", mb: 3 }}>
              Order delivery near you
            </Typography>
            <Button
              variant="contained"
              component={Link}
              color="primary"
              type="submit"
              sx={{ mt: 2 }}
              to="/login"
            >
              Login
            </Button>
          </Box>
        </m.div>
      </LazyMotion>
      <Box className="leaflet map" px={3} my={3} sx={{ flexGrow: 1 }}>
        <MapContainer
          center={[5.34034, -0.62418]} 
          zoom={12} 
          scrollWheelZoom={false} 
          style={{ height: "400px", width: "100%" }} 
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[5.34034, -0.62418]}>
            <Popup>Winneba, South Campus</Popup>
          </Marker>
          <Marker position={[5.36034, -0.67428]}>
            <Popup>Pomadze, Libery Rd</Popup>
          </Marker>
          <Marker position={[5.34734, -0.7318]}>
            <Popup>North Campus</Popup>
          </Marker>
        </MapContainer>
      </Box>

      <Box className="footer" px={3} my={3} sx={{ flexGrow: 1 }}>
        <Grid container spacing={2} sx={{ textAlign: "center" }}>
          <Grid item xs={3}>
            <Typography variant="body1" my={3}>
              Place 1
            </Typography>
            <Typography variant="body1" my={3}>
              Place 2
            </Typography>
            <Typography variant="body1" my={3}>
              Place 3
            </Typography>
          
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" my={3}>
              Place 5
            </Typography>
            <Typography variant="body1" my={3}>
              Place 6
            </Typography>
            <Typography variant="body1" my={3}>
              Place 7
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" my={3}>
              Place 9
            </Typography>
            <Typography variant="body1" my={3}>
              Place 10
            </Typography>
            <Typography variant="body1" my={3}>
              Place 11
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1" my={3}>
              Place 13
            </Typography>
            <Typography variant="body1" my={3}>
              Place 14
            </Typography>
            <Typography variant="body1" my={3}>
              Place 15
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Welcome;
