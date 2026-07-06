import React, { useState } from "react";
import { Badge, Btn } from "../../../shared/ui";

export default function OrderManagement({ orders = [], onDelete, onUpdateStatus }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal state for editing order details
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editOutletName, setEditOutletName] = useState("");
  const [editTotal, setEditTotal] = useState("");
  const [editOrderType, setEditOrderType] = useState("pickup");
  const [editFaculty, setEditFaculty] = useState("");
  const [editStatus, setEditStatus] = useState("Received");

  const filtered = orders.filter(o => {
    const matchesSearch = String(o.id).includes(search) ||
                          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                          o.outlet?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (order) => {
    setEditOrderId(order.id);
    setEditCustomerName(order.customerName || "");
    setEditOutletName(order.outlet?.name || "");
    setEditTotal(order.total || "");
    setEditOrderType(order.type || "pickup");
    setEditFaculty(order.faculty || "");
    setEditStatus(order.status || "Received");
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editCustomerName.trim() || !editTotal || !editOutletName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    // Prepare updated order object fields
    const updatedFields = {
      customerName: editCustomerName.trim(),
      outlet: { name: editOutletName.trim() },
      total: Number(editTotal),
      type: editOrderType,
      faculty: editOrderType === "delivery" ? editFaculty.trim() : null,
      status: editStatus
    };

    onUpdateStatus(editOrderId, editStatus, updatedFields);
    setIsEditOpen(false);
    alert("✅ Order details updated successfully!");
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed": return "green";
      case "Cancelled": return "red";
      case "Received": return "blue";
      default: return "gold";
    }
  };

  return (
    <div className="animate-fade-in vendor-panel-card">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
        Platform Orders &amp; Transactions Registry
      </h3>
      <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 20 }}>
        Track, update, edit details, accept, cancel, or delete order transactions executed on the FUOTUOKE Campus Eats network.
      </p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="form-input"
          placeholder="Search by ID, customer name, or outlet..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="form-input"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="all">All Statuses</option>
          <option value="Received">Received</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Ready for Pickup">Ready for Pickup</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
              {["Order ID", "Customer", "Outlet", "Order Details", "Total", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 10px", fontSize: ".76rem", fontWeight: 850, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, idx) => {
              const currentStatus = o.status || "Received";
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "transparent" : "var(--bg-main)" }}>
                  <td style={{ padding: "14px 10px", fontWeight: 700, fontSize: ".84rem" }}>#{String(o.id).slice(-5)}</td>
                  <td style={{ padding: "14px 10px", fontSize: ".86rem" }}>
                    <div><strong>{o.customerName}</strong></div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{o.customerId}</div>
                  </td>
                  <td style={{ padding: "14px 10px", fontSize: ".86rem" }}>{o.outlet?.name}</td>
                  <td style={{ padding: "14px 10px", fontSize: ".82rem" }}>
                    <div>{o.items.map(it => `${it.name} x${it.qty}`).join(", ")}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--text-muted)" }}>{o.type.toUpperCase()} · {o.time} {o.faculty ? `(${o.faculty})` : ""}</div>
                  </td>
                  <td style={{ padding: "14px 10px", fontWeight: 800, color: "var(--green-text)", fontSize: ".88rem" }}>
                    ₦{o.total.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <Badge color={getStatusBadgeColor(currentStatus)}>{currentStatus}</Badge>
                      <select
                        value={currentStatus}
                        onChange={e => onUpdateStatus(o.id, e.target.value, { status: e.target.value })}
                        style={{ fontSize: ".72rem", padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer", fontWeight: 600 }}
                      >
                        <option value="Received">Received</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: "14px 10px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Btn sm variant="outline" onClick={() => openEditModal(o)}>
                        <i className="bi bi-pencil" /> Edit
                      </Btn>
                      
                      {currentStatus === "Received" && (
                        <Btn sm variant="primary" onClick={() => onUpdateStatus(o.id, "Preparing", { status: "Preparing" })}>
                          Accept
                        </Btn>
                      )}

                      {currentStatus !== "Completed" && currentStatus !== "Cancelled" && (
                        <Btn sm variant="gold" onClick={() => onUpdateStatus(o.id, "Cancelled", { status: "Cancelled" })}>
                          Cancel
                        </Btn>
                      )}

                      <Btn sm variant="danger" onClick={() => onDelete(o.id)}>
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No order transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Order Modal */}
      {isEditOpen && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-in" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Order Details</h3>
              <button className="modal-close-btn" onClick={() => setIsEditOpen(false)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="form-label">Customer Name <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    value={editCustomerName}
                    onChange={e => setEditCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Canteen Outlet <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    value={editOutletName}
                    onChange={e => setEditOutletName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Total Value (₦) <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    value={editTotal}
                    onChange={e => setEditTotal(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Order Type</label>
                  <select
                    className="form-input"
                    value={editOrderType}
                    onChange={e => setEditOrderType(e.target.value)}
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Faculty Delivery</option>
                  </select>
                </div>

                {editOrderType === "delivery" && (
                  <div>
                    <label className="form-label">Faculty Location</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Science Lecture Theatre"
                      value={editFaculty}
                      onChange={e => setEditFaculty(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Order Status</label>
                  <select
                    className="form-input"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="Received">Received</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <Btn type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit" variant="gold">
                  Save Changes
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
