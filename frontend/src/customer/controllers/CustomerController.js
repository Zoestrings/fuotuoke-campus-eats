import { useState, useEffect, useRef } from "react";
import { AuthService } from "../services/AuthService";
import { OrderService } from "../services/OrderService";
import { get } from "../../shared/api/apiClient";
import { playChimeSound, playSuccessSound } from "../../shared/utils/sound";

export function useCustomerController(onLogoutSuccess) {
  const [user, setUser] = useState(AuthService.getSession());
  const [activePage, setActivePage] = useState("home");
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentCanteen, setCurrentCanteen] = useState(null);
  const [orderType, setOrderType] = useState("pickup");
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Fetch initial data in parallel (menu + orders at the same time)
  useEffect(() => {
    if (!user) return;
    const fetchInitialData = async () => {
      try {
        const [items, fetched] = await Promise.all([
          get("/menu"),                                  // cached by apiClient (60s TTL)
          OrderService.getCustomerOrders(user.id)
        ]);
        setMenuItems(items || []);
        setOrders(fetched || []);
      } catch (err) {
        console.error("Failed to load initial data:", err.message);
      }
    };
    fetchInitialData();
  }, [user]);

  // Poll for order status changes — paused when the tab is hidden
  useEffect(() => {
    if (!user) return;

    let timerId = null;

    const poll = async () => {
      // Skip if tab is not visible (saves CPU, battery, and server load)
      if (document.hidden) return;
      try {
        const dbOrders = await OrderService.getCustomerOrders(user.id);
        if (!Array.isArray(dbOrders)) return;

        dbOrders.forEach(dbO => {
          const localO = ordersRef.current.find(x => x.id === dbO.id);
          if (localO && localO.status !== dbO.status) {
            setNotifications(prev => [{
              id: Date.now() + Math.random(),
              message: `🔔 Order #${String(dbO.id).slice(-5)} status updated to: ${dbO.status}`
            }, ...prev]);
          }
        });
        setOrders(dbOrders);
      } catch (error) {
        console.error("Order sync error:", error);
      }
    };

    // Poll every 12 seconds (down from 4s — 75% fewer API calls)
    timerId = setInterval(poll, 12000);

    // Resume polling immediately when tab becomes visible again
    const onVisible = () => { if (!document.hidden) poll(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(timerId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0);

  const login = async (id, password, role) => {
    const res = await AuthService.login(id, password, role);
    if (res.success) {
      setUser(res.user);
      setActivePage("home");
    }
    return res;
  };

  const signup = async (signupData) => {
    const res = await AuthService.signup(signupData);
    if (res.success) {
      setUser(res.user);
      setActivePage("home");
    }
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setCart([]);
    setOrders([]);
    if (onLogoutSuccess) onLogoutSuccess();
  };

  const addToCart = (customizedItem, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(x => x.id === customizedItem.id);
      return existing
        ? prev.map(x => x.id === customizedItem.id ? { ...x, qty: x.qty + quantity } : x)
        : [...prev, { ...customizedItem, qty: quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(x => x.id === id);
      if (!existing) return prev;
      return existing.qty === 1
        ? prev.filter(x => x.id !== id)
        : prev.map(x => x.id === id ? { ...x, qty: x.qty - 1 } : x);
    });
  };

  const placeOrder = (faculty, locationData) => {
    if (!currentCanteen) {
      return { success: false, error: "Please select a canteen first." };
    }
    const outletNames = { a: "Main Cafeteria", b: "Engineering Canteen", c: "Student Union Buka", d: "Science Cafeteria" };
    const outletName = outletNames[currentCanteen] || currentCanteen;

    const order = {
      id: Date.now(),
      items: cart,
      total: cartTotal,
      outlet: { name: outletName },
      type: orderType,
      faculty: orderType === "delivery" ? faculty : null,
      latitude: orderType === "delivery" ? (locationData ? locationData.latitude : null) : null,
      longitude: orderType === "delivery" ? (locationData ? locationData.longitude : null) : null,
      formattedAddress: orderType === "delivery" ? (locationData ? locationData.formattedAddress : null) : null,
      deliveryNotes: orderType === "delivery" ? (locationData ? locationData.deliveryNotes : null) : null,
      status: "Received",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      customerId: user.id,
      customerName: user.name
    };

    setPendingOrder(order);
    setShowPayment(true);
    playChimeSound(); // Play dynamic chime sound
    return { success: true };
  };

  const confirmPayment = async (paymentMethod) => {
    if (pendingOrder) {
      try {
        const orderWithPayment = {
          ...pendingOrder,
          paymentMethod: paymentMethod || "Credit Card"
        };
        const newOrder = await OrderService.placeOrder(orderWithPayment);
        playSuccessSound(); // Play sparkling success ding
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setShowPayment(false);
        setPendingOrder(null);
        setActivePage("orders");
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: "No pending order." };
  };

  const cancelPayment = () => {
    setShowPayment(false);
    setPendingOrder(null);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    user,
    activePage,
    setActivePage,
    menuItems,
    cart,
    orders,
    cartCount,
    cartTotal,
    currentCanteen,
    setCurrentCanteen,
    orderType,
    setOrderType,
    showPayment,
    pendingOrder,
    customizingItem,
    setCustomizingItem,
    trackingOrder,
    setTrackingOrder,
    notifications,
    dismissNotification,
    login,
    signup,
    logout,
    addToCart,
    removeFromCart,
    placeOrder,
    confirmPayment,
    cancelPayment
  };
}
