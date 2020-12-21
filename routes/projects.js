const express = require("express");
const router = express.Router();
const { check, validationResult, Result } = require("express-validator");
const auth = require("../middleware/auth");

const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const User = require("../models/User");

//add new project
router.post(
  "/add",
  auth,
  [
    check("title", "Введите название проекта").not().isEmpty(),
    check("dateStart", "Введите дату говна").isDate(),
    check("city", "Введите город").not().isEmpty(),
    check("type", "Выберите тип проекта").not().isEmpty(),
    check("stage", "Выберите этап мочи").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {
      title,
      dateStart,
      dateFinish,
      city,
      type,
      stage,
      area,
      customer,
      about,
      status,
      userid,
    } = req.body;

    try {
      function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
      }
      let crypts = [];
      let projects = await Project.find().select("crypt");
      projects.map((project123) => crypts.push(project123.crypt));

      if (crypts.length == 8999) {
        console.log("Места нет, пизда");
        return res
          .status(400)
          .json({ err: "Закончились свободные шифры, въебите бекендеру" });
      }

      const promise = () =>
        new Promise((resolve) => {
          crypt = getRndInteger(1000, 10000).toString();
          if (crypts.includes(crypt)) {
            resolve(promise());
          }
        });

      promise();

      let crypter = `${dateStart}-${crypt}-${title}`;

      project = new Project({
        crypt,
        title,
        dateStart,
        dateFinish,
        city,
        type,
        stage,
        area,
        customer,
        crypter,
        about,
        status,
      });

      await project.save();
      if (!userid || userid == null || userid == undefined) {
        console.log(`Проект ${crypt} добавлен`);
        return res.status(200).json({
          crypter: project.crypter,
          title: project.title,
          crypt: project.crypt,
          dateStart: project.dateStart,
          dateFinish: project.dateFinish,
          city: project.city,
          type: project.type,
          stage: project.stage,
          area: project.area,
          about: project.about,
          status: project.status,
        });
      }

      let newProject = await Project.findOneAndUpdate(
        { crypt: crypt },
        { $addToSet: { team: { $each: userid } } }
      );
      await User.updateMany(
        { _id: { $in: userid } },
        { $push: { projects: newProject } },
        { multi: true }
      );
      console.log(`Проект ${crypt} добавлен`);
      return res.status(200).json({
        title: newProject.title,
        crypt: newProject.crypt,
        dateStart: newProject.dateStart,
        dateFinish: newProject.dateFinish,
        city: newProject.city,
        type: newProject.type,
        stage: newProject.stage,
        area: newProject.area,
        team: newProject.team ? project.team : [],
        about: newProject.about,
        status: newProject.status,
        crypter: newProject.crypter,
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("server error");
    }
  }
);

//find all projects
router.get("/", async (req, res) => {
  try {
    let projects = await Project.find()
      .select(
        "dateStart dateFinish team sprints crypt title crypter _id status"
      )
      .populate("team", "-projects -password -permission -avatar -tickets -__v")
      .populate("sprints");
    console.log("GET all projects");
    return res.json(projects);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

//find project by crypt/title
router.get("/:auth", async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.auth })
      .populate("team", "-projects -password -permission -avatar -tickets -__v")
      .populate("sprints");
    let projectTitle = await Project.find({ title: req.params.auth })
      .select("dateStart team sprints crypt title crypter status _id")
      .populate("team", "-projects -password -avatar -permission -tickets -__v")
      .populate("sprints");
    if (!project && !projectTitle) {
      console.log("no projects found");
      return res.status(400).json({ msg: "Проект не найден" });
    } else if (project) {
      console.log("found project by crypt");
      return res.json({
        title: project.title,
        crypt: project.crypt,
        dateStart: project.dateStart,
        dateFinish: project.dateFinish,
        city: project.city,
        type: project.type,
        stage: project.stage,
        area: project.area,
        team: project.team ? project.team : [],
        sprints: project.sprints ? project.sprints : [],
        about: project.about,
        status: project.status,
        crypter: project.crypter,
      });
    } else if (projectTitle) {
      console.log("found projects by title");
      return res.json(projectTitle);
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

//get all user's projects
router.get("/user/:id", async (req, res) => {
  try {
    let projects = await Project.find({ team: req.params.id })
      .sort({ date: -1 })
      .select("-__v")
      .populate("team", "-projects -password -avatar -permission -tickets -__v")
      .populate("sprints");

    console.log(`found projects of user ${req.params.id}`);
    return res.json(projects);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).send("server error");
  }
});

//find projects by city
router.get("/city/:city", async (req, res) => {
  try {
    let projects = await Project.find({ city: req.params.city })
      .select("dateStart team sprints crypt title crypter status _id")
      .populate("team", "-projects -password -avatar -permission -tickets -__v")
      .populate("sprints");
    console.log("found projects by city");
    return res.json(projects);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

//delete project
router.delete("/:crypt", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team"
    );
    if (!project) {
      return res.status(404).json("Проект не найден");
    }
    await User.updateMany(
      { projects: project.id },
      { $pull: { projects: project.id } },
      { multi: true }
    );
    await project.remove();
    console.log(`project ${req.params.crypt} deleted`);
    return res.json({ msg: `Проект удален` });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

//edit project
router.put("/:crypt", auth, async (req, res) => {
  try {
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      {
        $set: {
          title: req.body.title,
          dateStart: req.body.dateStart,
          dateFinish: req.body.dateFinish,
          city: req.body.city,
          type: req.body.type,
          stage: req.body.stage,
          area: req.body.area,
          customer: req.body.customer,
          about: req.body.about,
          status: req.body.status,
          about: req.body.about,
        },
      }
    );

    let editedProject = await Project.findOne({ crypt: req.params.crypt })
      .populate("team", "-password -permission -avatar")
      .populate("sprints");
    console.log(`project ${req.params.crypt} edited`);
    return res.json({
      id: editedProject.id,
      title: editedProject.title,
      crypt: editedProject.crypt,
      dateStart: editedProject.dateStart,
      dateFinish: editedProject.dateFinish,
      city: editedProject.city,
      type: editedProject.type,
      stage: editedProject.stage,
      area: editedProject.area,
      customer: editedProject.customer,
      crypter: editedProject.crypter,
      about: editedProject.about,
      status: editedProject.status,
      about: editedProject.about,
      projects: editedProject.projects,
      sprints: editedProject.sprints,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("server error");
  }
});

//add user to project's team
router.put("/updteam/:crypt", auth, async (req, res) => {
  try {
    let usercheck = await User.findOne({ _id: req.body.userid }).select(
      "-password -permission -avatar"
    );
    if (!usercheck) {
      return res
        .status(400)
        .json({ msg: `Не найден пользователь с указанным _id` });
    }
  } catch (err) {
    if (err.kind == "ObjectId") {
      return res
        .status(400)
        .json({ msg: "Не найден пользователь с указанным _id" });
    }
    res.status(500).send("server error");
  }
  let huy = await Project.findOne({ crypt: req.params.crypt }).select(
    "-_id team"
  );
  let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|team:/g, "");
  let huy3 = huy2.split(",");
  if (huy3.includes(req.body.userid)) {
    return res
      .status(400)
      .json({ msg: `Данный пользователь уже находится в команде проекта` });
  }

  try {
    let user = await User.findById(req.body.userid).select(
      "-password -permission -avatar"
    );
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $push: { team: user } }
    );
    let project = await Project.findOne({ crypt: req.params.crypt });
    await User.findOneAndUpdate(
      { _id: req.body.userid },
      { $push: { projects: project } }
    );

    res.status(200).json({
      msg: `Пользователи добавлены в команду проекта ${req.params.crypt}`,
      crypter: project.crypter,
      title: project.title,
      crypt: project.crypt,
      dateStart: project.dateStart,
      dateFinish: project.dateFinish,
      city: project.city,
      type: project.type,
      stage: project.stage,
      area: project.area,
      about: project.about,
      status: project.status,
      team: project.team,
    });
    return console.log(
      `Пользователи добавлены в команду проекта ${req.params.crypt}`
    );
  } catch (error) {
    res.status(400).send(`server error`);
    return console.log("произошла якась хуйня");
  }
});

//join project's team
router.put("/jointeam/:crypt", auth, async (req, res) => {
  let huy = await Project.findOne({ crypt: req.params.crypt }).select(
    "-_id team"
  );
  let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|team:/g, "");
  let huy3 = huy2.split(",");
  if (huy3.includes(req.user.id)) {
    let user = await User.findOne({ _id: req.user.id }).select(
      "-password -permission -avatar"
    );
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $pull: { team: user.id } }
    );
    let project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team",
      "-password -permission -tickets -projects"
    );
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { projects: project.id } }
    );

    res.status(200).json({
      msg: `Вы вышли из команды проекта ${req.params.crypt}`,
      crypter: project.crypter,
      title: project.title,
      crypt: project.crypt,
      dateStart: project.dateStart,
      dateFinish: project.dateFinish,
      city: project.city,
      type: project.type,
      stage: project.stage,
      area: project.area,
      about: project.about,
      status: project.status,
      team: project.team,
    });
    return console.log(
      `${user.name} удален из команды проекта ${req.params.crypt}`
    );
  }

  try {
    let user = await User.findOne({ _id: req.user.id }).select(
      "-password -permission"
    );
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $push: { team: user } }
    );
    let project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team",
      "-password -permission -tickets -projects"
    );
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { projects: project } }
    );

    res.status(200).json({
      msg: `Вы были добавлены в команду проекта ${req.params.crypt}`,
      crypter: project.crypter,
      title: project.title,
      crypt: project.crypt,
      dateStart: project.dateStart,
      dateFinish: project.dateFinish,
      city: project.city,
      type: project.type,
      stage: project.stage,
      area: project.area,
      about: project.about,
      status: project.status,
      team: project.team,
    });
    return console.log(
      `Пользователь добавлен в команду проекта ${req.params.crypt}`
    );
  } catch (error) {
    res.status(400).send(`server error`);
    return console.log("произошла якась хуйня");
  }
});

