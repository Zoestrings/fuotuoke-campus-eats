export class UserModel {
  static ROLES = ["student", "staff", "kitchen", "admin"];

  static getDisplayRole(role) {
    const map = {
      student: "Student",
      staff: "School Staff",
      kitchen: "Kitchen Staff",
      admin: "Administrator"
    };
    return map[role] || role;
  }

  static getRoleBadgeColor(role) {
    return { student: "blue", staff: "gold", kitchen: "gold", admin: "green" }[role] || "blue";
  }
}
