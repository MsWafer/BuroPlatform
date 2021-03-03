const express = require("express");
const router = express.Router();
const { check, validationResult, Result } = require("express-validator");
const auth = require("../middleware/auth");
const manauth = require("../middleware/manauth");
const fetch = require("node-fetch");

const CryptoJS = require("crypto-js");

const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const User = require("../models/User");
const rcprojcreate = require("../middleware/rcprojcreate");
const rckickprj = require("../middleware/rckickprj");
const rcinvprj = require("../middleware/rcinvprj");
const { response } = require("express");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/usr/src/app/public/covers");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "-" + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Разрешенны только .jpg, .png, .jpeg"));
    }
  },
});

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
      offTitle,
      cusStorage,
      schedule,
      userid2,
    } = req.body;

    if (!dateStart) {
      dateStart = Date.now();
    }

    try {
      let count = await Project.find().select("crypt");
      let govno2 = count
        .map((mocha) => (mocha.crypt = Number(mocha.crypt)))
        .sort((a, b) => {
          return a - b;
        });
      let crypt = Number(govno2[govno2.length - 1]) + 1;
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
        offTitle,
        cusStorage,
        schedule,
        tags: [type],
      });

      await project.save();
      if (userid2.length == 0) {
        console.log(`Проект ${crypt} добавлен`);
        return res.status(200).json({
          project: project,
          msg: `Проект ${title} добавлен`,
        });
      }

      await Project.findOneAndUpdate(
        { crypt: crypt },
        { $addToSet: { team2: { $each: userid2 } } }
      );
      project = await Project.findOne({ crypt: crypt });
      console.log(userid2);
      let govno = async (project, user) => {
        rcinvprj(project, user), user.projects.push(project._id);
      };
      userid = [];
      await userid2.map((user) => {
        userid.push(user.user);
      });
      console.log("huy2");
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
      .populate("team", "-projects -password -permission -avatar -tickets -__v")
      .populate(
        "team2",
        "-projects -password -permission -avatar -tickets -__v"
      )
      .populate("sprints");
    let que = req.query.field;
    let order;
    if (req.query.order == "true") {
      order = 1;
    } else {
      order = -1;
    }
    Array.prototype.sortBy = (query) => {
      return projects.slice(0).sort(function (a, b) {
        return a[query] > b[query] ? order : a[query] < b[query] ? -order : 0;
      });
    };

    console.log("GET all projects");
    return res.json(projects.sortBy(que));
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ err: "server error" });
  }
});

//specific query
router.get("/q/search", auth, async (req, res) => {
  try {
    if (!req.query.field || !req.query.value) {
      let prj = await Project.find().sort({ title: 1 });
      return res.json(prj);
    }
    let qObj = {};
    qObj[req.query.field] = req.query.value;
    let prj = await Project.find(qObj).sort({ title: 1 });
    if (!prj) {
      return res.status(404).json({ err: "Проекты не найдены" });
    }
    return res.json(prj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find project by crypt/title
router.get("/:auth", async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.auth })
      .populate("team", "-projects -password -permission -tickets -__v")
      .populate("team2.user", "-projects -password -permission -tickets -__v")
      .populate({
        path: "sprints",
        populate: { path: "creator" },
        populate: { path: "tasks.user" },
      });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    if (project.team2.length == 0) {
      let mocha = [];
      let govno = {};
      await project.team.map((user) => {
        (govno = { position: "Работяга", task: "Работать", user: user._id }),
          mocha.push(govno);
      });
      project.team2 = mocha;
      await project.save();
    }
    console.log("found project by crypt");
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get all user's projects
router.get("/user/:id", auth, async (req, res) => {
  try {
    let projects = await Project.find({ team: req.params.id })
      .sort({ date: -1 })
      .populate("team", "-projects -password -avatar -permission -tickets -__v")
      .populate(
        "team2",
        "-projects -password -avatar -permission -tickets -__v"
      )
      .populate("sprints");

    console.log(`found projects of user ${req.params.id}`);
    return res.json(projects);
  } catch (err) {
    console.error(err.messsage);
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
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
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
      offTitle,
      schedule,
      cusStorage,
    } = req.body;
    project.title = title;
    project.dateStart = dateStart;
    project.dateFinish = dateFinish;
    project.status = status;
    project.city = city;
    project.type = type;
    project.stage = stage;
    project.area = area;
    project.customer = customer;
    project.about = about;
    project.par = par;
    project.offTitle = offTitle;
    project.schedule = schedule;
    project.cusStorage = cusStorage;
    await project.save();

    console.log(`project ${req.params.crypt} edited`);
    return res.json(project);
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
    project.status = !project.status;
    await project.save();
    console.log("project status changed");
    return res.json({ msg: `Статус проекта изменен` });
  } catch (error) {
    console.log(error);
    return res.json({ err: "server error" });
  }
});

//add/remove user to/from project's team
router.put("/updteam/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let user = await User.findOne({ _id: req.body.user });
    if (!user) {
      return res.status(404).json({ err: "Пользователь не найден" });
    }
    let check = project.team2.filter((mate) => mate.user == req.body.user);
    if (check.length > 0) {
      project.team2 = project2.filter((user) => user.user != check[0].user);
      user.projects.filter((user_project) => user_project != project._id);
    } else {
      userObj = {
        user: req.body.user,
        position: req.body.position,
        task: req.body.task,
        fullname: user.fullname,
      };
      project.team2.push(userObj);
      user.projects.push(project._id);
    }
    await user.save();
    await project.save();
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
      "-password -permission"
    );
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let user = await User.findOne({ _id: req.user.id });
    let msg;
    let member_object;

    let team_check = project.team2.filter(
      (userObj) => userObj.user._id.toString() === user._id.toString()
    );

    console.log(team_check.length);
    if (team_check.length == 0) {
      //join team
      member_object = {
        position: req.body.position,
        task: req.body.task,
        user: req.user.id,
      };
      project.team2.push(member_object);
      user.projects.push(project._id);
      await project.save();
      await user.save();
      if (project.rocketchat) {
        await rcinvprj(project, user);
      }
      msg = "Вы вступили в команду проекта";
    } else {
      //leave team
      await Project.findOneAndUpdate(
        { crypt: req.params.crypt },
        { $pull: { team2: team_check[0] } }
      );
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $pull: { projects: project._id } }
      );
      if (project.rocketchat) {
        await rckickprj(project, user);
      }
      msg = "Вы вышли из команды проекта";
    }
    project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team2.user",
      "-password -permission"
    );
    return res.json({ project: project, msg: msg });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit user's role and task in team
