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
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .select("tasks")
      .populate("tasks.user", "fullname avatar");
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
    console.log("DA", req.params);
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
    await Sprint.populate(sprint, {
      path: "tasks.user",
      select: "fullname avatar",
    });
    return res.json(task[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit task
router.put("/sprints/taskedit/:taskid", auth, async (req, res) => {
  try {
    console.log("edit", req.params);
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
    await Sprint.populate(sprint, {
      path: "tasks.user",
      select: "fullname avatar",
    });
    return res.json(a);
  } catch (error) {
    console.error(error);
    return res.json({ msg: "server error" });
  }
});

//add user to task
router.put("/sprints/task/adduser/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).populate(
      "creator"
    );

    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let user = await User.findOne({ _id: req.body.userid });
    if (!user) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    let task = sprint.tasks.filter((task) => task._id == req.body.taskid);
    let ind = sprint.tasks.indexOf(task[0]);
    sprint.tasks[ind].user = req.body.userid;
    sprint.tasks[ind].user2 = req.user.id;
    await sprint.save();
    await Sprint.populate(sprint, {
      path: "tasks.user",
      select: "fullname avatar",
    });

    res.json(task[0]);

    //notifications
    let notification_body = `Вам назначили новую задачу: ${task[0].taskTitle}`;

    if (user.device_tokens && user.device_tokens.length > 0) {
      let user2 = await User.findOne({ _id: req.user.id });
      let data = {
        sprint_id: sprint._id._id,
        avatar: user2.avatar,
        fullname: user2.fullname,
      };
      mob_push(
        user.device_tokens,
        task[0].taskTitle,
        data,
        "Вам назначили задачу"
      );
    }

    if (req.body.rocket == true) {
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
                channel: `@${user.rocketname}`,
                text: notification_body,
              }),
            })
          );

      rc();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delete sprint by id
router.delete("/sprints/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Не найден спринт с указанным id" });
    }
    let project = await Project.findOne({ sprints: req.params.id });
    project.sprints = project.sprints.filter(
      (el) => el.toString() != req.params.id.toString()
    );
    await project.save();
    await User.updateMany(
      { sprints: sprint._id },
      { $pull: { sprints: sprint._id } }
    );
    await sprint.remove();
    console.log("sprint deleted");
    return res.redirect(303, `/mob/mobprjspr/${project.crypt}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//change sprint status
router.put("/sprints/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    sprint.status = !sprint.status;
    req.body.explanation && (sprint.explanation = req.body.explanation);

    await sprint.save();
    let project = await Project.findOne({ sprints: req.params.id });
    console.log("srint status changed");
    res.redirect(303, `/mob/mobprjspr/${project.crypt}`);
    let obj = { complete_sprints_closed: 1 };
    for (let ass of sprint.tasks) {
      if (ass.taskStatus == false) {
        obj = { incomplete_sprints_closed: 1 };
      }
    }
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: obj }
    );
  } catch (error) {
    console.log(error);
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
      return res.redirect(303, "/props/all/likes");
    }

    prop.likes.unshift({ user: req.user.id });
    await Prop.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { likeCount: 1 } }
    );
    await prop.save();
    return res.json({ msg: "let it end please" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//add sprint to project found by crypt
router.post("/sprints/new/:crypt", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .select("sprints crypt tags");
    if (!project) {
      return res
        .status(404)
        .json({ msg: "Не найдено проекта с указанным шифром" });
    }
    let tags;
    if (req.body.tasks) {
      tags = req.body.tags.filter((tag) => tag != null);
    } else {
      tags = [];
    }

    sprint = new Sprint({
      title: req.body.title,
      dateOpen: Date.now(),
      description: req.body.description,
      dateClosePlan: req.body.date,
      tasks: req.body.tasks ? req.body.tasks : [],
      creator: req.user.id,
      tags: tags,
      project: project,
    });
    await sprint.save();
    await project.sprints.unshift(sprint._id);

    if (!Array.isArray(project.tags)) {
      project.tags = [];
    }
    //check if project.tags includes tags from sprint
    let dupe_array = project.tags.concat(tags);
    project.tags = [...new Set(dupe_array)];

    await project.save();
    console.log("sprint added to project");
    res.json({ sprint: sprint });
    let d = new Date();
    await Stat.findOneAndUpdate(
      {
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      { $inc: { sprints_created: 1 } }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

module.exports = router;
