import React, { useState } from "react";
import { Badge, Btn } from "../../../shared/ui";

export default function PaymentManagement({ payments = [], onUpdate, onDelete }) {
  const [search, setSearch] = useState("");

  // Modal states for editing transaction details
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTxId, setEditTxId] = useState(null);
  const [editCustomer, setEditCustomer] = useState("");
  const [editMethod, setEditMethod] = useState("Credit Card");
  const [editAmount, setEditAmount] = useState("");
  const [editStatus, setEditStatus] = useState("Successful");
  const [editTime, setEditTime] = useState("");

  const filtered = payments.filter(p => {
    return (
      String(p.id).toLowerCase().includes(search.toLowerCase()) ||
      String(p.customer).toLowerCase().includes(search.toLowerCase()) ||
      String(p.orderId).toLowerCase().includes(search.toLowerCase())
    );
  });

  const openEditModal = (p) => {
    setEditTxId(p.id);
    setEditCustomer(p.customer || "");
    setEditMethod(p.method || "Credit Card");
    setEditAmount(p.amount || "");
    setEditStatus(p.status || "Successful");
    setEditTime(p.time || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editCustomer.trim() || !editAmount) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedFields = {
      customer: editCustomer.trim(),
      method: editMethod,
      amount: Number(editAmount),
      status: editStatus,
      time: editTime || new Date().toLocaleTimeString()
    };

    onUpdate(editTxId, updatedFields);
    setIsEditOpen(false);
    alert("✅ Transaction details updated successfully!");
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Successful": return "green";
      case "Failed": return "red";
      case "Refunded": return "blue";
      default: return "gold";
    }
  };

  return (
    <div className="animate-fade-in vendor-panel-card">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 6 }}>
        Financial Transactions Registry
      </h3>
      <p style={{ color: "var(--text-light)", fontSize: ".88rem", marginBottom: 20 }}>
        Verify order payments, update transaction statuses, edit details, or delete financial logs.
      </p>

      {/* Filter Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="Search by Tx ID, Order ID, or Customer Name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
              {["Tx ID", "Order ID", "Customer", "Payment Method", "Amount", "Status", "Time", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 10px", fontSize: ".76rem", fontWeight: 855, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => {
              const currentStatus = p.status || "Successful";
              return (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)", background: idx % 2 === 0 ? "transparent" : "var(--bg-main)" }}>
                  <td style={{ padding: "14px 10px", fontWeight: 700, fontSize: ".84rem" }}>{p.id}</td>
                  <td style={{ padding: "14px 10px", fontSize: ".82rem" }}>#{String(p.orderId).slice(-5)}</td>
                  <td style={{ padding: "14px 10px", fontSize: ".86rem" }}>{p.customer}</td>
                  <td style={{ padding: "14px 10px", fontSize: ".82rem", color: "var(--text-light)" }}>{p.method}</td>
                  <td style={{ padding: "14px 10px", fontWeight: 800, color: "var(--green-text)", fontSize: ".88rem" }}>
                    ₦{p.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 10px" }}>
                    <Badge color={getStatusBadgeColor(currentStatus)}>{currentStatus}</Badge>
                  </td>
                  <td style={{ padding: "14px 10px", fontSize: ".82rem", color: "var(--text-muted)" }}>{p.time}</td>
                  <td style={{ padding: "14px 10px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Btn sm variant="outline" onClick={() => openEditModal(p)}>
                        <i className="bi bi-pencil" /> Edit
                      </Btn>
                      
                      {currentStatus !== "Successful" && (
                        <Btn sm variant="primary" onClick={() => onUpdate(p.id, { status: "Successful" })}>
                          Accept
                        </Btn>
                      )}

                      {currentStatus !== "Failed" && currentStatus !== "Refunded" && (
                        <Btn sm variant="gold" onClick={() => onUpdate(p.id, { status: "Failed" })}>
                          Cancel
                        </Btn>
                      )}

                      <Btn sm variant="danger" onClick={() => onDelete(p.id)}>
                        Delete
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No transaction records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Payment Modal */}
      {isEditOpen && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-in" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Transaction Details</h3>
              <button className="modal-close-btn" onClick={() => setIsEditOpen(false)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="form-label">Transaction ID</label>
                  <input
                    className="form-input"
                    value={editTxId}
                    disabled
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: ".72rem" }}>Transaction identifier cannot be changed.</small>
                </div>

                <div>
                  <label className="form-label">Customer Name <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    value={editCustomer}
                    onChange={e => setEditCustomer(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-input"
                    value={editMethod}
                    onChange={e => setEditMethod(e.target.value)}
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Amount (₦) <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Transaction Time</label>
                  <input
                    className="form-input"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Transaction Status</label>
                  <select
                    className="form-input"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                  >
                    <option value="Successful">Successful</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
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
