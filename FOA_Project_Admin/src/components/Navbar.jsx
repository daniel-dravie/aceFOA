import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../helpers/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import TextsmsIcon from "@mui/icons-material/Textsms";
import Badge from "@mui/material/Badge";
import { TapasRounded, People } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import FoodBankIcon from "@mui/icons-material/FoodBank";
import Profile from "../mod/Profile";

const settings = ["Profile", "Logout"];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [name, setName] = useState("");
  const [openProfile, setOpenProfile] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const { adminID } = useParams();
  const [staffImage, setStaffImage] = useState("");
  const [staffName, setStaffName] = useState("");
  const [messagesCount, setMessagesCount] = useState(0);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState({
    received: [],
    sent: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const messagesReceived = query(
          collection(db, "tempComplaints"),
          where("mode", "==", "sentByCustomer")
        );
        const messagesSnapshot = await getDocs(messagesReceived);
        setMessagesCount(messagesSnapshot.size);

        if (currentUser && currentUser.email) {
          const staffQuery = query(
            collection(db, "staff"),
            where("email", "==", currentUser.email)
          );
          const staffSnapshot = await getDocs(staffQuery);
          if (!staffSnapshot.empty) {
            const staffData = staffSnapshot.docs[0].data();
            setStaffImage(staffData.image || "");
            setStaffName(staffData.name || "");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleOpenStaffManagement = () => {
    navigate("/admin/staff");
  };

  const handleOpenFoodManagement = () => {
    navigate("/admin/food");
  };

  const handleOpenComplaints = () => {
    fetchComplaints();
    navigate("/admin/complains");
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    navigate("/login");
  };

  const handleOpenProfile = () => {
    setOpenProfile(true);
    handleCloseUserMenu();
  };

  const handleCloseProfile = () => {
    setOpenProfile(false);
  };

  const handleMenuItemClick = (setting) => {
    if (setting === "Logout") {
      handleLogout();
    } else if (setting === "Profile") {
      handleOpenProfile();
    }
    handleCloseUserMenu();
  };

  const fetchComplaints = async () => {
    const complaintsRef = collection(db, "tempComplaints");
    const sentQuery = query(complaintsRef, where("mode", "==", "sentByAdmin"));
    const receivedQuery = query(
      complaintsRef,
      where("mode", "==", "sentByCustomer")
    );

    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery),
    ]);

    const sentComplaints = sentSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    }));

    const receivedComplaints = receivedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0],
    }));

    setMessages({
      sent: sentComplaints,
      received: receivedComplaints,
    });
    const data = messages.received;

    for (const message of data) {
      try {
        console.log(message);
        await addDoc(collection(db, "complaints"), message);
        await deleteDoc(doc(db, "tempComplaints", message.id));
      } catch (err) {
        console.log("error".err);
      }
    }
  };

  return (
    <div className="top">
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          color: "#333",
          alignItems: "center",
          top: showNavbar ? "0" : "-64px",
          transition: "top 0.3s",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <LocalDiningIcon
              sx={{
                display: { xs: "none", md: "flex" },
                color: "#fac637",
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to={`/admin/dashboard`}
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "#fac637",
                textDecoration: "none",
              }}
            >
              DRACE
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
                <Tooltip title="Admin Picture">
                  <Avatar
                    alt={staffName || "User"}
                    src={staffImage}
                    sx={{ width: 27, height: 27, bgcolor: "#6439ff" }}
                  >
                    {(staffName || "U").charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
                <Typography
                  mr={2}
                  textAlign="center"
                  sx={{ fontWeight: "bold", fontSize: 12 }}
                >
                  Hello{" "}
                  <span
                    style={{
                      marginLeft: "1px",
                      textTransform: "capitalize",
                    }}
                  >
                    {staffName}
                  </span>
                </Typography>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                <MenuItem onClick={handleCloseNavMenu}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#fcfbf7",
                      p: 1,
                      borderRadius: 2,
                    }}
                  ></Box>
                </MenuItem>
              </Menu>
            </Box>
            <LocalDiningIcon
              sx={{ display: { xs: "flex", md: "none" }, color: "#fac637" }}
            />
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to={`/admin/dashboard`}
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                color: "#fac637",
                textDecoration: "none",
              }}
            >
              DRACE
            </Typography>
            <Tooltip title="Admin Picture">
              <Avatar
                alt={staffName || "User"}
                src={staffImage}
                sx={{ width: 27, height: 27, bgcolor: "#6439ff" }}
              >
                {(staffName || "U").charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#fcfbf7",
                  p: 1,
                  borderRadius: 2,
                }}
              >
                <Typography
                  mr={2}
                  textAlign="center"
                  sx={{ fontWeight: "bold", fontSize: 16 }}
                >
                  Welcome{" "}
                  <span
                    style={{
                      marginLeft: "1px",
                      textTransform: "capitalize",
                    }}
                  >
                    {staffName}
                  </span>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Food Management">
                <IconButton
                  onClick={handleOpenFoodManagement}
                  sx={{ p: 0, mx: 1 }}
                  size="small"
                >
                  <FoodBankIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Staff Management">
                <IconButton
                  onClick={handleOpenStaffManagement}
                  sx={{ p: 0, mx: 1 }}
                  size="small"
                >
                  <People />
                </IconButton>
              </Tooltip>
              <Tooltip title="Messages">
                <IconButton
                  onClick={handleOpenComplaints}
                  sx={{ p: 0, mx: 1 }}
                  size="small"
                >
                  <Badge badgeContent={messagesCount} color="primary">
                    <TextsmsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, mx: 1 }}>
                  <ManageAccountsIcon
                    alt={staffName || "User"}
                    sx={{ width: 27, height: 27 }}
                  >
                    {(staffName || "U").charAt(0).toUpperCase()}
                  </ManageAccountsIcon>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={() => handleMenuItemClick(setting)}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Profile open={openProfile} onClose={handleCloseProfile} />
    </div>
  );
}

export default Navbar;
