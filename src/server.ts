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
import cartRoutes from "./routes/cart.route";
import addressRoutes from "./routes/address.route";
import orderRoutes from "./routes/order.route";
import ratingRoutes from "./routes/rating.route";
import userRoutes from "./routes/user.route";
import adminRoutes from "./routes/admin.route";
import searchRoutes from "./routes/search.route";
import "./utils/cron";

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
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

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
