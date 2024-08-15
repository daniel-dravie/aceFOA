import Container from "@mui/material/Container";
import { useState, useContext } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import EmailIcon from "@mui/icons-material/Email";
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
import { useNavigate, Link } from "react-router-dom";
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
        collection(db, "customers"),
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(staffQuery);

      if (!querySnapshot.empty) {
        const customerData = querySnapshot.docs[0].data();
        if (customerData.status === true) {
          dispatch({
            type: "LOGIN",
            payload: {
              ...user,
              role: customerData.role,
              customerId: querySnapshot.docs[0].id,
            },
          });
          navigate("/client/dashboard");
        } else if (customerData.role !== "super") {
          setError("You don't have permission to access the dashboard.");
        } else if (customerData.status !== true) {
          setError(
            "Your account is currently inactive. Please contact an administrator."
          );
        }
      } else {
        setError("User not found in customers collection.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Box
        sx={{
          height: "95vh",
          backgroundImage:
            'url("https://img.freepik.com/free-photo/high-angle-view-various-vegetables-black-background_23-2147917348.jpg?uid=R109053140&ga=GA1.1.1690857631.1698584058&semt=ais_user")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            backgroundImage:
              'url("https://img.freepik.com/free-photo/fresh-colourful-ingredients-mexican-cuisine_23-2148254294.jpg?t=st=1717899132~exp=1717902732~hmac=986108276f3bb554e3249a7d57849453a595bd96ee731dddc3a27c38f35a83c0&w=1380")',

            height: "90vh",
          }}
        >
          <Grid
            container
            spacing={2}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: "100vh" }}
          >
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
            <Grid item>
              <TextField
                required
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
                        <EmailIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <TextField
                required
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
                sx={{ marginBottom: "10px" }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Login"}
              </Button>
            </Grid>
            <Typography>
              Do not have an account: <Link to="/signup">SignUp here</Link>
            </Typography>
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
      </Box>
    </div>
  );
};

export default Login;
