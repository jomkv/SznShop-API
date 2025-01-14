import cron from "node-cron";
import Order from "../models/Order";

const autoCompleteOrders = async (): Promise<any> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    await Order.updateMany(
      {
        status: "RECEIVED",
        createdAt: { $lte: sevenDaysAgo },
      },
      {
        status: "RETURN",
        timestamps: {
          returnedAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.log("Error running job: ", error);
  }
};

cron.schedule("0 * * * *", autoCompleteOrders);
