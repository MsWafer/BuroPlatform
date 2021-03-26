const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const fetch = require("node-fetch");

const Prop = require("../models/Prop");
const manauth = require("../middleware/manauth");
const { response } = require("express");

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
      return res.status(400).json({ err: errors.array() });
    }
    let user = await User.findOne({ _id: req.user.id }).select("-password");

    try {
      let { text, title } = req.body;
      prop = new Prop({
        text,
        title,
        date: Date.now(),
        user: user,
      });
      await prop.save();
      console.log("+prop");
      return res.redirect(303,"/props/all/likes");
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "server error" });
    }
  }
);

//get all propositions sorted by likes
router.get("/all/likes", auth, async (req, res) => {
  try {
    let props = await Prop.find()
      .sort({ likeCount: -1 })
      .populate("user", "-password -permission")
      .populate("executor", "avatar fullname _id");
    res.json(props);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//get all propositions sorted by date
router.get("/all/date", auth, async (req, res) => {
  try {
    let props = await Prop.find()
      .sort({ date: 1 })
      .populate("user", "-password -permission")
      .populate("executor", "avatar fullname _id");
    return res.json(props);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//test query
router.get("/search", auth, async (req, res) => {
  try {
    let result = await Prop.find()
      .select("-__v")
      .populate("executor", "avatar fullname _id")
      .populate("user", "-password -permission");
    let que = req.query.field ? req.query.field : `likes`;
    let order = req.query.order ? req.query.order : -1;

    if (order != 1 && order != -1) {
      order = -1;
    }
    if (!Object.keys(result[0].toJSON()).includes(que)) {
      que = "likes";
    }

    Array.prototype.sortBy = (query) => {
      return result.slice(0).sort(function (a, b) {
        return a[query] > b[query] ? order : a[query] < b[query] ? -order : 0;
      });
    };
    let sortedArray = result.sortBy(que);
    return res.json(sortedArray);
  } catch (error) {
    console.error(error);
    return res.json({ err: "server error" });
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

//add exec
router.put("/exec/:id", auth, async (req, res) => {
  try {
    let prop = await Prop.findOne({ _id: req.params.id })
      .populate("user", "-password -permission")
      .populate("executor", "-password -permission");
    if (!prop) {
      return res.status(404).json({ err: "Предложение не найдено" });
    }
    prop.executor = req.body.user;
    await prop.save();
    let user = await User.findOne({ _id: req.body.user });
    res.json(prop);
    let rc = () =>
      fetch(`${process.env.CHAT}/api/v1/login`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: process.env.R_U,
          password: process.env.R_P,
        }),
      })
        .then((response) => response.json())
        .then((response) =>
          fetch(`${process.env.CHAT}/api/v1/chat.postMessage`, {
            method: "post",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              "X-Auth-Token": response.data.authToken,
              "X-User-Id": response.data.userId,
            },
            body: JSON.stringify({
              channel: `@${user.rocketname}`,
              text: `Вам назначили новую задачу: *insert link here*`,
            }),
          })
        );

    if (user.device_tokens && user.device_tokens.length > 0) {
      mob_push(user.device_tokens, "Вам назначили новую задачу")
    }
    if (req.body.rocket) rc();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
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
router.put("/sts/:id", manauth, async (req, res) => {
  try {
    let prop = await Prop.findOne({ _id: req.params.id });
    // console.log(req.body);
    if (prop.status == 0) {
      await Prop.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: 1, executor: req.body.executor } }
      );

      let props = await Prop.find().populate(
        "executor",
        "-password -permission"
      );
      console.log("prop status changed");
      res.json({ msg: `Статус изменен`, props: props });

      if (req.body.rocket == true) {
        let user = await User.findOne({ _id: req.body.executor });
        let rc = () =>
          fetch(`${process.env.CHAT}/api/v1/login`, {
            method: "post",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: process.env.R_U,
              password: process.env.R_P,
            }),
          })
            .then((response) => response.json())
            .then((response) =>
              fetch(`${process.env.CHAT}/api/v1/chat.postMessage`, {
                method: "post",
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json",
                  "X-Auth-Token": response.data.authToken,
                  "X-User-Id": response.data.userId,
                },
                body: JSON.stringify({
                  channel: `@${user.rocketname}`,
                  text: `Вам назначили новую задачу: ${prop.title}`,
                }),
              })
            );
        rc();
      }
    } else if (prop.status == 1) {
      await Prop.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: 0, executor: null } }
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//finish prop
router.put("/sts/f/:id", manauth, async (req, res) => {
  try {
    let prop = await Prop.findOne({ _id: req.params.id });
    if (!prop) {
      return res.status(404).json({ err: "Предложение не найдено" });
    }
    prop.status = 2;
    await prop.save();
    return res.json(prop);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
