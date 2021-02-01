const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const News = require("../models/News");

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
      const newNews = new News({
        author: req.user.id,
        title: req.body.title,
        text: req.body.text,
        postDate: Date.now(),
        subtitle: req.body.subtitle,
      });
      try {
        await newNews.save();
      } catch (error) {
        console.log(error);
      }
      res.json({news:newNews,msg:`Новость добавлена ${newNews.title}`});
      console.log("Новая новость добавлена");
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
    if(!news){return res.status(404).json({err:'Новость не найдена'})}
    console.log("get news by id");
    return res.json({news:news,msg:''});
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
    // let news1 = await news.findOne({ _id: req.params.id });
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
    return res.json({news:news,msg:'НОВОСТЬ ИЗМЕНЕНА'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "Server error" });
  }
});
module.exports = router;
