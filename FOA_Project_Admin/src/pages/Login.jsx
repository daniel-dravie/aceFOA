import { useContext, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import {
  Button,
  InputAdornment,
  Snackbar,
  IconButton,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff, Person } from "@mui/icons-material";
import logo from "/logo.png";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { AuthContext } from "../context/AuthContext";
import { auth, db } from "../helpers/firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const staffQuery = query(
        collection(db, "staff"),
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(staffQuery);

      if (!querySnapshot.empty) {
        const staffData = querySnapshot.docs[0].data();
        if (staffData.role === "super" && staffData.status === true) {
          dispatch({
            type: "LOGIN",
            payload: {
              ...user,
              role: staffData.role,
              staffId: querySnapshot.docs[0].id,
            },
          });
          navigate("/admin/dashboard");
        } else if (staffData.role !== "super") {
          setError("You don't have permission to access the dashboard.");
        } else if (staffData.status !== true) {
          setError(
            "Your account is currently inactive. Please contact an administrator."
          );
        }
      } else {
        setError("User not found in staff collection.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Grid
        container
        spacing={2}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item>
          <Box
            component="img"
            sx={{
              height: 150,
              width: 150,
              maxHeight: { xs: 150, md: 167 },
              maxWidth: { xs: 150, md: 167 },
              mb: 2,
            }}
            alt="Login logo"
            src={logo}
          />
        </Grid>
        <Grid item>
          <Typography
            variant="h5"
            component="h5"
            gutterBottom
            sx={{ fontWeight: "bold", color: "#333" }}
          >
            LOGIN
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            size="small"
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end">
                    <Person />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            size="small"
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ marginTop: 2, marginBottom: 2 }}
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </Grid>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </Grid>
    </Container>
  );
};

export default Login;
