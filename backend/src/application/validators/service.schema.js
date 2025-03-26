const Joi = require("joi");

const serviceSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().allow(null, ""),
  address: Joi.string().required(),
  phone_number1: Joi.string().pattern(/^[0-9]+$/).required(),
  phone_number2: Joi.string().pattern(/^[0-9]+$/).allow(null, ""),
  category: Joi.string()
    .valid(
      "auto_repair",
      "contractor",
      "electricians",
      "heating_ac",
      "home_cleaning",
      "landscaping",
      "locksmith",
      "movers",
      "pest_control",
      "plumbing",
      "roofers",
      "fumigation"
    )
    .required(),
  images: Joi.array().items(Joi.string().uri()).allow(null, ""),
  description: Joi.string().allow(null, ""),
  status: Joi.string().valid("pending", "verified", "rejected").default("pending"),
});

module.exports = serviceSchema;
