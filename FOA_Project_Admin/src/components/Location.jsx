import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import AddStaff from "../mod/AddStaff";
import { db } from "../helpers/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { doc as doc2 } from "firebase/firestore";
import { Search } from "@mui/icons-material";
import AddLocation from "../mod/AddLocation";

const Location = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);
  const fetchLocations = async () => {
    try {
      const customerCollection = collection(db, "location");
      const locationSnapshot = await getDocs(customerCollection);
      const locationList = locationSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLocations(locationList);
    } catch (error) {
      console.error("Error fetching location: ", error);
    }
  };
  const filteredLocation = locations.filter((location) =>
    location.name.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchLocation(event.target.value);
  };

  const handleOpenAddLocationDialog = () => {
    setIsAddLocationDialogOpen(true);
  };
  const handleCloseAddLocationDialog = () => {
    setIsAddLocationDialogOpen(false);
  };

  const handleToggleStatus = async (id, isLocation) => {
    try {
      const locationRef = doc2(db, "location", id);
      const locationToUpdate = isLocation;

      await updateDoc(locationRef, {
        status: !locationToUpdate.status,
      });

      if (isLocation) {
        setLocations(
          locations.map((location) =>
            location.id === id
              ? { ...location, status: !location.status }
              : location
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          my: 5,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Location
        </Typography>
        <Box>
          <TextField
            placeholder="Search location name"
            variant="outlined"
            value={searchLocation}
            onChange={handleSearchChange}
            size="small"
            sx={{ mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleOpenAddLocationDialog}>
            Add Location
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ whiteSpace: "nowrap" }} aria-label="locations table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                Location Name
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                Price GH₵
              </TableCell>

              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLocation.map((location) => (
              <TableRow
                key={location.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell sx={{ textAlign: "center" }}>
                  {location.name}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {location.price}
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  <span style={{ color: location.status ? "green" : "red" }}>
                    {location.status ? "Opened" : "Closed"}
                  </span>
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleToggleStatus(location.id, true)}
                  >
                    Toggle Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddLocation
        open={isAddLocationDialogOpen}
        onClose={handleCloseAddLocationDialog}
        onAdminAdded={(newLocation) =>
          setLocations([...locations, newLocation])
        }
      />
    </Box>
  );
};

export default Location;
