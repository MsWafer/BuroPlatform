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
router.get("/find/:divname", async (req, res) => {
  try {
    let govno = decodeURI(req.params.divname)
    let div = await Division.findOne({ divname: govno}).populate({path:"members",select:"-password -permission", populate:{path:"projects",select:"-team",populate:{path:"sprints"}}});
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
    let div = await Division.findOne({ divname: req.params.divname }).populate("members","-password -permission");
    if (!div) {
      return res.json({ msg: "Отдел не найден" });
    }
    if (div.members.includes(req.user.id)) {
      return res.json({ err: "Вы уже находитесь в этом отделе" });
    }
    let a = await User.findOne({ _id: req.user.id }).select("-password").populate("division");
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
      { $pull: { members: req.user.id } }
    );
    console.log('user pulled from division')
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { division: null } }
    );
    console.log("user's div set to null")
    return res.json({ msg: `Вы покинули отдел ${req.params.divname}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//get all div's projects
router.get("/projects/:divid",async(req,res)=>{
  try {
    let prj = await User.find({division:req.params.divid}).select("projects").populate("projects")
    return res.json(prj)
  } catch (error) {
    console.error(error)
    return res.json({err:'server error'})
  }
  
})
module.exports = router;
