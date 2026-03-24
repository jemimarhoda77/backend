import express from "express";
import cors from "cors";
import parser from "body-parser";
import dotenv from "dotenv";
import "./db/connectDB.js";
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("Current Dir →", __dirname);
//dotenv.config({ path: "./.env" });
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Loaded DATABASE →", process.env.DATABASE);

const app = express();
const PORT = process.env.PORT || 5000;

// import routes
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/category.js";
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";

// middlewares
app.use(cors());
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.use("/category", express.static(__dirname + "/upload/category"));
app.use("/profile", express.static(__dirname + "/upload/profiles"));
app.use("/products", express.static(__dirname + "/upload/products"));

// adding routes
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
