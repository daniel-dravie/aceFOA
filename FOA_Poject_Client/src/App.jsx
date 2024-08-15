import { useContext } from "react";
import Login from "./pages/Login";
import WelcomePage from "./pages/WelcomePage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import RootLayout from "./layouts/RootLayout";
import AllFood from "./components/AllFood";
import Orders from "./components/Orders";
import { ThemeProvider } from "@mui/material/styles";
import Category from "./components/Category";
import theme from "./helpers/Theme";
import Complains from "./mods/Complains";

function App() {
  const currentUser = useContext(AuthContext);
  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route>
            <Route path="" element={<WelcomePage />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="client" element={<RootLayout />}>
              <Route path="dashboard" element={<Dashboard />}>
                <Route index element={<Category />} />
                <Route path="all-foods" element={<AllFood />} />
              </Route>
              <Route path="orders" element={<Orders />} />
              <Route path="complains" element={<Complains/>}/>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
