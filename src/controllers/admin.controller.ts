import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { getWeekStartAndEnd } from "../utils/adminHelper";
import { IOrderDocument } from "../@types/order.types";

// * Models
import Order from "../models/Order";
import Product from "../models/Product";

// * Custom Errors
import BadRequestError from "../errors/BadRequestError";
import DatabaseError from "../errors/DatabaseError";

// @desc    Get Statistics for Dashboard
// @route   POST /api/admin/dashboard
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

export { getDashboardStats };
