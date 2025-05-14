const UserService = require("../user/user.service");
const cache = require('../../utils/cache');


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await UserService.userLogin(email, password);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await UserService.userForgotPassword(email);

    res.status(200).json({ response })
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const email = await UserService.verifyResetToken(token);

    if (email) {
      res.redirect(
        `${process.env.FRONTEND_URL}/reset-password/?token=${token}`
      );
    }

  } catch (error) {

    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const response = await UserService.userResetPassword(token, newPassword);

    res.status(200).json(response)
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await UserService.getUserById(id);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const response = await UserService.getAllUsers();

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const response = await UserService.updateUser(id, data);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}


exports.getAllListings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const filter = req.query.filter || ""
    const search = req.query.search || "";
    const offset = (page - 1) * limit;  

    //Caching
    const cacheKey = `listings:page=${page}-limit=${limit}-filter=${filter}-search=${search}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`✅ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json(cached);
    }
    const response = await UserService.getAllListings(search, offset, page, limit, filter);
    cache.set(cacheKey, response);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(error.status || 500).json({ message: error.message });
  }
}


exports.getUserRole = async (req, res) => {
  try {
    const { email } = req.params;
    const response = await UserService.getUserRole(email);

    res.status(200).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}

exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const newReply = req.body.reply;
    const userId = req.user.id;
    const response = await UserService.replyToReview(reviewId, userId, newReply);
    return res.status(201).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}