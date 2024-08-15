import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../helpers/firebase"; 
import { collection, getDocs, query,where } from "firebase/firestore";
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
import Badge from "@mui/material/Badge";
import { TapasRounded, People, SickRounded } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
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
  const [complaintsCount, setComplaintsCount] = useState(0);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const complaintsSnapshot = await getDocs(collection(db, "complaints"));
        setComplaintsCount(complaintsSnapshot.size);


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
    navigate("/admin/complains");
  };

  const handleOpenAddDeliveryGuy = () => {
    setOpenAddDeliveryGuy(true);
  };

  const handleOpenAddFood = () => {
    setOpenAddFood(true);
  };

  const handleOpenAddFoodCategory = () => {
    setOpenAddFoodCategory(true);
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
    try {
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#fcfbf7",
                  p: 1,
                  borderRadius: 2,
                }}
              ></Box>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Food Management">
                <IconButton
                  onClick={handleOpenFoodManagement}
                  sx={{ p: 0, mx: 1 }}
                  size="small"
                >
                  <TapasRounded />
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
              <Tooltip title="Complaints">
                <IconButton
                  onClick={handleOpenComplaints}
                  sx={{ p: 0, mx: 1 }}
                  size="small"
                >
                  <Badge badgeContent={complaintsCount} color="primary">
                    <SickRounded />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, mx: 1 }}>
                  <Avatar
                    alt={staffName || "User"}
                    src={staffImage}
                    sx={{ width: 27, height: 27, bgcolor: "#6439ff" }}
                  >
                    {(staffName || "U").charAt(0).toUpperCase()}
                  </Avatar>
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
