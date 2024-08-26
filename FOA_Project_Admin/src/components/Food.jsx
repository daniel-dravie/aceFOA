import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Table,
  TableBody,
  Avatar,
  IconButton,
  TextField,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  InputAdornment
} from "@mui/material";
import {  Search } from "@mui/icons-material";
import PlaylistAddTwoToneIcon from "@mui/icons-material/PlaylistAddTwoTone";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddFood from "../mod/AddFood";
import AddToppings from "../mod/AddToppings";
import AddCategory from "../mod/AddCategory";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../helpers/firebase";

const EditFoodDialog = ({ open, onClose, food, onSave }) => {
  const [editedFood, setEditedFood] = useState(food);

  const handleSave = () => {
    onSave(editedFood);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Food</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={editedFood.name}
          onChange={(e) =>
            setEditedFood({ ...editedFood, name: e.target.value })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="Price"
          type="number"
          value={editedFood.price}
          onChange={(e) =>
            setEditedFood({ ...editedFood, price: parseFloat(e.target.value) })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="Ratings"
          type="number"
          value={editedFood.ratings}
          onChange={(e) =>
            setEditedFood({
              ...editedFood,
              ratings: parseFloat(e.target.value),
            })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="Categories (comma-separated)"
          value={editedFood.categories.join(", ")}
          onChange={(e) =>
            setEditedFood({
              ...editedFood,
              categories: e.target.value.split(", "),
            })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          multiline
          rows={4}
          value={editedFood.description || ""}
          onChange={(e) =>
            setEditedFood({
              ...editedFood,
              description: e.target.value,
            })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditToppingDialog = ({ open, onClose, topping, onSave, foods }) => {
  const [editedTopping, setEditedTopping] = useState(topping);

  const handleSave = () => {
    onSave(editedTopping);
    onClose();
  };

  const handleFoodChange = (event) => {
    const selectedFoodIds = event.target.value;
    setEditedTopping({ ...editedTopping, foods: selectedFoodIds });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Topping</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={editedTopping.name}
          onChange={(e) =>
            setEditedTopping({ ...editedTopping, name: e.target.value })
          }
        />
        <TextField
          fullWidth
          margin="normal"
          label="Price"
          type="number"
          value={editedTopping.price}
          onChange={(e) =>
            setEditedTopping({
              ...editedTopping,
              price: parseFloat(e.target.value),
            })
          }
        />
        <Select
          fullWidth
          multiple
          value={editedTopping.foods || []}
          onChange={handleFoodChange}
          renderValue={(selected) =>
            selected
              .map((id) => foods.find((food) => food.id === id)?.name)
              .join(", ")
          }
        >
          {foods.map((food) => (
            <MenuItem key={food.id} value={food.id}>
              <Checkbox
                checked={(editedTopping.foods || []).indexOf(food.id) > -1}
              />
              <ListItemText primary={food.name} />
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditCategoryDialog = ({ open, onClose, category, onSave }) => {
  const [editedCategory, setEditedCategory] = useState(category);

  const handleSave = () => {
    onSave(editedCategory);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Category</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={editedCategory.name}
          onChange={(e) =>
            setEditedCategory({ ...editedCategory, name: e.target.value })
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfirmDialog = ({ open, onClose, onConfirm, title, content }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{content}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>No</Button>
      <Button onClick={onConfirm} color="primary">
        Yes
      </Button>
    </DialogActions>
  </Dialog>
);

const Food = () => {
  const [foods, setFoods] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foodSearch, setFoodSearch] = useState("");
  const [toppingSearch, setToppingSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [addToppingsDialogOpen, setAddToppingsDialogOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodsSnapshot = await getDocs(collection(db, "foods"));
        const toppingsSnapshot = await getDocs(collection(db, "toppings"));
        const categoriesSnapshot = await getDocs(collection(db, "categories"));

        setFoods(
          foodsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setToppings(
          toppingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
        setCategories(
          categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddFood = (newFood) => {
    setFoods([...foods, newFood]);
  };

  const handleAddTopping = (newTopping) => {
    setToppings([...toppings, newTopping]);
  };

  const handleAddCategory = (newCategory) => {
    setCategories([...categories, newCategory]);
  };

  const handleEdit = (item, type) => {
    setEditItem({ item, type });
  };

  const handleSaveEdit = async (editedItem) => {
    try {
      await updateDoc(doc(db, editItem.type, editedItem.id), editedItem);
      switch (editItem.type) {
        case "foods":
          setFoods(
            foods.map((food) => (food.id === editedItem.id ? editedItem : food))
          );
          break;
        case "toppings":
          setToppings(
            toppings.map((topping) =>
              topping.id === editedItem.id ? editedItem : topping
            )
          );
          break;
        case "categories":
          setCategories(
            categories.map((category) =>
              category.id === editedItem.id ? editedItem : category
            )
          );
          break;
      }
    } catch (error) {
      console.error(`Error updating ${editItem.type}:`, error);
    }
    setEditItem(null);
  };

  const handleDelete = (id, type) => {
    setConfirmDelete({ id, type });
  };

  const confirmDeleteItem = async () => {
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, confirmDelete.type, confirmDelete.id));
      switch (confirmDelete.type) {
        case "foods":
          setFoods(foods.filter((food) => food.id !== confirmDelete.id));
          break;
        case "toppings":
          setToppings(
            toppings.filter((topping) => topping.id !== confirmDelete.id)
          );
          break;
        case "categories":
          setCategories(
            categories.filter((category) => category.id !== confirmDelete.id)
          );
          break;
      }
    } catch (error) {
      console.error(`Error deleting ${confirmDelete.type}:`, error);
    }
    setConfirmDelete(null);
  };

  const handleAdd = (type) => {
    switch (type.toLowerCase()) {
      case "food":
      case "foods":
        setAddFoodDialogOpen(true);
        break;
      case "topping":
      case "toppings":
        setAddToppingsDialogOpen(true);
        break;
      case "category":
      case "categories":
        setAddCategoryDialogOpen(true);
        break;
      default:
        console.log(`Add new ${type}`);
    }
  };

  const renderTable = (
    title,
    data,
    searchValue,
    setSearchValue,
    addButtonText,
    columns,
    renderRow
  ) => (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">{title}</Typography>
        <Button
          variant="contained"
          onClick={() => handleAdd(title.toLowerCase())}
        >
          <PlaylistAddTwoToneIcon />

          {addButtonText}
        </Button>
      </Box>
      <TextField
        fullWidth
        
        variant="outlined"
        placeholder={`Search ${title}`}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .filter((item) =>
                Object.values(item).some(
                  (value) =>
                    typeof value === "string" &&
                    value.toLowerCase().includes(searchValue.toLowerCase())
                )
              )
              .map(renderRow)}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderFoodStack = (foodIds) => (
    <Stack direction="row" spacing={1}>
      {foodIds.map((foodId) => {
        const food = foods.find((f) => f.id === foodId);
        return food ? (
          <Box key={food.id} sx={{ textAlign: "center" }}>
            <Avatar
              src={food.image}
              alt={food.name}
              sx={{ width: 30, height: 30, margin: "0 auto" }}
            />
            <Typography variant="caption">{food.name}</Typography>
          </Box>
        ) : null;
      })}
    </Stack>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Food Management
      </Typography>

      {renderTable(
        "Foods",
        foods,
        foodSearch,
        setFoodSearch,
        "Add Food",
        ["Image", "Name", "Price", "Ratings", "Categories", "Actions"],
        (food) => (
          <TableRow key={food.id}>
            <TableCell>
              <Avatar src={food.image} alt={food.name} />
            </TableCell>
            <TableCell>{food.name}</TableCell>
            <TableCell>${food.price.toFixed(2)}</TableCell>
            <TableCell>{food.ratings}</TableCell>
            <TableCell>
              {food.categories ? food.categories.join(", ") : ""}
            </TableCell>
            <TableCell>
              <IconButton
                onClick={() => handleEdit(food, "foods")}
                color="warning"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(food.id, "foods")}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        )
      )}

      {renderTable(
        "Toppings",
        toppings,
        toppingSearch,
        setToppingSearch,
        "Add Topping",
        ["Name", "Price", "Foods", "Actions"],
        (topping) => (
          <TableRow key={topping.id}>
            <TableCell>{topping.name}</TableCell>
            <TableCell>${topping.price.toFixed(2)}</TableCell>
            <TableCell>{renderFoodStack(topping.foods || [])}</TableCell>
            <TableCell>
              <IconButton
                onClick={() => handleEdit(topping, "toppings")}
                color="warning"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(topping.id, "toppings")}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        )
      )}

      {renderTable(
        "Categories",
        categories,
        categorySearch,
        setCategorySearch,
        "Add Category",
        ["Name", "Actions"],
        (category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>
              <IconButton
                onClick={() => handleEdit(category, "categories")}
                color="warning"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => handleDelete(category.id, "categories")}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        )
      )}

      <AddFood
        open={addFoodDialogOpen}
        onClose={() => setAddFoodDialogOpen(false)}
        onFoodAdded={handleAddFood}
        categories={categories}
      />

      <AddToppings
        open={addToppingsDialogOpen}
        onClose={() => setAddToppingsDialogOpen(false)}
        onToppingAdded={handleAddTopping}
        foods={foods}
      />

      <AddCategory
        open={addCategoryDialogOpen}
        onClose={() => setAddCategoryDialogOpen(false)}
        onCategoryAdded={handleAddCategory}
      />

      {editItem && editItem.type === "foods" && (
        <EditFoodDialog
          open={!!editItem}
          onClose={() => setEditItem(null)}
          food={editItem.item}
          onSave={handleSaveEdit}
        />
      )}

      {editItem && editItem.type === "toppings" && (
        <EditToppingDialog
          open={!!editItem}
          onClose={() => setEditItem(null)}
          topping={editItem.item}
          onSave={handleSaveEdit}
          foods={foods}
        />
      )}

      {editItem && editItem.type === "categories" && (
        <EditCategoryDialog
          open={!!editItem}
          onClose={() => setEditItem(null)}
          category={editItem.item}
          onSave={handleSaveEdit}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteItem}
        title="Confirm Delete"
        content={`Are you sure you want to delete this ${confirmDelete?.type.slice(
          0,
          -1
        )}?`}
      />
    </Box>
  );
};

export default Food;