const express = require('express');
const router = express.Router();
const{check, validationResult, Result} = require('express-validator');
const auth = require ('../middleware/auth');

const Project = require('../models/Project');
const User = require('../models/User');

//add new project
router.post ('/add', auth, [
    check('name', 'Введите название проекта').not().isEmpty(),
    check('dateStart', 'Введите дату говна').isDate(),
    check('city', 'Введите город').not().isEmpty(),
    check('type', 'Выберите тип проекта').not().isEmpty(),
    check('stage', 'Выберите этап мочи').not().isEmpty()
    ], async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    };
    
    let { name, dateStart, dateFinish, city, type, stage, area, customer } = req.body;

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

        project = new Project({
            crypt,
            name,
            dateStart,
            dateFinish,
            city,
            type,
            stage,
            area,
            customer
        });

        await project.save();
        console.log(`Проект ${crypt} добавлен`)
        return res.status(200).send(`${dateStart}-${crypt}-${name}`);
    } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
    }
    
});

//find all projects
router.get('/', async (req,res) => {
    try {
        let arr =[];
        let projects = await Project.find();
        await projects.map(project => arr.push(`${project.dateStart.toString().slice(4,15)}-${project.crypt}-${project.name}`))
        if(arr.length==0){
            res.json({msg:'Не найдено проектов'})
        }else{
        res.json(arr);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }

    
});

//find project by crypt/name
router.get('/:auth', async(req,res) => {
    try {
        let project = await Project.findOne({crypt: req.params.auth});
        let projectName = await Project.find({name: req.params.auth});

        if(!project && !projectName) {
            return res.status(400).json({msg: "Проект не найден"})
        } else if (project) {
            if(!project.dateFinish){finishDate=``}else{finishDate=` - ${project.dateFinish.toString().slice(4,15)}`}
            res.json({
                name:`${project.name}`,
                crypt: `${project.crypt}`,
                date: `${project.dateStart.toString().slice(4,15)}${finishDate}`,
                city: `${project.city}`,
                type: `${project.type}`,
                stage: `${project.stage}`,
                area: `${project.area}`  
            });
        } else if (projectName) {
            let arr2 =[];
            projectName.map(project => arr2.push(`${project.dateStart.toString().slice(4,15)}-${project.crypt}-${project.name}`))
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
        let arr = [];
        let projects = await Project.find({user: req.params.id})
        .sort({date: -1})
        .populate('user');

        projects.map(project => arr.push(
        {
        id:`${project.id}`,
        date:`${project.dateStart.toString().slice(4,21)} - ${project.dateFinish.toString().slice(4,21)}`,
        name:`${project.name}`,
        type:`${project.type}`,
        stage:`${project.stage}`,
        city:`${project.city}`,
        area:`${project.area}`,
        crypt:`${project.crypt}`,
        customer:`${project.customer}`,
        }
        )
        )

        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//find projects by city
router.get('/city/:city',async (req,res) => {
    try {
        let arr =[];
        let projects = await Project.find({city: req.params.city});
        projects.map(project => arr.push(`${project.dateStart.toString().slice(4,15)}-${project.crypt}-${project.name}`))
        if(arr.length==0){
            res.json({msg:'Не найдено проектов в указанном городе'})
        }else{
        res.json(arr);
        }
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

    try {
        let project = await Project.findOneAndUpdate({crypt: req.params.crypt}, 
            {$set: {
                name:req.body.name?req.body.name:project.name, 
                dateStart:req.body.dateStart?req.body.dateStart:project.dateStart, 
                dateFinish:req.body.dateFinish?req.body.dateFinish:project.dateFinish, 
                city:req.body.city?req.body.city:project.city,
                type:req.body.type?req.body.dateStart:project.dateStart,
                stage:req.body.stage?req.body.stage:project.stage,
                area:req.body.area?req.body.area:project.area,
                customer:req.body.customer?req.body.customer:project.customer
            }})
            
            let editedProject = await Project.findOne({crypt: req.params.crypt})
            if(!editedProject.dateFinish){finishDate=``}else{finishDate=` - ${editedProject.dateFinish.toString().slice(4,15)}`}
        res.json({
                name:`${editedProject.name}`,
                crypt: `${editedProject.crypt}`,
                date: `${editedProject.dateStart.toString().slice(4,15)}${finishDate}`,
                city: `${editedProject.city}`,
                type: `${editedProject.type}`,
                stage: `${editedProject.stage}`,
                area: `${editedProject.area}`,
                customer: `${editedProject.customer}`
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
    let das = huy.toString().slice(11,-3).replace(/{ _id:/g,'').replace(/ _id:/g,'').replace(/ }/g,'').replace(/     /g,'').replace(/\n/g,'').trim();
    let asd = das.split(',')
    if(asd.includes(req.body.userid)){return res.status(400).json({msg:`Данный пользователь уже находится в команде проекта`})};

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


    // let perm = await User.findById(req.user.id).select('-password').populate('user');
    // if(perm.permission !== 'admin'){
    //     return res.status(403).send('У вас недостаточно прав для данной операции')
    // }