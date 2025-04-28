require('dotenv').config()
const Business = require("../business/business.model");
const Claim = require("../claim/claim.model");
const PaymentService = require("../payments/payments.service")
const Service = require("../service/service.model");
const Payment = require("./payments.model");
const crypto = require('crypto');
const secret = process.env.PAYSTACK_SECRET_KEY;


exports.createPayment = async (req, res) => {
    try {
        const { entityId } = req.params;
        const { entityType, amount } = req.body;

        if (entityType == 'service') {
            // Find the service to get the userId
            const service = await Service.findOne({
                where: { id: entityId },
                include: [{ model: User, as: 'user' }] // Assuming the Service model has a relation to User
            });

            if (!service || !service.user) {
                return res.status(404).json({ error: "Service not found or does not have an associated user." });
            }

            userId = service.user.id;
            return userId;

        }
        else if (entityId == 'business') {
            // Find the service to get the userId
            const business = await Business.findOne({
                where: { id: entityId },
                include: [{ model: User, as: 'user' }] // Assuming the Service model has a relation to User
            });

            if (!business || !business.user) {
                return res.status(404).json({ error: "Service not found or does not have an associated user." });
            }

            userId = business.user.id;
            return userId;

        } else {
            //For claims payment (anyone can make a claim to a business or service)
             userId = null
        }

        // Generate a unique payment reference
        const payment_reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const transaction = await PaymentService.createPayment(
            userId,
            entityId,
            entityType,
            amount,
            payment_reference
        );

        res.status(200).json(transaction);
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.makePayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const paymentResponse = await PaymentService.makePayment(transactionId)
        res.status(200).json({ paymentResponse })
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { reference } = req.params
    try {
        const paymentData = await PaymentService.verifyPayment(reference);
        res.status(200).json(paymentData)
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}


exports.viewPayments = async (req, res) => {
    try {
        const response = await PaymentService.viewPayments();
        res.status(200).json(response);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};


