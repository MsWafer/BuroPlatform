const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const fetch = require("node-fetch");


const Project = require("../models/Project");
const manauth = require("../middleware/manauth");
const { response } = require("express");

//project stage change add
router.post("/stagechange", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.body.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    project.stageChange.push({
      status: 0,
      oldStage: req.body.old,
      nextStage: req.body.new,
      datePlan: req.body.date,
    });
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//stage change complete
router.put("/stagechange/complete", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let a = project.stageChange.filter((el) => el._id == req.query.id)[0];
    if (a == undefined) {
      return res.json({ err: "Айдишники проебались" });
    }
    a.status == 0
      ? ((a.status = 1),
        ((project.stage = a.nextStage), (a.dateFact = new Date())))
      : ((a.status = 0), ((project.stage = a.oldStage), (a.dateFact = null)));
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//stage change delay
router.put("/stagechange/delay", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let a = project.stageChange.filter((el) => el._id == req.query.id)[0];
    if (a == undefined) {
      return res.json({ err: "Айдишники проебались" });
    }
    a.status = 2;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//edit status change
router.put("/stagechange/edit", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let a = project.stageChange.filter((el) => el._id == req.query.id)[0];
    if (a == undefined) {
      return res.json({ err: "Айдишники проебались" });
    }
    let keys = Object.keys(req.body);
    for (let key of keys) {
      a[key] = req.body[key];
    }
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

///////////////////////////////////////////////
//////////////////////EBIC/////////////////////
///////////////////////////////////////////////

//add new epic
router.post("/epic", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.body.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    project.epics.push({
      title: req.body.title,
      description: req.body.description,
      datePlan: req.body.date,
    });
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//complete epic
router.put("/epic/finish", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.query.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let epic = project.epics.filter((el) => el._id == req.query.id)[0];
    if (epic == undefined) {
      return res.json({ err: "хуйня с айдишниками" });
    }
    epic.status == 0 ? epic.status == 1 : epic.status == 0;
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

//delay epic
router.put("/epic/delay", auth, async (req, res) => {
  try {
    let project = await Project.findOne({ crypt: req.body.crypt });
    if (!project) {
      return res.status(404).json({ err: "Проект не найден" });
    }
    let epic = project.epics.filter((el) => el._id == req.body.id)[0];
    if (epic == undefined) {
      return res.json({ err: "хуйня с айдишниками" });
    }
    if (req.body.all) {
      let dateIncrease = req.body.date - epic.datePlan;
      for (let el of project.epics) {
        if (el.datePlan >= epic.datePlan) {
          el.datePlan += dateIncrease;
        }
      }
    } else {
      epic.datePlan = req.body.date;
    }
    await project.save();
    return res.json(project);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "server error" });
  }
});

module.exports = router;
