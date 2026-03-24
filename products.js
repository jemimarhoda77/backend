import { connect, disconnect } from "mongoose";
import dotenv from "dotenv";

import Category from "./models/category.js";
import Products from "./models/products.js";
import data from "./data.json" with { type: "json" };
dotenv.config({ path: "./.env" });
async function restoreProducts() {
  await connect(process.env.DATABASE, {});

  await Category.deleteMany({});
  await Products.deleteMany({});

  for (let category of data) {
    const { _id: categoryId } = await new Category({
      name: category.name,
      image: category.image,
    }).save();
    const products = category.products.map((product) => ({
      ...product,
      category: categoryId,
    }));
    await Products.insertMany(products);
  }

  disconnect();

  console.info("Database Filled/Restored Successfully!!");
}

restoreProducts();
