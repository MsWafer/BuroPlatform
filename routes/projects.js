const { response } = require('express');
const express = require('express');
const router = express.Router();
const{check, validationResult, Result} = require('express-validator');
const auth = require ('../middleware/auth');

const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const User = require('../models/User');

//add new project
router.post ('/add', auth, [
    check('title', 'Введите название проекта').not().isEmpty(),
    check('dateStart', 'Введите дату говна').isDate(),
    check('city', 'Введите город').not().isEmpty(),
    check('type', 'Выберите тип проекта').not().isEmpty(),
    check('stage', 'Выберите этап мочи').not().isEmpty()
    ], async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    };
    
    let { title, dateStart, dateFinish, city, type, stage, area, customer, about, status, userid } = req.body;

    try{
        function getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;};
        let crypts =[];
        let projects = await Project.find().select('crypt');
        projects.map(project123 => crypts.push(project123.crypt));

        if(crypts.length==8999){
            console.log('Места нет, пизда')
            return res.status(400).json({err:'Закончились свободные шифры, въебите бекендеру'})
        }

        const promise = () =>  new Promise((resolve) => {
            crypt = getRndInteger(1000,10000).toString();
            if(crypts.includes(crypt)){resolve(promise())};
        });

        promise()
        
        let crypter = `${dateStart}-${crypt}-${title}`

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
        let arr = userid.split(',')
        // console.log(arr)
        // return
        let newProject = await Project.findOneAndUpdate({crypt:crypt},{ $addToSet: { team: { $each: arr } } })
        await User.updateMany({'_id':{$in:arr}},{$push:{projects:newProject}},{multi:true})
        console.log(`Проект ${crypt} добавлен`)
        return res.status(200).json({crypter});
    } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
    }
    
});

//find all projects
router.get('/', async (req,res) => {
    try {
        let projects = await Project.find().select('dateStart team sprints crypt title crypter _id status').populate('team','-projects -password -permission -tickets -__v').populate('sprints');
        res.json(projects)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }

    
});

