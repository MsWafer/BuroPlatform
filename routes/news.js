const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const { check, validationResult } = require("express-validator");
const fetch = require("node-fetch");

const User = require("../models/User");
const News = require("../models/News");
const mob_push = require("../middleware/mob_push");
const Stat = require("../models/Stat");

//post new news
router.post(
  "/",
  manauth,
  [
    check("title", "Введите заголовок новости").not().isEmpty(),
    check("text", "Введите текст новости").not().isEmpty(),
    check("subtitle", "Введите подзаголовок новости").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array() });
    }
    try {
      let user = await User.findOne({ _id: req.user.id });
      const newNews = new News({
        author: req.user.id,
        title: req.body.title,
        text: req.body.text,
        postDate: Date.now(),
        subtitle: req.body.subtitle,
      });
      await newNews.save();
      let allNews = await News.find()
        .populate("author", "avatar fullname")
        .sort({ postDate: -1 });
      res.json({
        news: newNews,
        msg: `Новость добавлена ${newNews.title}`,
        allNews: allNews,
      });
      console.log("Новая новость добавлена");
      await fetch(`${process.env.CHAT}/api/v1/login`, {
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
        .then((res) => res.json())
        .then((res) =>
          fetch(`${process.env.CHAT}/api/v1/chat.postMessage`, {
            method: "post",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              "X-Auth-Token": res.data.authToken,
              "X-User-Id": res.data.userId,
            },
            body: JSON.stringify({
              channel: `#general`,
              text: `@all
              Добавлена новость
               - Автор: ${user.fullname};
               - Тема: ${req.body.title}`,
              attachments: [
                {
                  thumb_url: "https://bd.buro82.ru/avatars/spurdo.png",
                  title: "Ссылка на новости",
                  title_link: "https://space.buro82.ru/news",
                },
              ],
            }),
          })
        );
      let users = await User.find({
        device_tokens: { $ne: [] },
        device_tokens: { $ne: undefined },
      });
      users = users.filter(
        (user) => user.device_tokens && user.device_tokens.length > 0
      );
      if (users.length > 0) {
        let token_array = [];
        users.forEach(
          (user) => (token_array = token_array.concat(user.device_tokens))
        );
        let user = await User.findOne({ _id: req.user.id });
        let data = {
          news_id: newNews._id,
          avatar: user.avatar,
          fullname: user.fullname,
        };
        mob_push(token_array, req.body.title, data, "Новость в бюро");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ err: "Server error" });
    }
  }
);

//get all news
router.get("/all", auth, async (req, res) => {
  try {
    let news = await News.find()
      .sort({ postDate: -1 })
      .populate("author", "-password -permission -projects -tickets");
    console.log("get all news");
    return res.json(news);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

//get news by id
router.get("/:id", auth, async (req, res) => {
  try {
    let news = await News.findOne({ _id: req.params.id }).populate(
      "author",
      "-password -permission -projects -tickets"
    );
    if (!news) {
      return res.status(404).json({ err: "Новость не найдена" });
    }
    console.log("get news by id");
    return res.json({ news: news });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Server error" });
  }
});

//remove news by id
router.delete("/:id", manauth, async (req, res) => {
  try {
    await News.findOneAndDelete({ _id: req.params.id });
    console.log("news deleted");
    return res.json({ msg: "Новость удалена" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

//edit news by id
router.put("/:id", manauth, async (req, res) => {
  try {
    let news = await News.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          title: req.body.title,
          subtitle: req.body.subtitle,
          text: req.body.text,
        },
      }
    );
    console.log("news changed");
    return res.json({ news: news, msg: "НОВОСТЬ ИЗМЕНЕНА" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Server error" });
  }
});

//get stats
router.get("/get/stats", auth, async (req, res) => {
  try {
    let stat = await Stat.find();
    let response;
    if (req.query.type == "all") {
      response = stat;
    } else {
      response = stat.pop();
    }
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
