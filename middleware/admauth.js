const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  //get token from header
  const token = req.header("auth-token");

  //check if no token
  if (!token) {
    return res.status(401).json({ msg: "Токен не введен" });
  }

  //verifying token
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);

    req.user = await decoded.user;
    let user = await User.findOne({ _id: req.user.id });
    if (user.permission != "manager" && user.permission != "admin") {
      return res
        .status(401)
        .json({ err: "У вас недостаточно прав для просмотра этой страницы" });
    }
    next();
  } catch (err) {
    res.status(401).json({ err: "Неверный токен авторизации" });
  }
};