//remove user from project's team
router.delete("/updteam/:crypt", auth, async (req, res) => {
  try {
    let usercheck = await User.findOne({ _id: req.body.userid }).select(
      "-password -avatar -permission"
    );
    if (!usercheck) {
      return res
        .status(400)
        .json({ msg: `Не найден пользователь с указанным _id` });
    }
  } catch (err) {
    if (err.kind == "ObjectId") {
      return res
        .status(400)
        .json({ msg: "Не найден пользователь с указанным _id" });
    }
    res.status(500).send("server error");
  }
  let huy = await Project.findOne({ crypt: req.params.crypt }).select(
    "-_id team"
  );
  if (huy.team.length == 0) {
    return res.status(400).json({ msg: `В команде проекта нет пользователей` });
  }
  let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|team:/g, "");
  let huy3 = huy2.split(",");
  if (!huy3.includes(req.body.userid)) {
    console.log("user not in projects team ");
    return res
      .status(400)
      .json({ msg: `Данный пользователь не находится в команде проекта` });
  }

  try {
    let user = await User.findById(req.body.userid).select(
      "-password -permission"
    );
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $pull: { team: user.id } }
    );
    let project = await Project.findOne({ crypt: req.params.crypt });
    await User.findOneAndUpdate(
      { _id: req.body.userid },
      { $pull: { projects: project.id } }
    );

    res.status(200).json({
      msg: `${user.name} удален из команды проекта ${req.params.crypt}`,
    });
    return console.log(
      `${user.name} удален из команды проекта ${req.params.crypt}`
    );
  } catch (error) {
    res.status(400).send(`server error`);
    console.log("произошла якась хуйня");
  }
});

