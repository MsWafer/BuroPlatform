const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  //get token from header
  const token = req.header("auth-token");

  //check if no token
  if (!token) {
    return res.status(401).json({ msg: "Токен не введен" });
  }

  //verifying token
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);

    req.customer = decoded.customer;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Неверный токен авторизации" });
  }
};
