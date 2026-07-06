import React from "react";
import { Btn } from "../../../shared/ui";

export default function MealsManagement({ menuItems = [], onDelete, onLoadDemo, onSubmitForm, formStates }) {
  const {
    newItemName, setNewItemName,
    newItemPrice, setNewItemPrice,
    newItemCat, setNewItemCat,
    newItemDesc, setNewItemDesc,
    newItemImg, setNewItemImg,
    newItemEmoji, setNewItemEmoji,
    newItemPopular, setNewItemPopular
  } = formStates;

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Image is too large! Please select an image smaller than 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImg(reader.result); // Base64 data string
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="vendor-menu-layout animate-fade-in">
      {/* Form Container */}
      <form onSubmit={onSubmitForm} className="vendor-form-container">
        <h3 className="vendor-form-title">
          <i className="bi bi-plus-circle-fill" style={{ color: "var(--gold)" }} />
          Add Menu Dish
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Dish Name <span style={{ color: "var(--red)" }}>*</span></label>
          <input
            type="text"
            placeholder="e.g. Jollof Rice &amp; Grilled Turkey"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label className="form-label">Price (₦) <span style={{ color: "var(--red)" }}>*</span></label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={newItemPrice}
              onChange={e => setNewItemPrice(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              value={newItemCat}
              onChange={e => setNewItemCat(e.target.value)}
              className="form-input"
            >
              <option value="Rice">Rice</option>
              <option value="Soup">Soup</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label className="form-label">Fallback Emoji</label>
            <input
              type="text"
              placeholder="e.g. 🍛"
              value={newItemEmoji}
              onChange={e => setNewItemEmoji(e.target.value)}
              className="form-input"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
            <input
              type="checkbox"
              id="popularCheck"
              checked={newItemPopular}
              onChange={e => setNewItemPopular(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor="popularCheck" className="form-label" style={{ margin: 0, cursor: "pointer" }}>Popular Item</label>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Upload Dish Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="form-input"
            style={{ padding: "6px" }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Or Image URL</label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={newItemImg}
            onChange={e => setNewItemImg(e.target.value)}
            className="form-input"
          />
        </div>

        {newItemImg && (
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Selected Image Preview</label>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)", height: 120 }}>
              <img src={newItemImg} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                type="button"
                onClick={() => setNewItemImg("")}
                style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Remove Image"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label className="form-label">Description</label>
          <textarea
            placeholder="Describe this dish briefly..."
            value={newItemDesc}
            onChange={e => setNewItemDesc(e.target.value)}
            className="form-input"
            rows={3}
            style={{ resize: "none" }}
          />
        </div>

        <Btn full variant="gold" type="submit">
          <i className="bi bi-plus-lg" /> Add to Canteen Menu
        </Btn>
      </form>

      {/* List Container */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-dark)" }}>
            Current Campus Dishes ({menuItems.length})
          </h3>
          <p style={{ color: "var(--text-light)", fontSize: ".78rem" }}>Delete or inspect items currently listed on the student/staff menu.</p>
        </div>

        <div className="vendor-items-list">
          {menuItems.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px", gridColumn: "1 / -1", textAlign: "center" }}>
              <i className="bi bi-egg-fried empty-state-icon" style={{ fontSize: "2.5rem", color: "var(--text-light)", display: "block", marginBottom: 8 }} />
              <p className="empty-state-text" style={{ margin: "0 0 16px" }}>Your campus menu is currently empty.</p>
              <Btn sm variant="gold" onClick={onLoadDemo}>
                <i className="bi bi-cloud-arrow-down-fill" style={{ marginRight: 6 }} /> Load Default Campus Meals
              </Btn>
            </div>
          ) : (
            menuItems.map(item => (
              <div key={item.id} className="vendor-item-card staff animate-fade-up">
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="vendor-item-delete-btn"
                  title="Remove Dish"
                >
                  <i className="bi bi-trash3-fill" />
                </button>
                {item.image ? (
                  <img src={item.image} alt={item.name} className="item-img-card" style={{ height: 100 }} />
                ) : (
                  <div className="item-emoji-card">{item.emoji}</div>
                )}
                <div style={{ fontWeight: 700, fontSize: ".85rem", color: "var(--text-dark)", marginBottom: 4, paddingRight: 24 }}>{item.name}</div>
                <div style={{ fontSize: ".72rem", color: "var(--text-light)", marginBottom: 8 }}>{item.desc}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  <span className="badge badge-blue" style={{ fontSize: ".65rem", padding: "3px 6px" }}>{item.cat}</span>
                  <span style={{ fontWeight: 800, fontSize: ".85rem", color: "var(--gold)" }}>
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
