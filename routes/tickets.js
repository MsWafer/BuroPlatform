const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const admauth = require("../middleware/admauth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../public/ticketSS");
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

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const manauth = require("../middleware/manauth");

//create ticket
router.post(
  "/",
  upload.single("file"),
  [
    auth,
    [
      check("problemname", "Введите проблему").not().isEmpty(),
      check("text", "Введите описание проблемы").not().isEmpty(),
      check("emergency", "Выберите срочность").not().isEmpty().isNumeric(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array() });
    }

    try {
      let user = await User.findOne({ _id: req.user.id }).select(
        "-password -permission"
      );
      let currDate = new Date();

      const newTicket = new Ticket({
        user: req.user.id,
        problemname: req.body.problemname,
        text: req.body.text,
        date: currDate,
        emergency: req.body.emergency,
        name: user.name,
        pcpass: req.body.pcpass,
        screenshot: req.file ? "ticketSS/" + req.file.filename : "",
      });
      try {
        await newTicket.save();
        await User.findOneAndUpdate(
          { _id: req.user.id },
          { $push: { tickets: newTicket } }
        );
      } catch (error) {
        console.log(error);
      }

      res.json({ msg: `Новая проблема добавлена ${newTicket.problemname}` });
      console.log("Новый тикет добавлен");
    } catch (err) {
      res.status(500).send("serve error");
    }
  }
);

//get all tickets
router.get("/all", manauth, async (req, res) => {
  try {
    let tickets = await Ticket.find()
      .sort({ date: -1 })
      .populate("user", "-tickets -projects -avatar");
    console.log("GET all tickets");
    return res.json(tickets);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).send("server error");
  }
});

//get ticket by id
router.get("/:id", manauth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate(
      "user",
      "-tickets -projects -avatar"
    );

    if (!ticket) {
      return res.status(404).json({ msg: "ticket not found" });
    }
    console.log("ticket found by id");
    res.json(ticket);
  } catch (err) {
    console.log(err);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "ticket not found" });
    }
    res.status(500).send("server error");
  }
});

//get all user's tickets
router.get("/user/:id", manauth, async (req, res) => {
  try {
    let tickets = await Ticket.find({ user: req.params.id })
      .sort({ date: -1 })
      .populate("user", "-projects -tickets -avatar");
    console.log(`found all tickets of user ${req.params.id}`);
    return res.json(tickets);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).send("server error");
  }
});

//get all active tickets
router.get("/all/active", manauth, async (req, res) => {
  try {
    let tickets = await Ticket.find({ status: true })
      .sort({ date: -1 })
      .populate("user", "-tickets -projects -avatar");
    console.log("found all active tickets");
    return res.json(tickets);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).send("server error");
  }
});

//get all tickets sorted by emergency
router.get("/all/emergency", manauth, async (req, res) => {
  try {
    let tickets = await Ticket.find()
      .sort({ emergency: -1 })
      .populate("user", "-projects -tickets -avatar");
    console.log("get all tickets by emergency");
    return res.json(tickets);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).send("server error");
  }
});

//deactivate ticket by id
router.put("/:id", admauth, async (req, res) => {
  try {
    let ticket = await Ticket.findOneAndUpdate(
      { id: req.params._id },
      { $set: { status: false } }
    );
    console.log(`ticket ${ticket.id} deactivated`);
    return res.json({ msg: `${ticket.id} пофикшен` });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("server error");
  }
});

//delete ticket by id
router.delete("/:id", admauth, async (req, res) => {
  try {
    let ticket = await Ticket.findOne({ _id: req.params.id });
    await User.updateMany(
      { tickets: ticket._id },
      { $pull: { tickets: ticket._id } },
      { multi: true }
    );
    await Ticket.findOneAndDelete({ _id: req.params.id });
    console.log("ticket deleted");
    return res.json({ msg: "ticket udalen" });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

module.exports = router;
