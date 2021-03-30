const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const { check, validationResult } = require("express-validator");

const Doc = require("../models/Docs");

//new part
router.post("/", auth, async (req, res) => {
  try {
    let doc = await Doc.findOne({ title: req.body.title });
    if (doc) {
      return res.status(400).json({ err: "Название занято" });
    }
    doc = new Doc({
      title: req.body.title,
      text: req.body.text,
      creator: req.user.id,
    });
    await doc.save();
    return res.json(doc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add doc
router.post("/:id", auth, async (req, res) => {
  try {
    let doc = await Doc.findOne({ _id: req.params.id });
    if (!doc) {
      return res.status(404).json({ err: "Док не найден" });
    }
    let subdoc = {
      title: req.body.title,
      text: req.body.text,
      creator: req.user.id,
    };
    doc.docs.push(subdoc);
    await doc.save();
    return res.json(doc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get all
router.get("/", auth, async (req, res) => {
  try {
    let docs = await Doc.find().select("title docs.title");
    return res.json(docs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get specific doc
router.get("/find", auth, async (req, res) => {
  try {
    let doc;
    req.query.type == "id"
      ? (doc = await Doc.findOne({ _id: req.query._id }).select("title text"))
      : (doc = await Doc.findOne({ "docs._id": req.query.id }).docs[
          req.query.index
        ]);
    return res.json(doc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});
module.exports = router;
