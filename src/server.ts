// * External Imports
import express from "express";
import dotenv from "dotenv";
dotenv.config();

// * Local Imports
import connectDB from "./config/db";

const app = express();
const port = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log("Server is running on port 3000");
  });
});
