const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");

//authentification
router.post("/", async (req, res) => {
  try {
    if (!req.body.email && !req.body.password) {
      return res.json({ err: "Заполните поля" });
    }
    if (!req.body.email) {
      return res.json({ err: "Введите email" });
    }
    if (!req.body.password) {
      return res.json({ err: "Введите пароль" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        errors: [{ err: "Пользователь с указанным email не найден" }],
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ err: "Неверный пароль" }] });
    }

    if (req.body.dev_id) {
      if (user.device_tokens && !user.device_tokens.includes(req.body.dev_id)) {
        user.device_tokens.push(req.body.dev_id);
      } else {
        user.device_tokens = [req.body.dev_id];
      }
      await user.save();
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
    res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
