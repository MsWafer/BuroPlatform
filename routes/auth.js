const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require ('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');

const User = require('../models/User');


router.get ('/',auth,async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }
});
//authentification
router.post ('/', [
    check('email', 'Введите email').isEmail(),
    check('password', "Введите пароль").exists()
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try{
        let user = await User.findOne({email});
        if(!user) {
            return res
            .status(400)
            .json({ errors: [{msg: 'Пользователь с указанным email не найден'}]});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if (!isMatch) {
            return res
            .status(400)
            .json({ errors: [{msg: 'Неверный пароль'}]});
        }

        //jsonwebtoken return
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 360000000},
            (err, token) => {          
                if(err) throw err;
                res.json({token});
            });

    } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
    }
    
});

module.exports = router;