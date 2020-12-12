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
const nodemailer = require('nodemailer')
const storage = multer.diskStorage({ 
    destination: function (req, file, cb) {
        cb(null, '/usr/src/app/public/ticketSS')
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()+ '-' +path.extname(file.originalname)) 
    } 
}); 

const upload = multer({ storage: storage }); 


const User = require('../models/User');
const Project = require('../models/Project');
const { findOneAndUpdate } = require('../models/User');

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
            avatar: req.file ? 'avatars/' + req.file.filename : {}
        });

        //password encryption
        const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log('new user registered')

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
    if(user.avatar==undefined){userAvatar={}}else {userAvatar=user.avatar}
    console.log('user found')
    return res.json({
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
        console.log('user info updated')
        return res.json({msg:'Ваш профиль был обновлен'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
}
)

//find all users
router.get('/all', async(req,res)=>{
    try {
        let users = await User.find().populate('projects', '-team').populate('tickets', '-user')
        console.log('GET all users')
        return res.json(users) 
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
        .populate('projects', '-team')
        .populate('tickets', '-user')
        if(!user) {
            console.log('user not found')
            return res.status(404).json({msg: "User not found"});
        };
        console.log('user found')
        return res.json({
            id:user.id,
            name:user.name,
            email:user.email,
            position:user.position,
            projects:user.projects,
            tickets:user.tickets,
            avatar:user.avatar
        })
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('server error');
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
        console.log('User deleted')
        return res.json({msg:`Пользователь удален`});
    }catch(err) {
        console.error(err.message);
        return res.status(500).send('server error');
    };
})




//find user by mail, generate recovery code, save it to model and send to user's email
router.put('/passrec', async(req,res)=>{
    let user = await User.findOne({email:req.body.email})
    if(!user){return res.json({msg:'Не найден пользователь с указанным email'})}

    //generating recovery code
    function makeid(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
    
    //unnecessary security stuff
    let reccds = [];
    let users = await User.find().select('reccode');
    users.map(user => reccds.push(user.reccode));
    const promise = () =>  new Promise((resolve) => {
        recCode = makeid(6);
        if(reccds.includes(recCode)){resolve(promise())};
    });
    promise()

    //saving recovery code to model
    await User.findOneAndUpdate({email:req.body.email},{$set:{reccode:recCode}})

    //send email
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'buro82platformbot@gmail.com',
                pass: 'Kr$V6=Sf/^S4*9Hn'
            }
        });
        let mailOptions = {
            from: 'buro82platformbot@gmail.com',
            to: `${req.body.email}`,
            subject: `<no-reply> Восстановление пароля на платформе Buro82`,
            text: `Ваш код для восстановление пароля: ${recCode}`
        };
        transporter.sendMail(mailOptions, function(error, info){
            console.log('Email sent: ' + info.response);
            return res.json({msg:`Код восстановления был отправлен на ${req.body.email}`, recCode:recCode})
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json(error)
    }
    
})

//check recovery code
router.get('/passrec/2',async(req,res)=>{
    let user = await User.findOne({recCode:rec.body.recCode})
    if(!user){return res.json({err:'Введен неверный код'})}
    return res.json({
        msg:'Введите новый пароль',
        recCode:req.body.recCode})
})

//new password stuff
router.put('/passrec/3',async(req,res)=>{
    if(!req.body.password){return res.json({msg:'Введите новый пароль'})}
    try {
        const salt = await bcrypt.genSalt(10);
        newPassword = await bcrypt.hash(req.body.password, salt);
        let user = await User.findOneAndUpdate({recCode:req.body.recCode},{$set:{password:newPassword}},{$set:{recCode:null}})
        console.log('Пароль изменен')
        return res.json({
            msg:'Пароль изменен',
            userid:user.id})
    } catch (error) {
        console.log(error)
        return res.json({err:'Server error'})
    }
})


module.exports = router;