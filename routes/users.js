const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');

const User = require('../models/User');

//registration
router.post ('/', [
    check('name', 'Введите имя пользователя').not().isEmpty(),
    check('email', 'Введите email').isEmail(),
    check('password', "Введите пароль длиной не менее 7 и не более 20 символов").isLength({min:7,max:20}),
    check('position', 'Выберите должность').not().isEmpty()
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const { name, email, password, position } = req.body;

    try{
        let user = await User.findOne({email});
        if(user) {
            return res.status(400).json({ errors: [{msg: 'Пользователь с указанным email уже существует'}]});
        }

        user = new User({
            name,
            email,
            password,
            position
        });

        //password encryption
        const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

        await user.save();

        //jsonwebtoken return
        const payload = {user: {id: user.id}};

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