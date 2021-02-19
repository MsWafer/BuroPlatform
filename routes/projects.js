const express = require("express");
const router = express.Router();
const { check, validationResult, Result } = require("express-validator");
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const fetch = require("node-fetch");

const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const User = require("../models/User");
const rcprojcreate = require("../middleware/rcprojcreate");
const rckickprj = require("../middleware/rckickprj");
const rcinvprj = require("../middleware/rcinvprj");

//add new project
router.post(
  "/add",
  auth,
  [
    check("title", "Введите название проекта").not().isEmpty(),
    check("city", "Введите город").not().isEmpty(),
    check("type", "Выберите тип проекта").not().isEmpty(),
    check("stage", "Выберите этап строительства").not().isEmpty(),
    check("par", "Выберите раздел").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array() });
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
      par,
      rcheck,
      userid,
    } = req.body;

    if (!dateStart) {
      dateStart = Date.now();
    }

    try {
      let count = await Project.find().select("crypt");
      console.log(count)
      let govno = count.map(mocha=>mocha.crypt=Number(mocha.crypt)).sort((a,b)=>{return a.crypt - b.crypt})
      let crypt = Number(govno[govno.length -1].crypt) + 1;
      function pad(crypt) {
        return crypt < 10 ? "0" + crypt.toString() : crypt.toString();
      }

      let pepo = pad(crypt) + stage.slice(0, 1) + "-" + par;
      let crypter = `${dateStart.toString().slice(0, 4)}-${pad(
        crypt
      )}${stage.slice(0, 1)}-${par}`;
      let rocketchat;

      if (rcheck) {
        rocketchat = await rcprojcreate(title, rocketchat, pepo);
      }
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
        rocketchat: rocketchat ? rocketchat : null,
        par,
      });

      await project.save();

      if (!userid || userid == null || userid == undefined) {
        console.log(`Проект ${crypt} добавлен`);
        return res.status(200).json({
          project: project,
          msg: `Проект ${title} добавлен`,
        });
      }

      project = await Project.findOneAndUpdate(
        { crypt: crypt },
        { $addToSet: { team: { $each: userid } } }
      );
      let govno = async (project, user) => {
        rcinvprj(project, user), user.projects.push(project._id);
      };
      let usrs = await User.find({ _id: { $in: userid } });
      usrs.map((user) => govno(project, user));
      console.log(`Проект ${crypt} добавлен`);
      return res
        .status(200)
        .json({ project: project, msg: `Проект ${title} добавлен` });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("server error");
    }
  }
);

//find all projects
router.get("/", auth, async (req, res) => {
  try {
    let projects = await Project.find()
      .select(
        "dateStart dateFinish team sprints crypt title crypter _id status par"
      )
      .populate("team", "-projects -password -permission -avatar -tickets -__v")
      .populate("sprints");
    console.log("GET all projects");
    return res.json(projects);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ err: "server error" });
  }
});

//find project by crypt/title
router.get("/:auth", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.auth })
      .populate("team", "-projects -password -permission -tickets -__v")
      .populate("sprints");
    let projectTitle = await Project.find({ title: req.params.auth })
      .select("dateStart team sprints crypt title crypter status _id")
      .populate("team", "-projects -password -permission -tickets -__v")
      .populate("sprints");
    if (!project && !projectTitle) {
      return res.status(404).json({ err: "Проект не найден" });
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
        customer: project.customer,
        urn: project.urn,
        par: project.par,
      });
    } else if (projectTitle) {
      console.log("found projects by title");
      return res.json(projectTitle);
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: "server error" });
  }
});

//get all user's projects
router.get("/user/:id", auth, async (req, res) => {
  try {
    let projects = await Project.find({ team: req.params.id })
      .sort({ date: -1 })
      .populate("team", "-projects -password -avatar -permission -tickets -__v")
      .populate("sprints");

    console.log(`found projects of user ${req.params.id}`);
    return res.json(projects);
  } catch (err) {
    console.error(err.messsage);
    return res.status(500).json({ msg: "server error" });
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
    return res.status(500).json({ msg: "server error" });
  }
});

