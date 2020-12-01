const express = require('express');
const router = express.Router();
const auth = require ('../middleware/auth');

const Project = require('../models/Project');

//find all
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
//find by crypt/name
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

//delete
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

//edit
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

module.exports = router;