import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// connect to db
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log("DB Connected..."))
  .catch((err) => console.log(`DB Connection Error : ${err}`));