//delete project
router.delete("/:crypt", manauth, async (req, res) => {
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
    return res.status(500).json({ msg: "server error" });
  }
});

//edit project
router.put("/:crypt", manauth, async (req, res) => {
  try {
    let check = await Project.findOne({ crypt: req.params.crypt });
    if (!check) {
      return res.status(404).json({ err: "Проект не найден" });
    }
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
          par: req.body.par,
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
      msg: `Проект изменен`,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: "server error" });
  }
});

//finish project
router.put("/finish/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    if (project.status == false) {
      await Project.findOneAndUpdate(
        { crypt: req.params.crypt },
        { $set: { status: true } }
      );
    } else if (project.status == true) {
      await Project.findOneAndUpdate(
        { crypt: req.params.crypt },
        { $set: { status: false } }
      );
    }
    console.log("project status changed");
    return res.json({ msg: `Статус проекта изменен` });
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//add user to project's team
router.put("/updteam/:crypt", manauth, async (req, res) => {
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
    res.status(500).json({ msg: "server error" });
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

    await rcinvprj(req, res, project, user);

    res.status(200).json({
      msg: `Пользователь добавлены в команду проекта ${req.params.crypt}`,
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
  try {
    let check = await Project.findOne({ crypt: req.params.crypt });
    if (!check) {
      return res.status(404).json({ err: "Проект не найден" });
    }
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
      if (project.rocketchat) {
        await rckickprj(project, user);
      }

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "server error" });
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

    if (project.rocketchat) {
      await rcinvprj(project, user);
    }

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
    res.status(500).json({ msg: "server error" });
    return console.log("произошла якась хуйня");
  }
});

