const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        price: Number,
        imageUrl: String,
        quantity: { type: Number, default: 1 }
      }
    ],

    total: { type: Number, default: 0 }
  },
  { timestamps: true }
);

cartSchema.statics.addItem = async function (userId, product) {
  const cart = await this.findOne({ userId });

  const productData = {
    productId: product._id,
    title: product.title,
    price: product.price,
    quantity: 1,
    imageUrl: product.imageUrl
  };

  if (!cart) {
    return await this.create({
      userId,
      items: [productData],
      total: product.price
    });
  }

  const existingItem = cart.items.find(
    item => item.productId.toString() === product._id.toString()
  );

  if (existingItem) {
    existingItem.quantity += 1;
    cart.total += product.price;
  } else {
    cart.items.push(productData);
    cart.total += product.price;
  }

  return await cart.save();
};


cartSchema.statics.removeItem = async function (userId, productId) {
  const cart = await this.findOne({ userId });

  if (!cart) return { message: "Cart not found" };

  const item = cart.items.find(i => i.productId.toString() === productId.toString());
  if (!item) return { message: "Item not found in cart" };

  cart.total -= item.price * item.quantity;

  cart.items = cart.items.filter(i => i.productId.toString() !== productId.toString());

  await cart.save();
  return { message: "Item removed" };
};


cartSchema.statics.clearCart = async function (userId) {
  await this.deleteOne({ userId });
  return { message: "Cart cleared" };
};

cartSchema.statics.updateQuantity = async function (userId, productId, newQty) {
  const cart = await this.findOne({ userId });

  if (!cart) return { message: "Cart not found" };

  const item = cart.items.find(i => i.productId.toString() === productId);

  if (!item) return { message: "Item not found" };

  const priceDiff = (newQty - item.quantity) * item.price;

  item.quantity = newQty;
  cart.total += priceDiff;

  await cart.save();
  return { message: "Quantity updated" };
};


cartSchema.statics.getCart = function (userId) {
  return this.findOne({ userId }).populate("items.productId");
};


module.exports = mongoose.model("Cart", cartSchema);