//add sprint to project found by crypt
router.post("/sprints/new/:crypt", auth, async (req, res) => {
  let project = await Project.findOne({ crypt: req.params.crypt });
  if (!project) {
    return res.json({ msg: "Не найдено проекта с указанным шифром" });
  }
  sprint = new Sprint({
    dateOpen: Date.now(),
  });
  await sprint.save();
  await Project.findOneAndUpdate(
    { crypt: req.params.crypt },
    { $push: { sprints: sprint, $position: 0 } }
  );
  console.log("sprint added to project");
  return res.json({
    msg: `Новый спринт добавлен в проект`,
    id: sprint.id,
    tasks: sprint.tasks,
    state: sprint.state,
    dateOpen: sprint.dateOpen,
  });
});

//find all project's sprints
router.get("/sprints/:crypt", auth, async (req, res) => {
  let project = await Project.findOne({ crypt: req.params.crypt })
    .select("sprints")
    .populate("sprints");
  console.log("found all projects sprints");
  return res.json({
    projectid: project.id,
    sprints: project.sprints.reverse(),
  });
});

//add new task to sprint
router.post("/sprints/addtask/:id", auth, async (req, res) => {
  let sprint = await Sprint.findOne({ _id: req.params.id });
  if (!sprint) {
    return res.json({ msg: "Указанный спринт не найден" });
  }
  if (!req.body.tasks) {
    return res.json({ msg: "Добавьте задачу" });
  }
  try {
    await Sprint.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { tasks: { $each: req.body.tasks, $position: 0 } } },
      { multi: true }
    );
    console.log("new tasks added to sprint");
    res.json({ msg: "Задача добавлена" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "server error" });
  }
});

