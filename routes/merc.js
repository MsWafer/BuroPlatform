const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { check, validationResult } = require("express-validator");
const cusauth = require("../middleware/cusauth");
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/usr/src/app/public/avatars");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Разрешенны только .jpg, .png, .jpeg"));
    }
  },
});

const User = require("../models/User");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const Merc = require("../models/Merc");

//new merc
router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.lastname) {
    return res.json({ err: "Заполните все поля" });
  }
  let { name, lastname, contacts, job } = req.body;
  let fullname = req.body.lastname + " " + req.body.name;

  try {
    let merc = await Merc.findOne({ fullname });
    if (merc) {
      return res
        .status(400)
        .json({ err: "Смежник с указанным именем уже существует" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }

  try {
    merc = new Merc({
      name,
      lastname,
      fullname,
      contacts,
      job,
    });

    await merc.save();
    return res.json({ msg: `Сметчик ${fullname} добавлен`, merc: merc });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//delete merc
router.delete("/", manauth, async (req, res) => {
  try {
    let merc = await Merc.findOne({ fullname: req.body.fullname });
    if (!merc) {
      return res.status(404).json({ err: "Смежник не найден" });
    }
    await merc.remove();
    return res.json({ msg: "Смежник удален" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit merc
router.put("/edit/:id", manauth, async (req, res) => {
  try {
    let merc = await Merc.findOne({ _id: req.params.id });
    if (!merc) {
      return res.status(404).json({ err: "Смежник не найден" });
    }
    merc.name = req.body.name;
    merc.lastname = req.body.lastname;
    merc.fullname = req.body.lastname + " " + req.body.name;
    merc.contacts.phone = req.body.phone;
    merc.contacts.email = req.body.email;
    await merc.save();
    return res.json(merc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add contact
router.put("/contact/:id", manauth, async (req, res) => {
  try {
    let merc = await Merc.findOne({ _id: req.params.id });
    if (!merc) {
      return res.status(404).json({ err: "Смежник не найден" });
    }
    merc.contacts[req.body.property] = req.body.value;
    await merc.save();
    return res.json(merc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get mercs
router.get("/find", async (req, res) => {
  try {
    let merc;
    if (req.query.name == "all") {
      merc = await Merc.find();
    } else {
      merc = await Merc.find({ fullname: req.query.name });
    }
    if (!merc) {
      return res.status(404).json({ err: "Смежник не найден" });
    }
    return res.json(merc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
