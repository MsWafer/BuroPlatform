const express = require('express');
const router = express.Router();
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

    const user = await User.findById(req.user.id).select('-password', '-permission').populate('user');
    
    let { name, dateStart, city, type, stage, area, customer } = req.body;

    try{
        function getRndInteger(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        };

        let crypt = getRndInteger(1000,9999)
        let gonvocod = await Project.findOne({crypt});
        if(gonvocod) {
            crypt
        };
        if(gonvocod) {
            crypt
        };
        if(gonvocod) {
            crypt
        };
        if(gonvocod) {
            crypt
        };

        project = new Project({
            crypt,
            name,
            dateStart,
            dateFinish:req.body.dateFinish ? req.body.dateFinish : {},
            city,
            type,
            stage,
            area,
            team:[{user:user.name}],
            customer
        });
        
        await project.save();
        console.log(`Проект ${crypt} добавлен`)

        return res.status(200).send(`${crypt}-${name}`);

    } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
    }
    
});

//find all projects
router.get('/',async (req,res) => {
    try {
        let arr =[];
        let projects = await Project.find();
        await projects.map(project => arr.push(`${project.dateStart}-${project.crypt}-${project.name}`))
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
            res.json({
                name:`Название:${project.name}`,
                crypt: `Шифр:${project.crypt}`,
                date: `С ${project.dateStart} по ${project.dateFinish}`,
                city: `Город:${project.city}`,
                type: `Тип:${project.type}`,
                stage: `Этап:${project.stage}`,
                area: `Площадь:${project.area}`  
            });
        } else if (projectName) {
            let arr2 =[];
            projectName.map(project => arr2.push(`${project.dateStart}-${project.dateFinish}-${project.crypt}-${project.name}`))
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
router.get('city/:city',async (req,res) => {
    try {
        let projects = await Project.find({city: req.params.city});
        let arr =[];
        projects.map(project => arr.push(`${project.dateStart}-${project.dateFinish}-${project.crypt}-${project.name}`))
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

    const newName = req.body.name;
    const newDateStart = req.body.date;
    const newDateFinish = req.body.date;
    const newCity = req.body.city;
    const newType = req.body.type;
    const newStage = req.body.stage;
    const newArea = req.body.area;

    try {
        const project = await Project.findOneAndUpdate({crypt: req.params.crypt}, 
            {$set: {
                name:newName, 
                dateStart:newDateStart, 
                dateFinish:newDateFinish, 
                city:newCity,
                type:newType,
                stage:newStage,
                area:newArea
            }})
        res.json({
                name:`Название:${project.name}`,
                crypt: `Шифр:${project.crypt}`,
                date: `С ${project.dateStart} по ${project.dateFinish}`,
                city: `Город:${project.city}`,
                type: `Тип:${project.type}`,
                stage: `Этап:${project.stage}`,
                area: `Площадь:${project.area}`
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
});

//add user to project's team
router.put('/updteam/:crypt', auth, async(req,res)=>{
    try {
        let user = await User.findById(req.body.userid).select('-password').populate('user');
        await Project.findOneAndUpdate({crypt: req.params.crypt},{$push: {team: user}});
        let project = Project.findOne({crypt: req.params.crypt}).populate('user');
        await User.findOneAndUpdate({id:req.body.userid},{$push: {projects: project}});
        res.status(200).json({msg:`${user.name} добавлен в команду проекта ${req.params.crypt}`})
        console.log(`Пользователь добавлен в команду проекта ${req.params.crypt}`)
    } catch (error) {
    res.status(400).send(`server error`)
    console.log('произошла якась хуйня')
}})


module.exports = router;


    // let perm = await User.findById(req.user.id).select('-password').populate('user');
    // if(perm.permission !== 'admin'){
    //     return res.status(403).send('У вас недостаточно прав для данной операции')
    // }