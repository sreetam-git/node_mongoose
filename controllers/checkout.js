const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');
const product = require('../models/product');

exports.postCheckout = async (req, res, next) => {
    const userId = req.session.user._id;
    const paymentMethod = 'razorpay'; // e.g., 'razorpay', 'cod', etc.
    // const shippingAddressId = req.body.addressId;
    const idempotencyKey = req.headers['idempotency-key'] || null;

    try {
        //get cart
        const cart = await Cart.getCart(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // 2. Load latest product data and compute totals (price verification)
        const productIds = cart.items.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds }});
        
         // build items array for order and check stock
         let subTotal = 0;
         const orderItems = [];
         const insufficient = [];

         for(const cartItem of cart.items){
            const prod = await Product.findById(cartItem.productId);
            if(!prod){
                insufficient.push(
                    { productId: cartItem.productId, reason: 'product not found.'}
                );
            }

            const price = prod.price;
            const subTotalItem = price * cartItem.quantity;
            subTotal += subTotalItem;

            orderItems.push({
                productId: prod._id,
                name: prod.title, price,
                quantity: cartItem.quantity,
                subTotal: subTotalItem
            });
         }

        if (insufficient.length > 0) {
            return res.status(400).json({ error: "Some items unavailable", details: insufficient });
        }

         // 3. Calculate tax, shipping, discounts (simplified)
        const tax = Math.round(subTotal * 0.05); // example 5%
        const shippingCost = 50; // or dynamic
        const discount = 0; // apply coupon logic here
        const total = subTotal + tax + shippingCost - discount;

        // 4. Start transaction to create order and decrement stock atomically
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const userId = req.session.user._id;
            // const { paymentMethod, shippingCost, subTotal, tax, discount, total, orderItems, idempotencyKey } = req.body;

            // -- Create order object --
            const orderDoc = {
                userId,
                items: orderItems,
                subTotal,
                tax,
                discount,
                shipping: { addressId: null, cost: shippingCost },
                total,
                currency: "INR",
                status: "pending",
                payment: { method: paymentMethod, status: "pending" },
                metadata: { idempotencyKey }
            };
            console.log(orderDoc);
            // Insert order with session
            const newOrder = new Order(orderDoc);
            await newOrder.save();

            // Optional: Clear user's cart after creating the order
            await Cart.findOneAndDelete({ userId: userId });

            // Commit transaction
            await session.commitTransaction();
            session.endSession();
                
        res.redirect('/cart');
        } finally {
            await session.endSession();
        }
        
        // 5. Charge payment (outside transaction; handle as two-phase: order created + payment)
    // NOTE: if payment fails, you should either restore stock or mark order failed and run compensation.
    // let paymentResult;
    // try {
    //   paymentResult = await paymentGateway.charge({
    //     amount: total,
    //     currency: 'INR',
    //     method: paymentMethod,
    //     metadata: { orderId: orderId.toString(), userId }
    //   });

    //   // Update order to paid
    //   await Order.updateStatus(orderId.toString(), {
    //     status: 'paid',
    //     'payment.status': 'success',
    //     'payment.gatewayResponse': paymentResult,
    //     updatedAt: Date.now()
    //   });

    //   // Clear user cart
    //   await db.collection('carts').deleteOne({ userId: userId });

    //   // Return success
    //   return res.status(200).json({ orderId, message: "Payment successful, order placed." });
    // } catch (payErr) {
    //   // Payment failed: mark order failed and restore stock (compensating action)
    //   console.error('Payment error:', payErr);

    //   // Mark order payment failed
    //   await Order.updateStatus(orderId.toString(), {
    //     status: 'failed',
    //     'payment.status': 'failed',
    //     'payment.gatewayResponse': payErr,
    //     updatedAt: Date.now()
    //   });

    //   // Restore stock (compensating update)
    //   const session2 = client.startSession();
    //   try {
    //     await session2.withTransaction(async () => {
    //       for (const item of orderItems) {
    //         await db.collection('products').updateOne(
    //           { _id: item.productId },
    //           { $inc: { stock: item.quantity } },
    //           { session: session2 }
    //         );
    //       }
    //     });
    //   } finally {
    //     await session2.endSession();
    //   }

    //   return res.status(402).json({ error: "Payment failed", details: payErr.message || payErr });
    // }

    } catch (err) {
        console.error('Checkout error:', err);
        return res.status(500).json({ error: "Checkout failed", details: err.message });
    }
}