const stripe = require('stripe')(process.env.STRIPE_SECRET);
const usersCollection = require('../models/user-schema');
const jsonwebtokens = require('jsonwebtoken');
const router = require('express').Router();

const SMTP = require('../utils/smtp');

router.post('/', async (req, res) => {
    try {
        const { tokenAuth } = req.body;
        const decoded = jsonwebtokens.verify(tokenAuth, process.env.JWT_A);
        const userInfo = await usersCollection.findOne({ email: decoded.email });

        if (userInfo) {
            res.status(200).json({ wallet: userInfo.amount });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error during user retrieval:', error);
        res.status(500).json({ message: 'An error occurred during user retrieval' });
    }
});

router.post('/payment', async (req, res) => {
    try {
        const { amount, tokenAuth } = req.body;
        const decoded = jsonwebtokens.verify(tokenAuth, process.env.JWT_A);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Sample Product',
                        },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            customer_email: decoded.email,
            mode: 'payment',
            success_url: 'http://localhost:3000/wallet',
            cancel_url: 'http://localhost:3000/wallet',
        });
        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'An error occurred during payment' });
    }
});

router.post('/webhook', async (req, res) => {
    const payload = JSON.stringify(req.body, null, 2);
    const secret = process.env.STRIPE_TESTS;
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });

    try {
        const event = stripe.webhooks.constructEvent(payload, header, secret);
        if (event.type === 'checkout.session.completed') {
            const { customer_email, amount_total } = event.data.object;
            await usersCollection.findOneAndUpdate(
                { email: customer_email },
                { $inc: { amount: amount_total / 100 } },
                { new: true }
            );
            console.log('✅ Success:', event.type, customer_email, amount_total / 100);
        } else if (event.type === 'charge.succeeded') {
            const { email, receipt_url } = event.data.object.billing_details;
            SMTP.sendReceipt(email, receipt_url);
        } else {
            console.log('⛔ Not handled type:', event.type);
        }
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    res.status(200).json({ received: true });
});

module.exports = router;