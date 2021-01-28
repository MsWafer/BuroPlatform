const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const Prop = require("../models/Prop");
const manauth = require("../middleware/manauth");

//add proposition
router.post(
  "/",
  auth,
  [
    check("title", "Введите заголовок").not().isEmpty(),
    check("text", "Введите текст").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let user = await User.findOne({_id:req.user.id})

    try {
      let { text, title } = req.body;
      prop = new Prop({
        text,
        title,
        date: Date.now(),
        user: user
      });
      await prop.save();
      console.log("+prop");
      return res.json({ msg: "Предложение добавлено" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//get all propositions sorted by likes
router.get("/all/likes", auth, async (req, res) => {
  try {
    let props = await Prop.find().sort({ likeCount: -1 }).select("-likes").populate("user","-password -permission");
    res.json(props);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//get all propositions sorted by date
router.get("/all/date", auth, async (req, res) => {
  try {
    let props = await Prop.find().sort({ date: 1 }).select("-likes").populate("user","-password -permission");
    res.json(props);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//dis/like proposition
router.put("/like/:id", auth, async (req, res) => {
  try {
    let prop = await Prop.findById(req.params.id);

    if (
      prop.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      let removeIndex = prop.likes
        .map((like) => like.user.toString())
        .indexOf(req.user.id);
      prop.likes.splice(removeIndex, 1);
      await Prop.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { likeCount: -1 } }
      );
      await prop.save();
      return res.json({ msg: "-" });
    }

    prop.likes.unshift({ user: req.user.id });
    await Prop.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { likeCount: 1 } }
    );
    await prop.save();
    return res.json({ msg: "+" });
  } catch (err) {
    consoler.error(err.message);
    res.status(500).send("server error");
  }
});

//remove proposition
router.delete("/:id", manauth, async (req, res) => {
  try {
    await Prop.findOneAndDelete({ _id: req.params.id });
    console.log("-prop");
    res.json({ msg: "Предложение удалено" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//change prop status
router.put('/sts/:id',manauth,async(req,res)=>{
  try {
    let prop = await Prop.findOne({ _id: req.params.id });
    if (prop.status == false) {
      await Prop.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: true} }
      );
    } else if (prop.status == true) {
      await Prop.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: false} }
      );
    }
    console.log("prop status changed");
    return res.json({ msg: `Статус изменен ${req.params.id}` });
  } catch (error) {
    console.error(error)
    return res.status(500).json({err:'server error'})
  }
})

module.exports = router;
