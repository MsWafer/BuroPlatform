const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/../public/stickers");
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

const auth = require("../middleware/auth");
const Sticker = require("../models/Sticker");
const manauth = require("../middleware/manauth");

//add new sticker
router.post("/addnew", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return;
    }
    let sticker = new Sticker({
      path: "stickers/" + req.file.filename,
      name: req.body.name,
      user: req.user.id,
    });
    await sticker.save();
    return res.json("eee");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get stickers filtered by name
router.get("/get", auth, async (req, res) => {
  try {
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    let query = {};
    if (req.query.name && req.query.name.length > 0) {
      query = {
        name: { $regex: regexEscape(req.query.name), $options: "i" },
      };
    }
    let stickers = await Sticker.find(query).populate(
      "user",
      "avatar fullname"
    );
    res.json(stickers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete sticker
router.delete("/remove/:id", auth, async (req, res) => {
  try {
    let sticker = await Sticker.findOne({ _id: req.params.id });
    if (!sticker) {
      return res.status(404).json({ err: "Стикер не найден" });
    }
    fs.unlink(__dirname + `/../public/${sticker.path}`, (err) => {
      if (err) {
        throw err;
      }
    });
    await sticker.delete();
    res.json("F");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
