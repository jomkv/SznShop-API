// * External Imports
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import asyncHandler from "express-async-handler";
import passport from "passport";
import cors from "cors";

// * Local Imports
import connectDB from "./config/db";
import googleStrategy from "./config/googleStrategy";
import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import categoryRoutes from "./routes/category.route";

// * Configs
dotenv.config();

// * App
const app = express();
const port = process.env.PORT || 3000;

// * Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: false })); // allow destructuring of req.body
app.use(express.json());
app.use(cookieParser());

// * Passport
googleStrategy(passport);
app.use(passport.initialize());

// * Routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);

app.all(
  "*",
  asyncHandler(() => {
    throw new Error("This endpoint does not exist");
  })
);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
