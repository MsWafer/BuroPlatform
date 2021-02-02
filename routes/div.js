const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const manauth = require("../middleware/manauth");
const Division = require("../models/Division");
const User = require("../models/User");
const { findOneAndUpdate } = require("../models/User");

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
      console.log("ОТДЕЛ СОЗДАН");
      return res.json({ msg: "Отдел создан", div: div });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "server error" });
    }
  }
);

//get division by name
router.get("/find/:divname", auth, async (req, res) => {
  try {
    let div = await Division.findOne({ divname: req.params.divname });
    if (!div) {
      return res.status(400).json({ msg: "Отдел не найден" });
    }
    return res.json(div);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//get all divisions
router.get("/all", auth, async (req, res) => {
  try {
    let divs = await Division.find().populate(
      "members",
      "-password -permission"
    );
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
    if (div.members.includes(req.user.id)) {
      return res.json({ err: "Вы уже находитесь в этом отделе" });
    }
    let a = await User.findOne({ _id: req.user.id }).populate("division");
    console.log(a)
    if(a.division != null || a.division != undefined){
    await Division.findOneAndUpdate(
      { divname: a.division.divname },
      { $pull: { members: req.user.id } }
    );      
    }
    await Division.findOneAndUpdate(
      { divname: div.divname },
      { $push: { members: req.user.id } }
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
    return res.status(500).json({ err: "server error" });
  }
});

//leave division
router.delete("/:divname", auth, async (req, res) => {
  try {
    let div = await Division.findOne({ divname: req.params.divname });
    if (!div) {
      return res.json({ err: "Отдел не найден" });
    }
    await Division.findOneAndUpdate(
      { divname: div.divname },
      { $pull: { members: req.user } }
    );
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { division: null } }
    );
    return res.json({ msg: `Вы покинули отдел ${req.params.divname}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});
module.exports = router;
