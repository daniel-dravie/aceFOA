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
  InputAdornment
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
import {  Search } from "@mui/icons-material";

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const fetchStaff = async () => {
      const staffCollection = collection(db, "staff");

      const adminQuery = query(
        staffCollection,
        where("role", "in", ["admin", "super"])
      );
      const adminSnapshot = await getDocs(adminQuery);
      const adminData = adminSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(adminData);

      const deliveryQuery = query(
        staffCollection,
        where("role", "==", "deliveryGuy")
      );
      const deliverySnapshot = await getDocs(deliveryQuery);
      const deliveryData = await Promise.all(
        deliverySnapshot.docs.map(async (doc) => {
          const data = { id: doc.id, ...doc.data() };
          if (data.location) {
            const locationDoc = await getDoc(
              doc2(db, "location", data.location)
            );
            if (locationDoc.exists()) {
              setLocations((prev) => ({
                ...prev,
                [data.location]: locationDoc.data().name,
              }));
            }
          }
          return data;
        })
      );
      setDeliveryGuys(deliveryData);
    };

    fetchStaff();
  }, []);

  const handleOpenAddStaffDialog = () => {
    setIsAddStaffDialogOpen(true);
  };

  const handleCloseAddStaffDialog = () => {
    setIsAddStaffDialogOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleStatus = async (id, isAdmin) => {
    try {
      const staffRef = doc2(db, "staff", id);
      const staffToUpdate = isAdmin
        ? admins.find((admin) => admin.id === id)
        : deliveryGuys.find((guy) => guy.id === id);

      await updateDoc(staffRef, {
        status: !staffToUpdate.status,
      });

      if (isAdmin) {
        setAdmins(
          admins.map((admin) =>
            admin.id === id ? { ...admin, status: !admin.status } : admin
          )
        );
      } else {
        setDeliveryGuys(
          deliveryGuys.map((guy) =>
            guy.id === id ? { ...guy, status: !guy.status } : guy
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  const filteredDeliveryGuys = useMemo(() => {
    return deliveryGuys.filter((guy) =>
      guy.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deliveryGuys, searchTerm]);

  const handleAdminAdded = (newStaff) => {
    if (newStaff.role === "admin" || newStaff.role === "super") {
      setAdmins([...admins, newStaff]);
    } else if (newStaff.role === "deliveryGuy") {
      setDeliveryGuys([...deliveryGuys, newStaff]);
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
          Staff
        </Typography>
        <Box>
          <TextField
        
            placeholder="Search name"
            variant="outlined"
            value={searchTerm}
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
          <Button variant="contained" onClick={handleOpenAddStaffDialog}>
            Add Staff
          </Button>
        </Box>
      </Box>

      {/* Admins Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Admins
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ whiteSpace: "nowrap" }} aria-label="admins table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Phone</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Address</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Status</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Role</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAdmins.map((admin) => (
              <TableRow
                key={admin.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  sx={{ textAlign: "center" }}
                  component="th"
                  scope="row"
                >
                  <Avatar alt={admin.name} src={admin.image} />
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{admin.name}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {admin.email}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {admin.phone}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {admin.address}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <span style={{ color: admin.status ? "green" : "red" }}>
                    {admin.status ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{admin.role}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleToggleStatus(admin.id, true)}
                  >
                    Toggle Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delivery Guys Table */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Delivery Guys
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ whiteSpace: "nowrap" }} aria-label="delivery guys table">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Name</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Phone</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Address</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Status</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Location</TableCell>
              <TableCell sx={{ textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeliveryGuys.map((guy) => (
              <TableRow
                key={guy.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  sx={{ textAlign: "center" }}
                  component="th"
                  scope="row"
                >
                  <Avatar alt={guy.name} src={guy.image} />
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>{guy.name}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{guy.email}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{guy.phone}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {guy.address}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <span style={{ color: guy.status ? "green" : "red" }}>
                    {guy.status ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {locations[guy.location] || "Unknown"}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    onClick={() => handleToggleStatus(guy.id, false)}
                  >
                    Toggle Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddStaff
        open={isAddStaffDialogOpen}
        onClose={handleCloseAddStaffDialog}
        onAdminAdded={(newAdmin) => setAdmins([...admins, newAdmin])}
      />
    </Box>
  );
};

export default Staff;