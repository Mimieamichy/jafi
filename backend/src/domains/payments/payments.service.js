const { Payment, User } = require('../../models/index')
const https = require('https')



exports.createPayment = async (userId, entityId, entityType, amount) => {
  // Validate entity type
  if (!['business', 'service', 'claim'].includes(entityType)) {
    throw new Error("Invalid entity type. Must be 'business' or 'service' or 'claim'");
  }

  const payment_reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;


  // Create the transaction with the appropriate ID field based on entity type
  const paymentData = {
    userId,
    amount,
    payment_reference,
    entity_type: entityType,
    entity_id: entityId,
    created_at: new Date(),
  };

  return await Payment.create(paymentData);
};


exports.makePayment = async (transactionId) => {
  // Find the transaction and its associated user
  const transaction = await Payment.findByPk(transactionId, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email"]
      }
    ]
  });

  if (!transaction) {
    throw new Error('transaction not found');
  }


  // Access the transaction data
  const email = transaction.user.dataValues.email;
  const amount = parseFloat(transaction.dataValues.amount) * 100; // Convert to kobo
  const paymentReference = transaction.dataValues.payment_reference;

  // Prepare request data for Paystack
  const params = JSON.stringify({
    email: email,
    amount: amount, // Already converted to kobo
    reference: paymentReference,
  });


  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  // Return a new Promise that will resolve with the Paystack response
  return new Promise((resolve, reject) => {
    const reqPaystack = https.request(options, (resPaystack) => {
      let data = '';

      resPaystack.on('data', (chunk) => {
        data += chunk;
      });

      resPaystack.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response); // Resolve the promise with the response data
        } catch (error) {
          reject(new Error('Failed to parse response data'));
        }
      });
    });

    reqPaystack.on('error', (error) => {
      console.error('Error initializing payment:', error);
      reject(new Error('Error initializing payment'));
    });

    reqPaystack.write(params);
    reqPaystack.end();
  });
};


exports.verifyPayment = async (reference) => {
  try {
    const transaction = await Payments.findOne({ where: { payment_reference: reference } });
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/transaction/verify/${reference}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      };

      https.get(options, (resPaystack) => {
        let data = '';

        resPaystack.on('data', (chunk) => {
          data += chunk;
        });

        resPaystack.on('end', async () => {
          try {
            const response = JSON.parse(data);

            if (response.status && response.data.status === 'success') {
              transaction.status = "successful";
            } else {
              transaction.status = "failed";
            }

            await transaction.save();

            if (response.status && response.data.status === 'success') {
              resolve(response.data);
            } else {
              reject(new Error(response.data.gateway_response || 'Payment verification failed'));
            }
          } catch (error) {
            console.error('Error processing payment verification:', error);
            reject(new Error('Internal server error'));
          }
        });
      }).on('error', (error) => {
        console.error('Error making Paystack request:', error);
        reject(new Error('Error verifying payment'));
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    throw new Error('Internal server error');
  }
};


exports.viewPayments = async (offset, limit, page) => {
  const { count, rows: payments } = await Payment.findAndCountAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "role"],
      },
    ],
    order: [["createdAt", "DESC"]],
    offset,
    limit
  });

  if (!payments) {
    return {
      message: "No transactions found", data: null,
      meta: { page, limit, total: count },
    }
  }
  return {
    data: payments,
    meta: { page, limit, total: count },
  };
};


