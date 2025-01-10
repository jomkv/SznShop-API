import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

// * Models\
import User from "../models/User";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";
import AuthenticationError from "../errors/AuthenticationError";

// @desc    Get users
// @route   GET /api/user?query=role
// @access  Admin
const getUsers = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { role } = req.query;

    const users = await (role ? User.find({ role }) : User.find());

    res.status(200).json({ message: "Users fetched", users });
  }
);

// @desc    Ban user
// @route   POST /api/user/:id
// @access  Admin
const banUser = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new BadRequestError("User not found");
    }

    user.isBanned = true;

    try {
      await user.save();

      res.status(200).json({ message: "User banned", user });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

export { getUsers, banUser };
