export class MealModel {
  static create({ name, price, cat, desc, image, emoji, popular, extras }) {
    return {
      id: Date.now(),
      name: name.trim(),
      price: Number(price),
      cat,
      desc: desc.trim() || "Freshly prepared campus special.",
      image: image ? image.trim() : "",
      emoji: emoji || "",
      popular: !!popular,
      extras: extras || [
        { name: "Extra Portion", price: Math.round(Number(price) * 0.4) },
        { name: "Soft Drink", price: 400 }
      ]
    };
  }

  static validate(meal) {
    if (!meal.name || !meal.name.trim()) return { valid: false, error: "Dish name is required." };
    if (!meal.price || Number(meal.price) <= 0) return { valid: false, error: "Price must be a valid number greater than 0." };
    return { valid: true };
  }
}
