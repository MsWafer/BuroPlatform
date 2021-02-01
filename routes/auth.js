const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");

//authentification
router.post(
  "/",
  async (req, res) => {
    try {
      if(!req.body.email&&!req.body.password){return res.json({err: "Заполните поля"})}
      if(!req.body.email){return res.json({err:'Введите email'})}
      if(!req.body.password){return res.json({err:"Введите пароль"})}
    } catch (error) {
      console.error(error)
      return res.status(500).json({err:'server error'})
    }


    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          err: [{ err: "Пользователь с указанным email не найден" }],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ err: [{ err: "Неверный пароль" }] });
      }

      //jsonwebtoken return
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.jwtSecret,
        { expiresIn: 360000000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({err:"server error"});
    }
  }
);

module.exports = router;
