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
import { ICartProductDocument } from "../@types/cart.types";
import CartProduct from "../models/CartProduct";
import { IOrderDocument, IOrderProductDocument } from "../@types/order.types";
import Order from "../models/Order";
import OrderProduct from "../models/OrderProduct";
import { IUserDocument } from "../@types/user.types";
import User from "../models/User";

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

export const findCartItemOrError = async (
  id: string
): Promise<ICartProductDocument> => {
  const cartProduct = await CartProduct.findById(id);

  if (!cartProduct) {
    throw new BadRequestError("Cart item not found");
  }

  return cartProduct;
};

export const findOrderOrError = async (id: string): Promise<IOrderDocument> => {
  const order = await Order.findById(id);

  if (!order) {
    throw new BadRequestError("Order not found");
  }

  return order;
};

export const findOrderProductOrError = async (
  id: string
): Promise<IOrderProductDocument> => {
  const op = await OrderProduct.findById(id);

  if (!op) {
    throw new BadRequestError("Order Product not found");
  }

  return op;
};

export const findUserOrError = async (id: string): Promise<IUserDocument> => {
  const user = await User.findById(id);

  if (!user) {
    throw new BadRequestError("User not found");
  }

  return user;
};
