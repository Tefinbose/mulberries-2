require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const User = require("../models/User");
const { categories, products, adminUser } = require("./data");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas connection error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    console.log("Clearing existing sample data...");
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany({ role: "admin" });

    console.log("Seeding Admin User...");
    const admin = new User({
      name: adminUser.name || "Mulberries Admin",
      email: adminUser.email || "digitalfirstreach@gmail.com",
      password: adminUser.password || "mulberries@123",
      role: "admin",
      permissions: [
        "orders",
        "products",
        "categories",
        "inventory",
        "customers",
        "reports",
        "shipping",
        "staff",
      ],
    });
    await admin.save();
    console.log(`Admin User created: ${admin.email}`);

    console.log("Seeding Categories...");
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories.`);

    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log("Seeding Products...");
    const sampleProducts = products.map((prod) => {
      const { categorySlug, ...rest } = prod;
      return {
        ...rest,
        category: categoryMap[categorySlug] || createdCategories[0]._id,
        isFeatured: true,
      };
    });

    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products.`);

    console.log("Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`Error during data seeding: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    console.log("Destroying all data...");
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany({ role: "admin" });

    console.log("Data destroyed successfully.");
    process.exit(0);
  } catch (error) {
    console.error(`Error during data destruction: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "destroy") {
  destroyData();
} else {
  importData();
}