//find project by crypt/title
router.get('/:auth', async(req,res) => {
    try {
        let project = await Project.findOne({crypt: req.params.auth}).populate('team','-projects -password -permission -tickets -__v').populate('sprints');
        let projectTitle = await Project.find({title: req.params.auth}).select('dateStart team sprints crypt title crypter status _id').populate('team','-projects -password -permission -tickets -__v').populate('sprints');
        console.log(project.team)
        if(!project && !projectTitle) {
            return res.status(400).json({msg: "Проект не найден"})
        } else if (project) {
            res.json({
                title: project.title,
                crypt: project.crypt,
                dateStart: project.dateStart,
                dateFinish: project.dateFinish,
                city: project.city,
                type: project.type,
                stage: project.stage,
                area: project.area,
                team: project.team?project.team:[],
                sprints: project.sprints?project.sprints:[],
                about:project.about,
                status:project.status
            });
        } else if (projectTitle) {
            res.json(projectTitle);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error')
    }
});

//get all user's projects
router.get('/user/:id', async(req,res) => {
    try {
    let projects = await Project.find({team: req.params.id})
    .sort({date: -1})
    .select('-__v')
    .populate('team','-projects -password -permission -tickets -__v')
    .populate('sprints');

    res.json(projects);
    } catch (err) {
    console.error(err.messsage);
    res.status(500).send('server error');
    }
    });

//find projects by city
router.get('/city/:city',async (req,res) => {
    try {
        let projects = await Project.find({city: req.params.city}).select('dateStart team sprints crypt title crypter status _id').populate('team','-projects -password -permission -tickets -__v').populate('sprints');
        res.json(projects)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//delete project
router.delete('/:crypt', auth, async(req,res) => {
    try {
        let project = await Project.findOne({crypt: req.params.crypt}).populate('team');
        if(!project) {
            return res.status(404).json('Проект не найден')
        };
        await User.updateMany({projects:project.id},{$pull:{projects:project.id}},{multi:true})
        await project.remove();
        res.json({msg:`Проект удален`});
    }catch(err) {
        console.error(err.message);
        res.status(500).send('server error');
    };
});

//edit project
router.put("/:crypt", auth, async (req, res) => {
    let project1 = await Project.findOne({crypt: req.params.crypt})
    try {
        await Project.findOneAndUpdate({crypt: req.params.crypt}, 
            {$set: {
                title:req.body.title?req.body.title:project1.title, 
                dateStart:req.body.dateStart?req.body.dateStart:project1.dateStart, 
                dateFinish:req.body.dateFinish?req.body.dateFinish:project1.dateFinish, 
                city:req.body.city?req.body.city:project1.city,
                type:req.body.type?req.body.type:project1.type,
                stage:req.body.stage?req.body.stage:project1.stage,
                area:req.body.area?req.body.area:project1.area,
                customer:req.body.customer?req.body.customer:project1.customer,
                about:req.body.about?req.body.about:project1.about,
                status:req.body.status?req.body.status:project1.status,
            }})

            let editedProject = await Project.findOne({crypt: req.params.crypt})
        res.json({
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
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
});

//add user to project's team
router.put('/updteam/:crypt', auth, async(req,res)=>{
    try{
        let usercheck = await User.findOne({_id:req.body.userid})
        if(!usercheck)
        {return res.status(400).json({msg:`Не найден пользователь с указанным _id`})};
    }catch(err){
        if(err.kind == 'ObjectId') {
            return res.status(400).json({msg:'Не найден пользователь с указанным _id'});
        }
        res.status(500).send('server error');
    }
    let huy = await Project.findOne({crypt:req.params.crypt}).select('-_id team');
    let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|team:/g,'')
    let huy3 = huy2.split(',')
    if(huy3.includes(req.body.userid)){return res.status(400).json({msg:`Данный пользователь уже находится в команде проекта`})};

    try {
        let user = await User.findById(req.body.userid).select('-password -permission');
        await Project.findOneAndUpdate({crypt: req.params.crypt},{$push: {team: user}});
        let project = await Project.findOne({crypt: req.params.crypt});
        await User.findOneAndUpdate({_id:req.body.userid},{$push: {projects: project}});

        res.status(200).json({msg:`${user.name} добавлен в команду проекта ${req.params.crypt}`})
        console.log(`${user.name} добавлен в команду проекта ${req.params.crypt}`)
    } catch (error) {
    res.status(400).send(`server error`)
    console.log('произошла якась хуйня')
}})

//remove user from project's team
router.delete('/updteam/:crypt', auth, async(req,res)=>{
    try{
        let usercheck = await User.findOne({_id:req.body.userid})
        if(!usercheck)
        {return res.status(400).json({msg:`Не найден пользователь с указанным _id`})};
    }catch(err){
        if(err.kind == 'ObjectId') {
            return res.status(400).json({msg:'Не найден пользователь с указанным _id'});
        }
        res.status(500).send('server error');
    }
        let huy = await Project.findOne({crypt:req.params.crypt}).select('-_id team');
        console.log(huy.team)
        if(huy.team.length == 0){return res.status(400).json({msg:`В команде проекта нет пользователей`})};
        let huy2 = huy.toString().replace(/{|}|_id:|\n|]| |\[|team:/g,'')
        let huy3 = huy2.split(',')
        if(!huy3.includes(req.body.userid)){return res.status(400).json({msg:`Данный пользователь не находится в команде проекта`})};

    try {
        let user = await User.findById(req.body.userid).select('-password -permission');
        await Project.findOneAndUpdate({crypt: req.params.crypt},{$pull: {team: user.id}});
        let project = await Project.findOne({crypt: req.params.crypt});
        await User.findOneAndUpdate({_id:req.body.userid},{$pull: {projects: project.id}});

        res.status(200).json({msg:`${user.name} удален из команды проекта ${req.params.crypt}`})
        console.log(`${user.name} удален из команды проекта ${req.params.crypt}`)
    } catch (error) {
    res.status(400).send(`server error`)
    console.log('произошла якась хуйня')
}})

//add sprint to project found by crypt
router.post('/sprints/new/:crypt', auth, async(req,res)=>{
    let project = await Project.findOne({crypt: req.params.crypt})
    if(!project){return res.json({msg:"Не найдено проекта с указанным шифром"})}
    sprint = new Sprint()
    await sprint.save()
    await Project.findOneAndUpdate({crypt: req.params.crypt},{$push:{sprints:sprint}})
    res.json({msg:`Новый спринт добавлен в проект`})
})

//add new task to sprint
router.post('/sprints/addtask/:id',auth,async(req,res)=>{
    let sprint = await Sprint.findOne({_id:req.params.id})
    if(!sprint){return res.json({msg:"Указанный спринт не найден"})}
    try {
        let task = {
            taskTitle:req.body.taskTitle, 
            workVolume:req.body.workVolume, 
            taskStatus:false
        }
        console.log(task[1])
        await Sprint.findOneAndUpdate({_id:req.params.id}, {$push:{tasks:task}})
        res.json({msg:'Задача добавлена'})
    } catch (error) {
        console.log(error)
        return res.status(400).json({msg:'server error'})
    }
})

//deactivate task
router.put('/sprints/DAtask/:id',auth,async(req,res)=>{
    try {
        await Sprint.findOneAndUpdate({_id:req.params.id, "tasks._id":req.body.taskid},{$set:{"tasks.$.taskStatus" : true}})
        console.log('task deactivated')
        let sprint = await Sprint.findOne({_id:req.params.id, "tasks.status":false})
        if(!sprint){await Sprint.findOneAndUpdate({_id:req.params.id}, {$set:{status:true}})}
        return res.json({msg:"Задача выполнена"})
    } catch (error) {
        console.log(error)
        return res.json({err:"server error"})
    }
})

//deactivate sprint
router.put('/sprints/:id', auth, async(req,res)=>{
    try {
        await Sprint.findOneAndUpdate({_id:req.params.id},{$set:{status:true}})
    } catch (error) {
        console.log(error)
        return res.json({err:"server error"})
    }
})

module.exports = router;