//deactivate task
router.put("/sprints/DAtask/:id", auth, async (req, res) => {
  try {
    let tasks = await Sprint.findOne({ _id: req.params.id });
    let status = tasks.tasks.filter((task) => task._id == req.body.taskid)[0]
      .taskStatus;
    await Sprint.findOneAndUpdate(
      { _id: req.params.id, "tasks._id": req.body.taskid },
      { $set: { "tasks.$.taskStatus": !status } }
    );
    console.log("task de/activated");
    return res.json({ msg: "Изменен статус задачи" });
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//change sprint status sprint
router.put("/sprints/:id", auth, async (req, res) => {
  try {
    let project = await Sprint.findOne({ _id: req.params.id });
    if (project.status == false) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: true } }
      );
    } else if (project.status == true) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: false } }
      );
    }
    console.log("srint status changed");
    return res.json({ msg: "Статус спринта изменен" });
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//get sprint by id
router.get("/getsprint/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    console.log("sprint found by id");
    return res.json(sprint);
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//un/favorite sprint by id
router.put("/favsprint/:id", auth, async (req, res) => {
  let huy = await User.findOne({ _id: req.user.id }).select("-id sprints");
  let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|sprints:/g, "");
  let huy3 = huy2.split(",");
  if (huy3.includes(req.params.id)) {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { sprints: sprint.id } }
    );

    res.status(200).json({
      msg: `Вы убрали спринт из избранных`,
      id: sprint.id,
      tasks: sprint.tasks,
      dateOpen: sprint.dateOpen,
      dateClose: sprint.dateClose,
      status: sprint.status,
    });
    return console.log(`user unfavorited sprint`);
  }

  try {
    let sprint = await Project.findOne({ _id: req.params.id });
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { sprints: sprint } }
    );

    res.status(200).json({
      msg: `Вы добавили спринт в избранные`,
      id: sprint.id,
      tasks: sprint.tasks,
      dateOpen: sprint.dateOpen,
      dateClose: sprint.dateClose,
      status: sprint.status,
    });
    return console.log(`user favorited sprint`);
  } catch (error) {
    res.status(400).send(`server error`);
    return console.log("произошла якась хуйня");
  }
});
module.exports = router;
