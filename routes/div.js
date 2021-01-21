const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const Prop = require("../models/Prop");
const manauth = require("../middleware/manauth");
const Division = require("../models/Division");
const User = require("../models/User");

//create new division
router.post(
  "/",
  [
    check("divname", "Введите название отдела").not().isEmpty(),
    check("descrition", "Введите краткое описание отдела").not().isEmpty(),
  ],
  manauth,
  async (req, res) => {
    try {
      let div = await Division.findOne({ divname: req.body.divname });
      if (div) {
        return res.json({ msg: "Отдел с указанным названием уже существует" });
      }

      div = new Division({
        divname: req.body.divname,
        description: req.body.description,
      });
      await div.save();
      return res.json({ msg: "Отдел создан" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "server error" });
    }
  }
);

//get division by name
router.get("/:divname", auth, async (req, res) => {
  try {
    let div = await Division.findOne({ divname: req.params.divname });
    return res.json(div);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//get all divisions
router.get("/all", auth, async (req, res) => {
  try {
    let divs = await Division.find();
    return res.json(divs);
  } catch (error) {
    console.error(error);
    return res.json({ msg: "server error" });
  }
});

//join division
router.put("/:divname", auth, async (req, res) => {
  try {
    let div = await Division.findOne({ divname: req.params.divname });
    if (!div) {
      return res.json({ msg: "Отдел не найден" });
    }
    await Division.findOneAndUpdate(
      { divname: req.params.divname },
      { $push: { members: user } }
    );
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { division: div } }
    );
    return res.json({
      msg: `Вы вступили в отдел ${req.params.divname}`,
      division: div,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//leave division
router.delete("/:divname", auth, async (req, res) => {
  try {
    let div = await Division.findOne({ divname: req.params.divname });
    await Division.findOneAndUpdate(
      { divname: req.params.divname },
      { $pull: { members: user } }
    );
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { division: null } }
    );
    return res.json({ msg: "Вы покинули отдел" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});
module.exports = router;