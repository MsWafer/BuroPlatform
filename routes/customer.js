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
const Customer = require("../models/Customer");
const Sprint = require("../models/Sprint");

//customer registration
router.post("/", async (req, res) => {
  if (!req.body.email && !req.body.rocketname) {
    return res.json({ err: "Заполните поля" });
  }
  if (!req.body.email) {
    return res.json({ err: "Введите email" });
  }
  if (!req.body.password) {
    return res.json({ err: "Введите пароль" });
  }
  let { email, password } = req.body;

  //existing customer check
  try {
    let customer = await Customer.findOne({ email }).select("-password");
    if (customer) {
      return res
        .status(400)
        .json({ err: "Пользователь с указанным email уже существует" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }

  try {
    customer = new Customer({
      email,
    });

    const salt = await bcrypt.genSalt(12);
    customer.password = await bcrypt.hash(password, salt);

    await customer.save();
    console.log("new customer registered");

    //jsonwebtoken return
    const payload = { customer: { id: customer.id } };

    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 360000000 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token: token,
          id: customer.id,
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//reg by link 1
router.post("/link", manauth, async (req, res) => {
  try {
    let regId = Buffer.from(Date.now()).toString("base64");
    let cust = new Customer({
      companyName: req.body.companyName,
      regId: regId,
      projects: req.body.projects,
    });
    await cust.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//reg by link 2
router.put("/link/:regId", async (req, res) => {
  try {
    let customer = await Customer.findOne({ regId: req.params.regId });
    if (!customer) {
      return res.status(404).json({ err: "Неверный ссылка регистрации" });
    }
    if (customer.active) {
      return res
        .status(400)
        .json({ err: "Указанная ссылка регистрации уже была использована" });
    }
    const salt = await bcrypt.genSalt(12);

    customer.email = req.body.email;
    customer.password = await bcrypt.hash(req.body.password, salt);
    customer.active = true;
    customer.url = req.body.url;
    customer.phone = req.body.phone;
    customer.desciption = req.body.desciption;
    await customer.save();

    //jsonwebtoken return
    const payload = { customer: { id: customer.id } };

    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: 3600 * 24 * 30 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token: token,
          id: customer.id,
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//customer auth
router.post("/auth/", async (req, res) => {
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
    let customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({
        err: [{ err: "Пользователь с указанным email не найден" }],
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ err: [{ err: "Неверный пароль" }] });
    }

    //jsonwebtoken return
    const payload = {
      customer: {
        id: customer.id,
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

//edit profile
router.put("/", cusauth, async (req, res) => {
  try {
    let cus = await Customer.findOne({ _id: req.customer.id });
    if (!cus) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    cus.name = req.body.name;
    cus.desciption = req.body.desciption;
    cus.email = req.body.email;
    cus.url = req.body.url;
    cus.phone = req.body.phone;
    await cus.save();
  } catch (error) {
    console.error(error);
    return res.json({ err: "server error" });
  }
});

//get customer's profile
router.get("/me", cusauth, async (req, res) => {
  try {
    let customer = await Customer.findOne({ _id: req.customer.id })
      .select("-password")
      .populate("projects", "-sprints -team -obj -mtl -rocketname");
    if (!customer) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    return res.json(customer);
  } catch (error) {
    console.error(error);
    return res.json({ err: "server error" });
  }
});

//get customer's profile by id
router.get("/:id", auth, async (req, res) => {
  try {
    let cus = await Customer.findOne({ _id: req.params.id })
      .select("-password")
      .populate("projects");
    if (!cus) {
      return res.status(404).json({ err: "Заказчик не найден" });
    }
    res.json(cus);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get all customer's projects for customer
router.get("/projects", cusauth, async (req, res) => {
  try {
    let projects = await Customer.find({ _id: req.customer.id }).select("projects").populate(
      "projects",
      "-sprints -team -customer -rocketchat -release -obj -mtl"
    );
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.json({ err: "server error" });
  }
});

router.get("/pubproj/:id",async(req,res)=>{
  try {
    let prj = await Project.findOne({"release.publicId":req.params.id}).select("-team -sprints")
    if(!prj){return res.status(404).json({err:'Указанный проект не найден'})}
    return res.json(prj)
  } catch (error) {
    console.error(error)
    return res.status(500).json({err:'server error'})
  }
})
module.exports = router;