router.put("/roleedit/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt }).populate(
      "team2.user",
      "-password -permission"
    );
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let users = await project.team2.filter((user) => {
      user.user == req.body.id;
    });
    let ind = project.team2.indexOf(users[0]);
    project.team2[ind].position = req.body.position;
    project.team2[ind].task = req.body.task;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
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

//add cover
router.put("/cover/:crypt", auth, upload.single("file"), async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt })
      .populate("sprints")
      .populate("team", "-password -permission");
    if (!project) {
      return response.status(404).json({ err: "Проект не найден" });
    }
    project.cover = req.file ? "covers/" + req.file.filename : project.cover;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add/edit budget
router.put("/budget/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let budget = CryptoJS.AES.encrypt(
      req.body.budget,
      process.env.encKey
    ).toString(CryptoJS.enc.Utf8);
    project.budget = budget;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get budget
router.get("/budget/:crypt", manauth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.params.crypt }).select(
      "budget"
    );
    let budget = CryptoJS.AES.decrypt(
      project.budget,
      process.env.encKey
    ).toString(CryptoJS.enc.Utf8);
    return res.json(budget);
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
      creator: req.user.id,
      tags: req.body.tags,
    });
    await sprint.save();
    await Project.findOneAndUpdate(
      { crypt: req.params.crypt },
      {
        $push: { sprints: sprint._id, $position: 0, tags: req.body.tags },
      }
    );
    console.log("sprint added to project");
    return res.json(sprint);
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

//add description
router.put("/sprints/description/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user", "-password -permission")
      .populate("creator", "-password -permission");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    sprint.description = req.body.description;
    await sprint.save();
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//find all project's sprints
router.get("/sprints/:crypt", auth, async (req, res) => {
  try {
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
    sprint.status = !sprint.status;
    await sprint.save();
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
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user", "-password -permission")
      .populate("creator", "-password -permission");
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
    let user = await User.findOne({ _id: req.user.id }).select("sprints");
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let msg;
    if (user.sprints.includes(req.params.id)) {
      //unfavorite
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $pull: { sprints: req.params.id } }
      );
      console.log(`user unfavorited sprint`);
      msg = "Вы убрали спринт из избранных";
    } else {
      //favorite
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { sprints: req.params.id } }
      );
      console.log(`user favorited sprint`);
      msg = "Вы добавили спринт в избранные";
    }
    return res.json({ msg: msg });
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

//add tags to sprint
router.put("/sprints/addtag/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id })
      .populate("tasks.user", "-password -permission")
      .populate("creator", "-password -permission");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    sprint.tags = req.body.tags;
    await sprint.save();
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//get sprints by tags
router.get("/sprint/tags", auth, async (req, res) => {
  try {
    let sprints = await Sprint.find({ tags: { $all: req.body.tags } })
      .populate("creator", "-password -permission")
      .populate("tasks.user", "-password -permission");
    return res.json(sprints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

/////////TASKS//////////

//get tasks
router.get("/sprints/gettasks/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id }).select("tasks");
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add single task to sprint
router.post("/sprints/task/:id", auth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    if (req.body.taskTitle === "") {
      return res.status(400).json({ err: "Введите задачу" });
    }
    sprint.tasks.push({
      taskState: req.body.taskState,
      taskTitle: req.body.taskTitle,
      workVolume: req.body.workVolume,
    });
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//add user to task
router.put("/sprints/task/adduser/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    let task = sprint.tasks.filter((task) => task._id == req.body.taskid);
    let ind = sprint.tasks.indexOf(task[0]);
    sprint.tasks[ind].user = req.body.userid;
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    return res.json(sprint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

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
    if (typeof req.body.tasks == Array) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { tasks: { $each: req.body.tasks, $position: 0 } } },
        { multi: true }
      );
    }
    if (typeof req.body.tasks == Object) {
      await Sprint.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { tasks: req.body.tasks } }
      );
    }

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
    await Sprint.populate(sprint, "tasks.user");
    return res.json({ msg: `Таск изменен`, sprint: sprint });
  } catch (error) {
    console.error(error);
    return res.json({ msg: "server error" });
  }
});

//delete task
router.put("/sprints/deltask/:id", manauth, async (req, res) => {
  try {
    let sprint = await Sprint.findOne({ _id: req.params.id });
    if (!sprint) {
      return res.status(404).json({ err: "Спринт не найден" });
    }
    sprint.tasks = sprint.tasks.filter((task) => task._id != req.body.taskid);
    await sprint.save();
    await Sprint.populate(sprint, "tasks.user");
    console.log("task deleted");
    return res.json({ msg: "Задача удалена", sprint: sprint });
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

//find tags
router.get("/tag/find", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    function regexEscape(str) {
      return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    let regex = new RegExp(regexEscape(req.query.tag), "g");
    let tags = project.tags.filter((tag) => tag.match(regex));
    return res.json(tags);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
