const express = require('express');
const router = express.Router();
const{check, validationResult, Result} = require('express-validator');
const auth = require ('../middleware/auth');

const Project = require('../models/Project');
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
    
    let { title, dateStart, dateFinish, city, type, stage, area, customer } = req.body;

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
            crypter
        });

        await project.save();
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
        // let arr =[];
        let projects = await Project.find().select('dateStart crypt title crypter -_id');
        res.json(projects)
        // await projects.map(project => arr.push(`${project.dateStart.toString().slice(4,15)}-${project.crypt}-${project.title}`))
        // if(arr.length==0){
        //     res.json({msg:'Не найдено проектов'})
        // }else{
        // res.json(arr);
        // }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }

    
});

//find project by crypt/title
router.get('/:auth', async(req,res) => {
    try {
        let project = await Project.findOne({crypt: req.params.auth}).populate('team','title projects permission');
        let projectTitle = await Project.find({title: req.params.auth});
        console.log(project.team)
        if(!project && !projectTitle) {
            return res.status(400).json({msg: "Проект не найден"})
        } else if (project) {
            // if(!project.dateFinish){finishDate=``}else{finishDate=` - ${project.dateFinish.toString().slice(4,15)}`}
            res.json({
                title: project.title,
                crypt: project.crypt,
                dateStart: project.dateStart,
                dateFinish: project.dateFinish,
                city: project.city,
                type: project.type,
                stage: project.stage,
                area: project.area,
                team: project.team
            });
        } else if (projectTitle) {
            let arr2 =[];
            projectTitle.map(project => arr2.push(`${project.dateStart.toString().slice(4,15)}-${project.crypt}-${project.title}`))
            if(arr2.length==0){
                res.json({msg:'Не найдено проектов с указанным названием'})
            }else{
            res.json(arr2);
            }
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
    .populate('team','-projects -password -permission -tickets -__v');

    res.json(projects);
    } catch (err) {
    console.error(err.messsage);
    res.status(500).send('server error');
    }
    });

//find projects by city
router.get('/city/:city',async (req,res) => {
    try {
        let projects = await Project.find({city: req.params.city}).select('dateStart crypt title crypter -_id');
        res.json(projects)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
});

//delete project
router.delete('/:crypt', auth, async(req,res) => {
    try {
        const project = await Project.findOne({crypt: req.params.crypt});
        if(!project) {
            return res.status(404).json('Проект не найден')
        };
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
                crypter: editedProject.crypter
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


module.exports = router;