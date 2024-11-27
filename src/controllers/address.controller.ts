import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { IAddressInput, IAddressDocument } from "../@types/address.types";

// * Models
import Address from "../models/Address";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import AuthenticationError from "../errors/AuthenticationError";
import DatabaseError from "../errors/DatabaseError";
import { findAddressOrError } from "../utils/findOrError";

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
      municipality,
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
      !municipality ||
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
      municipality,
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

// @desc    Delete address
// @route   DELETE /api/address/:id
// @access  Private
const deleteAddress = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const address = await findAddressOrError(req.params.id);

    if (address.userId.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    try {
      await address.deleteOne();
      return res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

// @desc    Edit address
// @route   PUT /api/address/:id
// @access  Private
const editAddress = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const {
      firstName,
      lastName,
      region,
      province,
      municipality,
      address,
      postalCode,
      addressLabel,
      phoneNumber,
    } = req.body;

    const addressDoc: IAddressDocument = await findAddressOrError(
      req.params.id
    );

    if (addressDoc.userId.toString() !== req.sznUser?.userId) {
      throw new AuthenticationError();
    }

    // Update only the fields that are provided in the request body
    if (firstName !== undefined) addressDoc.firstName = firstName;
    if (lastName !== undefined) addressDoc.lastName = lastName;
    if (region !== undefined) addressDoc.region = region;
    if (province !== undefined) addressDoc.province = province;
    if (municipality !== undefined) addressDoc.municipality = municipality;
    if (address !== undefined) addressDoc.address = address;
    if (postalCode !== undefined) addressDoc.postalCode = postalCode;
    if (addressLabel !== undefined) addressDoc.addressLabel = addressLabel;
    if (phoneNumber !== undefined) addressDoc.phoneNumber = phoneNumber;

    try {
      await addressDoc.save();
      return res.status(200).json({
        message: "Address has been updated",
        updatedAddress: addressDoc,
      });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

export { createAddress, getMyAddresses, deleteAddress, editAddress };