//remove user from project's team
router.delete("/updteam/:crypt", manauth, async (req, res) => {
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

//add infores
router.put("/inf/:crypt", manauth, async (req, res) => {
  try {
    let prj = await Project.findOne({ crypt: req.params.crypt });
    if (!prj) {
      return res.status(404).json({ err: "Не найден проект" });
    }
    await prj.infoRes.push(req.body.info);
    await prj.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add customer v.0.2
router.put("/cus/:crypt", manauth, async (req, res) => {
  try {
    let prj = await Project.findOne({ crypt: req.params.crypt });
    if (!prj) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    await prj.customer.push(req.body.customer);
    await prj.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

///////////////////
///////////////////
///////////////////
/////SPRINTS///////
///////////////////
///////////////////
///////////////////

//add sprint to project found by crypt
router.post("/sprints/new/:crypt", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res
        .status(404)
        .json({ msg: "Не найдено проекта с указанным шифром" });
    }
    sprint = new Sprint({
      dateOpen: Date.now(),
      description: req.body.description,
      dateClosePlan: req.body.date,
      tasks: req.body.tasks ? req.body.tasks : [],
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//add sprint description and planned closing date
router.put("/sprints/dd/:id", auth, async (req, res) => {
  try {
    let spr = await Sprint.findOne({ _id: req.params.id });
    if (!spr) {
      return res.status(404).json({ msg: "Не найден спринт с указанным id" });
    }
    await Sprint.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          dateClosePlan: req.body.date,
          description: req.body.description,
        },
      }
    );
    return res.json({ msg: `Описание спринта обновлено` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//find all project's sprints
router.get("/sprints/:crypt", auth, async (req, res) => {
  try {
    if (/[a-zA-Z]/.test(req.params.crypt)) {
      return res.json({ msg: "Неверно введен шифр" });
    }
    let project = await Project.findOne({ crypt: req.params.crypt })
      .select("sprints")
      .populate("sprints");
    if (!project) {
      return res
        .status(404)
        .json({ msg: "Не найдено проектов с указанным шифром" });
    }
    console.log("found all projects sprints");
    return res.json({
      projectid: project.id,
      sprints: project.sprints.reverse(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});

//change sprint status
router.put("/sprints/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (sprint.status == false) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: true, dateCloseFact: Date.now() } }
      );
    } else if (sprint.status == true) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: false, dateCloseFact: null } }
      );
    }
    console.log("srint status changed");
    return res.json({ msg: `Статус спринта изменен` });
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//get sprint by id
router.get("/getsprint/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    console.log("sprint found by id");
    return res.json(sprint);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

//un/favorite sprint by id
router.put("/favsprint/:id", auth, async (req, res) => {
  try {
    let huy = await User.findOne({ _id: req.user.id }).select("sprints");
    let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|sprints:/g, "");
    let huy3 = huy2.split(",");
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }

    if (huy3.includes(req.params.id)) {
      //unfavorite
      try {
        await User.findOneAndUpdate(
          { _id: req.user.id },
          { $pull: { sprints: sprint.id } }
        );

        console.log(`user unfavorited sprint`);
        return res.status(200).json({
          msg: `Вы убрали спринт из избранных`,
          user: req.user,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ err: "server error" });
      }
    } else {
      //favorite
      try {
        await User.findOneAndUpdate(
          { _id: req.user.id },
          { $push: { sprints: sprint } }
        );

        console.log(`user favorited sprint`);
        return res.status(200).json({
          msg: `Вы добавили спринт в избранные`,
          user: req.user,
        });
      } catch (error) {
        res.status(500).json({ err: "server error" });
        return console.error(error);
      }
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
    await Sprint.findOneAndRemove({ _id: req.params.id });
    console.log("sprint deleted");
    return res.json({ msg: "Спринт удален" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

/////////TASKS//////////

//add new task to sprint
router.post("/sprints/addtask/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.json({ msg: "Указанный спринт не найден" });
    }
    if (!req.body.tasks) {
      return res.json({ err: "Добавьте задачу" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
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
    return res.status(500).json({ msg: "server error" });
  }
});

//deactivate task
router.put("/sprints/DAtask/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ msg: "Спринт не найден" });
    }
    let status = sprint.tasks.filter((task) => task._id == req.body.taskid)[0]
      .taskStatus;
    await Sprint.findOneAndUpdate(
      { _id: req.params.id, "tasks._id": req.body.taskid },
      { $set: { "tasks.$.taskStatus": !status } }
    );
    console.log("task de/activated");
    return res.json({ msg: `Изменен статус задачи ${req.body.taskid}` });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit task
router.put("/sprints/taskedit/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let a = sprint.tasks.filter((task) => task._id == req.body.taskid);
    a[0].taskTitle = req.body.taskTitle;
    await sprint.save();
    return res.json({ msg: `Таск изменен`, sprint: sprint });
  } catch (error) {
    console.error(error);
    return res.json({ msg: "server error" });
  }
});

//delete task
router.delete("/sprints/deltask/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let deltask = sprint.tasks.filter((task) => task._id == req.body.taskid)[0];
    await Sprint.findOneAndUpdate(
      { _id: req.params.id, "tasks._id": req.body.taskid },
      { $pull: { tasks: deltask } }
    );
    console.log("task deleted");
    return res.json({ msg: "Задача удалена" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ err: "server error" });
  }
});

///////////////////
///////////////////
///////////////////
///////TAGS////////
///////////////////
///////////////////
///////////////////

//add tag to project
router.put("/tag/:crypt", auth, async (req, res) => {
  try {
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $push: { tags: req.body.tag } }
    );
    console.log("+tag");
    return res.json({ msg: "Тэг добавлен" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//remove tag from project
router.delete("/tag/:crypt", auth, async (req, res) => {
  try {
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      { $pull: { tags: req.body.tag } }
    );
    console.log("-tag");
    return res.json({ msg: "Тэг удален" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find by tags
router.get("/tag/search", auth, async (req, res) => {
  try {
    let projects = await Project.find({ tags: { $all: req.body.tags } });
    if (!projects) {
      return res
        .status(404)
        .json({ err: "Проектов с указанными тэгами не найдено" });
    }
    return res.json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "server error" });
  }
});
module.exports = router;
