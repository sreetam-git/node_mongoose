const { ObjectId } = require('mongodb');
const { getDB, getClient } = require('../util/database');

const Cart = require('../models/cart');
const Product = require('../models/product');
const Order = require('../models/order');

exports.postCheckout = async (req, res, next) => {
    const userId = req.user._id;
    const paymentMethod = 'razorpay'; // e.g., 'razorpay', 'cod', etc.
    // const shippingAddressId = req.body.addressId;
    const idempotencyKey = req.headers['idempotency-key'] || null;

    try {
        const db = getDB();
        //get cart
        const cart = await Cart.getCart(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // 2. Load latest product data and compute totals (price verification)
        const productIds = cart.items.map(i => ObjectId.createFromHexString(i.productId.toString()));
        const productsCursor = await db.collection('products').find({ _id: { $in: productIds }});
        const products = await productsCursor.toArray();

         // build items array for order and check stock
         let subTotal = 0;
         const orderItems = [];
         const insufficient = [];

         for(const cartItem of cart.items){
            const prod = products.find(i => i._id.toString() === cartItem.productId.toString());
            if(!prod){
                insufficient.push(
                    { productId: cartItem.productId, reason: 'product not found.'}
                );
            }

            // if (prod.stock < cartItem.quantity) {
            //     insufficient.push({ productId: cartItem.productId, reason: 'Out of stock' });
            //     continue;
            // }

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

        // Optional: check and enforce idempotency (search orders by idempotencyKey & userId)
        // if (idempotencyKey) {
        // const existing = await db.collection('orders').findOne({ userId: ObjectId.createFromHexString(userId), 'metadata.idempotencyKey': idempotencyKey });
        // if (existing) return res.status(200).json({ orderId: existing._id, message: 'Idempotent: returning existing order' });
        // }

        // 4. Start transaction to create order and decrement stock atomically
        const client = getClient(); // returns MongoClient (connected)
        const session = client.startSession();

        let orderId;
        try {
            await session.withTransaction(async () => {
                //create orderdoc with status pending and payment pending
                const orderDoc = {
                    userId: userId,
                    items: orderItems,
                    subTotal,
                    tax,
                    discount,
                    shipping: { addressId: 0, cost: shippingCost },
                    total,
                    currency: "INR",
                    status: "pending",
                    payment: { method: paymentMethod, status: "pending" },
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    metadata: { idempotencyKey }
                };

                orderId = await Order.create(orderDoc, { session });
                

                // for (const item of orderItems) {
                //     const upd = await db.collection('products').updateOne(
                //         { _id: item.productId, stock: { $gte: item.quantity } },
                //         { $inc: { stock: -item.quantity } },
                //         { session }
                //     );
                //     if (upd.matchedCount === 0) {
                //         // Will throw to abort transaction
                //         throw new Error(`Insufficient stock for product ${item.productId}`);
                //     }
                // }
            },
             {
                readConcern: { level: 'local' },
                writeConcern: { w: 'majority' },
                readPreference: 'primary'
            }
        
        );

        // Clear user cart
        await Cart.clearCart(userId);

        // return res.status(200).json({ orderId, message: "Payment successful, order placed." });
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