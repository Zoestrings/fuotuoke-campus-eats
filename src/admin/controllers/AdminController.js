import { useState, useEffect } from "react";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { MenuService } from "../services/MenuService";
import { OrderService } from "../services/OrderService";
import { PaymentService } from "../services/PaymentService";
import { ReportService } from "../services/ReportService";
import { SystemSettingsService } from "../services/SystemSettingsService";
import { AuditLogService } from "../services/AuditLogService";

export function useAdminController(onLogoutSuccess) {
  const [user, setUser] = useState(AuthService.getSession());
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [settings, setSettings] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      const allUsers = await UserService.getAll();
      setUsers(allUsers || []);
      const allMenu = await MenuService.getAll();
      setMenuItems(allMenu || []);
      const allOrders = await OrderService.getAll();
      setOrders(allOrders || []);
      const allPayments = await PaymentService.getPayments();
      setPayments(allPayments || []);
      const platformStats = ReportService.getPlatformStats(allOrders, allUsers, allMenu);
      setStats(platformStats || {});
      const appSettings = await SystemSettingsService.getSettings();
      setSettings(appSettings || {});
      const allLogs = await AuditLogService.getLogs();
      setLogs(allLogs || []);
    } catch (error) {
      console.error("Admin data load error:", error);
    }
  };

  const login = async (id, password) => {
    const res = await AuthService.login(id, password);
    if (res.success) {
      setUser(res.user);
      await AuditLogService.logAction(res.user.name, "Administrator Logged In");
      await loadAllData();
    }
    return res;
  };

  const logout = async () => {
    if (user) {
      await AuditLogService.logAction(user.name, "Administrator Logged Out");
    }
    AuthService.logout();
    setUser(null);
    if (onLogoutSuccess) onLogoutSuccess();
  };

  const toggleUserStatus = async (id, currentStatus, name) => {
    const newStatus = await UserService.toggleStatus(id, currentStatus);
    await AuditLogService.logAction(user.name, `Toggled status of user ${name} to ${newStatus}`);
    await loadAllData();
  };

  const deleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
      await UserService.deleteUser(id);
      await AuditLogService.logAction(user.name, `Deleted user account ${name} (${id})`);
      await loadAllData();
    }
  };

  const saveUser = async (id, userData) => {
    await UserService.saveUser(id, userData);
    await AuditLogService.logAction(user.name, `Updated details of user account: ${userData.name} (${id})`);
    await loadAllData();
  };

  const addUser = async (userData) => {
    await UserService.addUser(userData);
    await AuditLogService.logAction(user.name, `Created new user account: ${userData.name} (${userData.id})`);
    await loadAllData();
  };


  const deleteMenuItem = async (id, name) => {
    if (window.confirm(`Remove ${name} globally from all canteens?`)) {
      await MenuService.deleteItem(id);
      await AuditLogService.logAction(user.name, `Deleted platform meal: ${name}`);
      await loadAllData();
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm(`Delete order record #${String(id).slice(-5)}?`)) {
      await OrderService.deleteOrder(id);
      await AuditLogService.logAction(user.name, `Deleted order #${String(id).slice(-5)}`);
      await loadAllData();
    }
  };

  const updateOrderStatus = async (id, status, updatedFields = {}) => {
    await OrderService.updateStatus(id, status, updatedFields);
    await AuditLogService.logAction(user.name, `Updated order #${String(id).slice(-5)} details/status`);
    await loadAllData();
  };

  const updatePayment = async (id, updatedFields) => {
    await PaymentService.updatePayment(id, updatedFields);
    await AuditLogService.logAction(user.name, `Updated financial transaction record: ${id}`);
    await loadAllData();
  };

  const deletePayment = async (id) => {
    if (window.confirm(`Delete financial transaction log ${id}?`)) {
      await PaymentService.deletePayment(id);
      await AuditLogService.logAction(user.name, `Deleted financial transaction log: ${id}`);
      await loadAllData();
    }
  };

  const saveSettings = async (newSettings) => {
    await SystemSettingsService.saveSettings(newSettings);
    await AuditLogService.logAction(user.name, "Saved system settings preferences");
    await loadAllData();
    alert("Settings saved successfully!");
  };

  const resetPlatform = async () => {
    if (window.confirm("CRITICAL WARNING: This will reset all databases and localStorage variables. Proceed?")) {
      SystemSettingsService.resetDatabase();
      await loadAllData();
      alert("Platform database reset to seed values successfully!");
      await logout();
    }
  };

  return {
    user,
    activeTab,
    setActiveTab,
    users,
    menuItems,
    orders,
    payments,
    stats,
    settings,
    logs,
    login,
    logout,
    toggleUserStatus,
    deleteUser,
    saveUser,
    addUser,
    deleteMenuItem,
    deleteOrder,
    updateOrderStatus,
    updatePayment,
    deletePayment,
    saveSettings,
    resetPlatform
  };
}
