import { useState, useEffect } from "react";
import { AuthService } from "../services/AuthService";
import { MealService } from "../services/MealService";
import { OrderService } from "../services/OrderService";
import { ReportService } from "../services/ReportService";
import { MealModel } from "../models/MealModel";
import { OrderModel } from "../models/OrderModel";
import { MENU } from "../../data";
import { useToast } from "../../context/ToastContext";

export function useVendorController(onLogoutSuccess) {
  const { showToast } = useToast();
  const [user, setUser] = useState(AuthService.getSession());
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCat, setNewItemCat] = useState("Rice");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemImg, setNewItemImg] = useState("");
  const [newItemEmoji, setNewItemEmoji] = useState("");
  const [newItemPopular, setNewItemPopular] = useState(false);

  // Initialize outlet and data
  useEffect(() => {
    if (user) {
      const initialOutlet = user.canteen || "Main Cafeteria";
      setSelectedOutlet(initialOutlet);
    }
  }, [user]);

  // Load orders and menu items when selected outlet changes
  useEffect(() => {
    if (!selectedOutlet) return;

    const loadData = async () => {
      try {
        const fetchedOrders = await OrderService.getOrders(selectedOutlet);
        setOrders(fetchedOrders || []);
        const fetchedMeals = await MealService.getMeals();
        setMenuItems(fetchedMeals || []);
      } catch (error) {
        console.error("Failed to load vendor data:", error);
      }
    };

    loadData();
    // Poll for orders updates
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [selectedOutlet]);

  const login = async (id, password) => {
    const res = await AuthService.login(id, password);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    if (onLogoutSuccess) onLogoutSuccess();
  };

  const advanceOrderStatus = async (orderId, currentStatus, type) => {
    const next = OrderModel.advanceStatus(currentStatus, type);
    await OrderService.updateOrderStatus(orderId, next);
    const fetchedOrders = await OrderService.getOrders(selectedOutlet);
    setOrders(fetchedOrders || []);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const tempMeal = {
      name: newItemName,
      price: newItemPrice,
      cat: newItemCat,
      desc: newItemDesc,
      image: newItemImg,
      emoji: newItemEmoji,
      popular: newItemPopular
    };

    const val = MealModel.validate(tempMeal);
    if (!val.valid) {
      showToast(val.error, "error");
      return;
    }

    const meal = MealModel.create(tempMeal);
    await MealService.addMeal(meal);
    const fetchedMeals = await MealService.getMeals();
    setMenuItems(fetchedMeals || []);

    // Reset Form
    setNewItemName("");
    setNewItemPrice("");
    setNewItemCat("Rice");
    setNewItemDesc("");
    setNewItemImg("");
    setNewItemEmoji("");
    setNewItemPopular(false);

    showToast("Menu item added successfully!", "success");
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to remove this dish from the menu?")) {
      await MealService.deleteMeal(id);
      const fetchedMeals = await MealService.getMeals();
      setMenuItems(fetchedMeals || []);
    }
  };

  const loadDemoMeals = async () => {
    if (window.confirm("Populate menu list with default campus meals?")) {
      const fetchedMeals = await MealService.getMeals();
      setMenuItems(fetchedMeals || []);
    }
  };

  const stats = ReportService.getStats(orders);

  return {
    user,
    selectedOutlet,
    setSelectedOutlet,
    activeTab,
    setActiveTab,
    orders,
    menuItems,
    stats,
    newItemName,
    setNewItemName,
    newItemPrice,
    setNewItemPrice,
    newItemCat,
    setNewItemCat,
    newItemDesc,
    setNewItemDesc,
    newItemImg,
    setNewItemImg,
    newItemEmoji,
    setNewItemEmoji,
    newItemPopular,
    setNewItemPopular,
    login,
    logout,
    advanceOrderStatus,
    handleAddItem,
    handleDeleteItem,
    loadDemoMeals
  };
}
