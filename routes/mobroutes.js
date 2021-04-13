const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const { check, validationResult } = require("express-validator");
const fetch = require("node-fetch");

const User = require("../models/User");
const News = require("../models/News");
const Sprint = require("../models/Sprint");
const mob_push = require("../middleware/mob_push");
const Stat = require("../models/Stat");
const { response } = require("express");
const Project = require("../models/Project");

//get sprint
router.get("/mobsprint/:id", async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).select(
      "status title dateOpen dateClosePlan dateCloseFact description tags tasks.taskStatus creator"
    );
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let arr = [];
    for (let el of sprint.tasks) {
      arr.push(el.taskStatus);
    }
    let response = sprint._doc;
    response.tasks = arr;
    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get sprint's tasks
router.get("/mobtasks/:id", async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).select("tasks");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    return res.json(sprint.tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get project
router.get("/mobproject/:crypt", async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .populate([
        { path: "sprints", select: "title status tags tasks.taskStatus" },
        { path: "team2.user", select: "avatar fullname" },
      ])
      .select(
        "title offTitle type stage about dateStart dateFinish par cusStorage schedule budget team2 sprints customerNew city area crypt crypter status rocketchat tags urnNew infoRes cover"
      );
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//project's team2
router.get("/mobteam2/:crypt", async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .populate("team2.user", "avatar fullname")
      .select("team2 crypt");
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//project's sprints
router.get("/mobprjspr/:crypt", async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .populate("sprints", "title status tags tasks.taskStatus")
      .select("sprints crypt");
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
