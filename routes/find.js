const express = require('express');
const router = express.Router();


const Project = require('../Project');

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
                name:`Имя проекта:${project.name}`,
                crypt: `Шифр проекта:${project.crypt}`,
                date: `Дата:${project.dateStart}-${project.dateFinish}`,
                city: `Город:${project.city}`    
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
//delete
router.delete('/:crypt',async(req,res) => {
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
router.put("/:crypt", async (req, res) => {

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
                name:`Имя проекта:${project.name}`,
                crypt: `Шифр проекта:${project.crypt}`,
                date: `Дата:${project.dateStart}-${project.dateFinish}`,
                city: `Город:${project.city}`
            });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
});

module.exports = router;