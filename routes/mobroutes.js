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

//join v2.0
router.put("/join2/:crypt", auth, async (req, res) => {
  try {
    //checks
    let project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team2.user",
      "_id"
    );
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let user = await User.findOne({ _id: req.user.id });
    let member_object;

    let team_check = project.team2.filter(
      (userObj) => userObj.user._id.toString() === user._id.toString()
    );

    if (team_check.length == 0) {
      //join team
      member_object = {
        position: req.body.position,
        task: req.body.task,
        user: req.user.id,
      };
      project.team2.push(member_object);
      user.projects.push(project._id);

      if (project.rocketchat) {
        await rcinvprj(project, user);
      }
    } else {
      //leave team
      project.team2 = project.team2.filter(
        (user_obj) => user_obj.user._id != req.user.id
      );
      user.projects = user.projects.filter(
        (prj) => prj != project._id.toString()
      );
      if (project.rocketchat) {
        await rckickprj(project, user);
      }
    }
    await project.save();
    await user.save();
    res.redirect(303, `/mob/mobteam2/${project.crypt}/`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//deactivate task
router.put("/sprints/DAtask/:taskid", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({
      "tasks._id": req.params.taskid,
    });
    if (!sprint) {
      return res.status(404).json({ msg: "Спринт не найден" });
    }
    let task = sprint.tasks.filter((el) => el._id == req.params.taskid);
    console.log(req.params)
    console.log(task.length)
    task[0].taskStatus = !task[0].taskStatus;
    let num = task[0].taskStatus ? 1 : -1;
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: { task_close_count: num } }
    );
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    return res.json(task[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit task
router.put("/sprints/taskedit/:taskid", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({
      "tasks._id": req.params.taskid,
    }).populate("creator");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let a = sprint.tasks.filter((task) => task._id == req.params.taskid)[0];
    let keys = Object.keys(req.body);
    keys.forEach((key) => (a[key] = req.body[key]));
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    return res.json(a);
  } catch (error) {
    console.error(error);
    return res.json({ msg: "server error" });
  }
});

module.exports = router;
