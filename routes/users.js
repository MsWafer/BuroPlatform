const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const config = require('config');
const {check, validationResult} = require('express-validator');
const auth = require ('../middleware/auth');
const multer = require('multer'); 
const fs = require('fs'); 
const path = require('path'); 
const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, '/usr/src/app/public/ticketSS')
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now() +path.extname(file.originalname)) 
    } 
}); 

const upload = multer({ storage: storage }); 


const User = require('../models/User');
const Project = require('../models/Project');
const Ticket = require('../models/Ticket');
const { findById, findOne, findOneAndUpdate } = require('../models/User');
const { response } = require('express');

//registration
router.post ('/',upload.single('file'), [
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
            position,
            avatar: req.file ? [
                {avatarname:req.file.filename},
                {avatarpath:req.file.path}] : []
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
                res.json({token:token,
                          id:user.id});
            });

    } catch(err) {
    console.error(err.message);
    res.status(500).send('server error');
    }
    
});

//get current user's info
router.get('/me',auth,async(req,res)=>{
    let user = await User.findOne({_id:req.user.id}).select('-password').populate('projects', -'team').populate('tickets', '-user')
    if(user.avatar.avatarpath==undefined){userAvatar=[]}else {userAvatar=user.avatar[0].avatarpath}
    res.json({
        id:user.id,
        name:user.name,
        email:user.email,
        position:user.position,
        permission:user.permission,
        projects:user.projects,
        tickets:user.tickets,
        token:req.header('auth-token'),
        avatar:userAvatar
    })
})

//edit user
router.put('/me', auth, async(req,res) =>{
    let user1 = await User.findOne({_id:req.user.id});
    if(!req.body.password){
        newPassword=user1.password
    }else if(req.body.password){
        const salt = await bcrypt.genSalt(10);
        newPassword = await bcrypt.hash(req.body.password, salt);
    }
    try {
        await findOneAndUpdate({_id:req.user.id},
            {$set: {
                name:req.body.name?req.body.name:user1.name, 
                email:req.body.email?req.body.email:project1.email, 
                position:req.body.position?req.body.position:project1.position, 
                password:newPassword
            }
        })
        response.json({msg:'Ваш профиль был обновлен'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
}
)

//find all users
router.get('/all', async(req,res)=>{
    try {
        let users = await User.find().populate('projects').populate('tickets')
        res.json(users) 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
    
})

//find user by id
router.get('/:id', async(req,res) =>{
    try {
        let user = await User.findById(req.params.id)
        .select('-password -permission')
        .populate('projects')
        .populate('tickets')
        if(!user) {
            return res.status(404).json({msg: "ticket not found"});
        };
        res.json({
            id:user.id,
            name:user.name,
            email:user.email,
            position:user.position,
            projects:user.projects,
            tickets:user.tickets,
            avatar:user.avatar[0].avatarpath
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})

//delete user by id
router.delete('/:id',auth,async(req,res)=>{
    try {
        let user = await User.findOne({_id: req.params.id});
        if(!user) {
            return res.status(404).json('Проект не найден')
        };
        await Project.updateMany({team:user.id},{$pull:{team:user.id}},{multi:true})
        await user.remove();
        res.json({msg:`Пользователь удален`});
    }catch(err) {
        console.error(err.message);
        res.status(500).send('server error');
    };
})

module.exports = router;