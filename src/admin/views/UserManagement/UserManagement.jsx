import React, { useState } from "react";
import { Badge, Btn } from "../../../shared/ui";
import { UserModel } from "../../models/UserModel";

export default function UserManagement({ users = [], onToggleStatus, onDelete, onSave, onAdd }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("student");
  const [userPassword, setUserPassword] = useState("");
  const [userStatus, setUserStatus] = useState("active");

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const openCreateModal = () => {
    setModalMode("create");
    setUserId("");
    setUserName("");
    setUserEmail("");
    setUserRole("student");
    setUserPassword("");
    setUserStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setUserId(user.id);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserPassword(user.password || "");
    setUserStatus(user.status || "active");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !userName.trim() || !userEmail.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    const userData = {
      id: userId.trim(),
      name: userName.trim(),
      email: userEmail.trim(),
      role: userRole,
      password: userPassword.trim() || "Password123!",
      status: userStatus
    };

    try {
      if (modalMode === "create") {
        await onAdd(userData);
        alert("✅ User account created successfully!");
      } else {
        await onSave(userId, userData);
        alert("✅ User details updated successfully!");
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="animate-fade-in vendor-panel-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: 4 }}>
            User Access Management
          </h3>
          <p style={{ color: "var(--text-light)", fontSize: ".88rem", margin: 0 }}>
            Create, edit, block, delete or monitor active student, staff and kitchen provider access.
          </p>
        </div>
        <Btn variant="gold" onClick={openCreateModal}>
          <i className="bi bi-person-plus-fill" /> Add New User
        </Btn>
      </div>

      {/* Filter Row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          className="form-input"
          placeholder="Search user by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="form-input"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="staff">School Staff</option>
          <option value="kitchen">Kitchen Providers</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
              {["User ID / Identifier", "Name", "Email Address", "Role", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 10px", fontSize: ".76rem", fontWeight: 850, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg-main)" }}>
                <td style={{ padding: "14px 10px", fontWeight: 700, fontSize: ".86rem" }}>{u.id}</td>
                <td style={{ padding: "14px 10px", fontSize: ".86rem" }}>{u.name}</td>
                <td style={{ padding: "14px 10px", fontSize: ".82rem", color: "var(--text-light)" }}>{u.email}</td>
                <td style={{ padding: "14px 10px" }}>
                  <Badge color={UserModel.getRoleBadgeColor(u.role)}>
                    {UserModel.getDisplayRole(u.role)}
                  </Badge>
                </td>
                <td style={{ padding: "14px 10px" }}>
                  <Badge color={u.status === "active" ? "green" : "gold"}>
                    {u.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                </td>
                <td style={{ padding: "14px 10px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Btn sm variant="outline" onClick={() => openEditModal(u)}>
                    <i className="bi bi-pencil" /> Edit
                  </Btn>
                  {u.role !== "admin" && (
                    <>
                      <Btn sm variant={u.status === "active" ? "gold" : "outline"} onClick={() => onToggleStatus(u.id, u.status, u.name)}>
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </Btn>
                      <Btn sm variant="danger" onClick={() => onDelete(u.id, u.name)}>
                        Delete
                      </Btn>
                    </>
                  )}
                  {u.role === "admin" && <span style={{ color: "var(--text-muted)", fontSize: ".8rem", alignSelf: "center" }}>Permanent</span>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No accounts found matching filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create User Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content animate-scale-in" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3 className="modal-title">{modalMode === "create" ? "Register New Account" : "Edit Account Details"}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <i className="bi bi-x" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="form-label">User ID / Username <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    placeholder="e.g. FUO/22/CSI/18843 or Zoehackz001"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    disabled={modalMode === "edit"}
                    required
                  />
                  <small style={{ color: "var(--text-muted)", fontSize: ".72rem" }}>Cannot be changed after registration.</small>
                </div>

                <div>
                  <label className="form-label">Full Name <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    placeholder="e.g. Precious Daniel"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email Address <span style={{ color: "var(--red)" }}>*</span></label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="e.g. precious@fuotuoke.edu.ng"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Account Role <span style={{ color: "var(--red)" }}>*</span></label>
                  <select
                    className="form-input"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="staff">School Staff</option>
                    <option value="kitchen">Kitchen Hub Provider</option>
                    <option value="admin">Platform Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Account Password</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder={modalMode === "create" ? "Leave blank for default 'Password123!'" : "Enter new password to modify"}
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Access Status</label>
                  <select
                    className="form-input"
                    value={userStatus}
                    onChange={e => setUserStatus(e.target.value)}
                  >
                    <option value="active">Active (Access Granted)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit" variant="gold">
                  {modalMode === "create" ? "Create Account" : "Save Changes"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
