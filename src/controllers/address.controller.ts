import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { IAddressInput, IAddressDocument } from "../@types/address.types";

// * Models
import Address from "../models/Address";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";

// @desc    Create a new address
// @route   POST /api/address
// @access  Private
const createAddress = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const {
      firstName,
      lastName,
      region,
      province,
      city,
      address,
      postalCode,
      addressLabel,
      phoneNumber,
    }: IAddressInput = req.body;

    if (
      !firstName ||
      !lastName ||
      !region ||
      !province ||
      !city ||
      !address ||
      !postalCode ||
      !addressLabel ||
      !phoneNumber
    ) {
      throw new BadRequestError("Incomplete Input");
    }

    const newAddress: IAddressDocument = new Address({
      userId: req.sznUser?.userId,
      firstName,
      lastName,
      region,
      province,
      city,
      address,
      postalCode,
      addressLabel,
      phoneNumber,
    });

    try {
      await newAddress.save();
      return res
        .status(201)
        .json({ message: "New address has been created", newAddress });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Get my addresses
// @route   GET /api/address
// @access  Private
const getMyAddresses = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const addresses = await Address.find({ userId: req.sznUser?.userId });

    return res
      .status(200)
      .json({ message: "Addresses fetched successfully", addresses });
  }
);

export { createAddress, getMyAddresses };
