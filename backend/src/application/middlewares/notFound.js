require("dotenv").config();

exports.notFound = (req, res, next) => {
  res.redirect(`${process.env.FRONTEND_URL}/*`);

};
