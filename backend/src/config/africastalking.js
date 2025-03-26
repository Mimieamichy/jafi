const AfricasTalking = require('africastalking');

exports.africastalking = AfricasTalking({
  apiKey: process.env.AFRICATALKING_API_KEY,
  username: process.env.AFRICATALKING_USERNAME
}).SMS;


