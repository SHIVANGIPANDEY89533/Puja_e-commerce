import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    const order = await instance.orders.create({
      amount: 1000,
      currency: "INR",
      receipt: "receipt#1"
    });
    
    console.log("SUCCESS:", order.id);
  } catch (err) {
    console.error("RAZORPAY API ERROR:", err.statusCode, err.error);
  }
};
test();
