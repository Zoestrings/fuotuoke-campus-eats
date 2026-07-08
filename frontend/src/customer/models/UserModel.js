export class UserModel {
  static validateMatric(matric) {
    const formatted = matric.trim().toUpperCase();
    return /^FUO\/\d{2}\/[A-Z]{3,4}\/\d{5}$/.test(formatted);
  }

  static validateStaffId(staffId) {
    const formatted = staffId.trim().toUpperCase();
    return /^FUO-STAFF-\d{4}$/.test(formatted);
  }

  static validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  static validatePassword(password) {
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password) && /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*]/.test(password)
    ];
    return checks.every(Boolean);
  }
}
