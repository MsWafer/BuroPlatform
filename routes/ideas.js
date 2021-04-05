const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Idea = require("../models/Idea");
const manauth = require("../middleware/manauth");

//new idea
router.post("/", auth, async (req, res) => {
  try {
    let idea = new Idea({
      title: req.body.title,
      description: req.body.description,
      dateOpen: Date.now(),
      user: req.user.id,
    });
    await idea.save();
    res.redirect(303, "/ideas/unapproved");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get all ideas
router.get("/all", auth, async (req, res) => {
  let ideas = await Idea.find()
    .populate([{ path: "user", select: "avatar fullname" }])
    .sort({ likeCount: -1 });
  // let { unapproved, approved, finished } = [];
  let unapproved = [];
  let approved = [];
  let finished = [];
  for (let idea of ideas) {
    idea.type == 0
      ? unapproved.push(idea)
      : idea.type == 1
      ? approved.push(idea)
      : finished.push(idea);
  }
  return res.json({
    unapproved: unapproved,
    approved: approved,
    finished: finished,
  });
});

router.get("/unapproved", auth, async (req, res) => {
  try {
    let ideas = await Idea.find({ type: 0 })
      .populate([{ path: "user", select: "avatar fullname" }])
      .sort({ likeCount: -1 });
    return res.json(ideas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

router.get("/approved", auth, async (req, res) => {
  try {
    let ideas = await Idea.find({ type: 1 })
      .populate([{ path: "user", select: "avatar fullname" }])
      .sort({ likeCount: -1 });
    return res.json(ideas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

router.get("/finished", auth, async (req, res) => {
  try {
    let ideas = await Idea.find({ type: 2 })
      .populate([{ path: "user", select: "avatar fullname" }])
      .sort({ likeCount: -1 });
    return res.json(ideas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//likes/dislikes
router.put("/like/:id", auth, async (req, res) => {
  try {
    let idea = await Idea.findOne({ _id: req.params.id });
    if (!idea) {
      return res.status(404).json({ err: "Идея не найдена" });
    }
    if (idea.likes.includes(req.user.id)) {
      idea.likes = idea.likes.filter((el) => el != req.user.id);
      idea.likeCount -= 1;
    } else {
      idea.likes.push(req.user.id);
      idea.likeCount += 1;
    }
    await idea.save();
    res.redirect(303, "/ideas/unapproved");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change type
router.put("/typechange", auth, async (req, res) => {
  try {
    let idea = await Idea.findOne({ _id: req.query.id });
    if (!idea) {
      return res.status(404).json({ err: "Идея не найдена" });
    }
    idea.type = Number(req.query.type);
    if (idea.type == 1) {
      idea.dateAccept = Date.now();
    }
    if (idea.type == 2) {
      idea.dateFinish = Date.now();
    }
    await idea.save();
    res.redirect(303, "/ideas/all");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit
router.put("/edit/:id", manauth, async (req, res) => {
  try {
    let idea = await Idea.findOne({ _id: req.params.id });
    if (!idea) {
      return res.status(404).json({ err: "Идея не найдена" });
    }
    let keys = Object.keys(req.body);
    for (let key of keys) {
      idea[key] = req.body[key];
    }
    await idea.save();
    res.redirect(303, "/ideas/all");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete
router.delete("/delete/:id", manauth, async (req, res) => {
  try {
    await Idea.findOneAndDelete({ _id: req.params.id });
    res.redirect(303, "/ideas/all");
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
