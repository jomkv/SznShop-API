import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { getWeekStartAndEnd } from "../utils/adminHelper";
import { IOrderDocument } from "../@types/order.types";
import { IHomeCarouselDocument, IImage } from "../@types/image.types";
import { deleteImages, uploadImages } from "../utils/cloudinaryHelper";

// * Models
import Order from "../models/Order";
import Product from "../models/Product";
import HomeCarousel from "../models/HomeCarousel";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc    Get Statistics for Dashboard
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const recentOrders = await Order.find({}, [], {
      sort: { createdAt: -1 },
    }).limit(5);

    const recentProducts = await Product.find({}, [], {
      sort: { createdAt: -1 },
    }).limit(5);

    const allOrders = await Order.find({});
    const orders = await Order.find({ status: "COMPLETED" });

    let totalRevenue = 0;
    let activeUserIds: any[] = [];

    allOrders.forEach((order) => {
      if (!activeUserIds.includes(order.userId)) {
        activeUserIds.push(order.userId);
      }
    });

    // Iterate through orders
    orders.forEach((order) => {
      // Iterate through order's products
      order.orderProducts.forEach((op) => {
        // Add to total
        totalRevenue += op.quantity * op.price;
      });
    });

    const { startOfWeek, endOfWeek } = getWeekStartAndEnd();

    // Get orders from this week
    const thisWeeksOrders: IOrderDocument[] = await Order.find({
      createdAt: {
        $gte: startOfWeek, // more than or equal
        $lt: endOfWeek, // less than
      },
      isPaid: true,
    });

    const dailyCount = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    };

    thisWeeksOrders.forEach((order) => {
      switch (order.createdAt.getDay()) {
        case 0: // sunday
          dailyCount.sunday += 1;
          break;
        case 1: // monday
          dailyCount.monday += 1;
          break;
        case 2: // tues
          dailyCount.tuesday += 1;
          break;
        case 3: // wed
          dailyCount.wednesday += 1;
          break;
        case 4: // thurs
          dailyCount.thursday += 1;
          break;
        case 5: // fri
          dailyCount.friday += 1;
          break;
        case 6: // saturday
          dailyCount.saturday += 1;
          break;
        default:
          break;
      }
    });

    const dailyOrderCountAvg = Math.round(
      (dailyCount.sunday +
        dailyCount.monday +
        dailyCount.tuesday +
        dailyCount.wednesday +
        dailyCount.thursday +
        dailyCount.friday +
        dailyCount.saturday) /
        7
    );

    res.status(200).json({
      recentOrders,
      recentProducts,
      dailyOrderCount: dailyCount,
      dailyOrderAverage: dailyOrderCountAvg,
      totalRevenue,
      activeUsers: activeUserIds.length,
    });
  }
);

// @desc    Get home carousel images
// @route   GET /api/admin/home-images
// @access  Public
const getHomeImages = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const homeCarousel = await HomeCarousel.findOne({});

    const homeImages = homeCarousel ? homeCarousel.images : [];

    res.status(200).json({
      message: "Home images fetched",
      homeImages,
    });
  }
);

// @desc    Set home carousel images
// @route   POST /api/admin/home-images
// @access  Admin
const setHomeImages = asyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files) {
      throw new BadRequestError("No images provided");
    }

    const homeCarousel: IHomeCarouselDocument | null =
      await HomeCarousel.findOne({});
    const newImages: IImage[] = await uploadImages(files);

    if (!homeCarousel) {
      const newHomeCarousel = new HomeCarousel({
        images: newImages,
      });

      await newHomeCarousel.save();
      return res.status(201).json({
        message: "New home carousel created",
        newHomeCarousel,
      });
    }

    const oldImages: IImage[] = homeCarousel.images;
    homeCarousel.images = newImages;

    try {
      await homeCarousel.save();
      await deleteImages(oldImages);

      res
        .status(200)
        .json({ message: "Home images successfully set", newImages });
    } catch (error) {
      throw new DatabaseError();
    }
  }
);

export { getDashboardStats, getHomeImages, setHomeImages };
