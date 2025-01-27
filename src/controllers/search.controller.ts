import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { allowedSizes, IStocksDocument, Size } from "../@types/product.types";

// * Models
import Product from "../models/Product";
import CategoryProduct from "../models/CategoryProduct";
import Category from "../models/Category";
import Rating from "../models/Rating";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc    Search for products
// @route   GET /api/search?search=prodName&category=catName&size=size&ratings=stars&price=priceRange&outOfStock=boolean
// @access  Public
const searchProducts = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { search, category, size, ratings, price, inStock } = req.query;

    console.log(req.query);

    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" }; // case insensitive search
    }

    if (price) {
      const [minPrice, maxPrice] = (price as string).split("-");
      const min = Number(minPrice);
      const max = Number(maxPrice);

      if (!isNaN(min) && !isNaN(max)) {
        query.price = { $gte: min, $lte: max };
      }
    }

    let products = await Product.find(query);

    // If inStock is provided and is set to true
    if (inStock !== undefined && inStock === "true") {
      products = products.filter((product) => !isOutOfStock(product.stocks));
    }

    if (size) {
      let lowerSize = (size as string).toLowerCase() as Size;

      // If size valid
      if (allowedSizes.includes(lowerSize)) {
        products = products.filter((product) => product.stocks[lowerSize] > 0);
      }
    }

    if (category) {
      const categoryDoc = await Category.findOne({ name: category });

      if (categoryDoc) {
        const categoryProducts = await CategoryProduct.find({
          categoryId: categoryDoc._id,
        });

        products = products.filter((product) =>
          categoryProducts.find(
            (cp) => cp.productId.toString() === product.id.toString()
          )
        );
      }
    }

    // Filter products based on the ratings
    if (ratings) {
      const ratingValue = Number(ratings);
      if (!isNaN(ratingValue)) {
        const productIdsWithAverageRatings = await Rating.aggregate([
          {
            $group: {
              _id: "$productId",
              averageRating: { $avg: "$stars" },
            },
          },
          {
            $match: {
              averageRating: { $gte: ratingValue },
            },
          },
        ]).exec();

        const productIds = productIdsWithAverageRatings.map((r) =>
          r._id.toString()
        );

        products = products.filter((product) =>
          productIds.includes(product._id.toString())
        );
      }
    }

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  }
);

// @desc    Get categories for filters
// @route   GET /api/search/categories
// @access  Public
const getCategories = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const categories = await Category.find({
      showInMenu: true,
    }).select("name");

    res.status(200).json({
      message: "Categories fetched",
      categories,
    });
  }
);

const isOutOfStock = (stocks: IStocksDocument): boolean => {
  const res =
    stocks.xs <= 0 &&
    stocks.sm <= 0 &&
    stocks.md <= 0 &&
    stocks.lg <= 0 &&
    stocks.xl <= 0 &&
    stocks.xxl <= 0;

  return res;
};

export { searchProducts, getCategories };
