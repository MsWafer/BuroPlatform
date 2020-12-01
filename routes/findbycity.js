const express = require('express');
const router = express.Router();


const Project = require('../models/Project');

//find by city
router.get('/:city',async (req,res) => {
    try {
        let projects = await Project.find({city: req.params.city});
        let arr =[];
        await projects.map(project => arr.push(`${project.dateStart}-${project.dateFinish}-${project.crypt}-${project.name}`))
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

module.exports = router;