const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require ('../middleware/auth');

const Project = require('../models/Project');
const User = require('../models/User');

router.post ('/', auth, [
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
    
    let { name, dateStart, city, type, stage, area } = req.body;

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
            team:[{user:user.name}]
        });
        
        await project.save();
        console.log(`Проект ${crypt} добавлен`)

        return res.status(200).send(`${crypt}-${name}`);

    } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
    }
    
});

module.exports = router;