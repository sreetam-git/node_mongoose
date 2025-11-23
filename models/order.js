const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subTotal: { type: Number, required: true }
});

const shippingSchema = new mongoose.Schema({
  addressId: { type: mongoose.Types.ObjectId, ref: "Address", required: false },
  cost: { type: Number, default: 0 }
});

const paymentSchema = new mongoose.Schema({
  method: { type: String, enum: ["razorpay", "stripe", "cod"], default: "cod" },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  transactionId: { type: String, default: null }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },

    items: {
      type: [orderItemSchema],
      validate: v => Array.isArray(v) && v.length > 0
    },

    subTotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    shipping: { type: shippingSchema, default: {} },

    total: { type: Number, required: true },

    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "cancelled"],
      default: "pending"
    },

    payment: { type: paymentSchema, default: {} },

    metadata: {
      idempotencyKey: { type: String, default: null }
    }
  },
  {
    timestamps: true // Replaces your createdAt & updatedAt fields automatically
  }
);

module.exports = mongoose.model("Order", orderSchema);
