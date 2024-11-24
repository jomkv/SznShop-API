import { IAddressDocument } from "../@types/address.types";
import {
  ICategoryDocument,
  IProductDocument,
  IStocksDocument,
} from "../@types/product.types";
import BadRequestError from "../errors/BadRequestError";
import Category from "../models/Category";
import Product from "../models/Product";
import Stocks from "../models/Stocks";
import Address from "../models/Address";

export const findCategoryOrError = async (
  categoryId: string
): Promise<ICategoryDocument> => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  return category;
};

export const findProductOrError = async (
  id: string
): Promise<IProductDocument> => {
  const product = await Product.findById(id);

  if (!product) {
    throw new BadRequestError("Product not found");
  }

  return product;
};

export const findStocksOrError = async (
  productId: string
): Promise<IStocksDocument> => {
  const stocks = await Stocks.findOne({ productId: productId });

  if (!stocks) {
    throw new BadRequestError("Stocks not found");
  }

  return stocks;
};

export const findAddressOrError = async (
  id: string
): Promise<IAddressDocument> => {
  const address = await Address.findById(id);

  if (!address) {
    throw new BadRequestError("Address not found");
  }

  return address;
};
