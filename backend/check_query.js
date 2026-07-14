const { pool } = require("./config/db");
const User = require("./models/User");

async function check() {
  try {
    const user = await User.findOne({ userId: 'FUO/22/CSI/18843', role: 'student' });
    console.log("User found:", user);
  } catch (err) {
    console.error("Query failed:", err);
  }
}
check();
