import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./helpers/Theme";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Staff from "./pages/Staff";
import Dashboard from "./pages/Dashboard";
import RootLayout from "./layouts/RootLayout";
import { AuthContext } from "./context/AuthContext";
import Food from "./components/Food";
import Complains from "./mod/Complains";

const App = () => {
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Welcome />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<RootLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="staff" element={<Staff />} />
            <Route path="food" element={<Food />} />
            <Route path="complains" element={<Complains />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
