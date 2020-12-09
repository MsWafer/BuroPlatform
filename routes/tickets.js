const express = require('express');
const router = express.Router();
const{check, validationResult} = require('express-validator');
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

const Ticket = require('../models/Ticket');
const User = require('../models/User');


//create ticket
router.post ('/', upload.single('file'), [auth, [
    check('problemname', 'Введите проблему').not().isEmpty(),
    check('text', 'Введите описание проблемы').not().isEmpty(),
    check('emergency', 'Выберите срочность').not().isEmpty().isNumeric()
]
], 
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {   
        let user = await User.findOne({_id:req.user.id}).select('-password -permission');
        let currDate = new Date();

        const newTicket = new Ticket ({
            user: req.user.id,
            problemname: req.body.problemname,
            text: req.body.text,
            date: currDate,
            emergency: req.body.emergency,
            name: user.name,
            pcpass: req.body.pcpass,
            screenshot: req.file ? req.file.filename : {}
        });
        try {
            await newTicket.save();
            await User.findOneAndUpdate({_id:req.user.id},{$push: {tickets:newTicket}})
        } catch (error) {
            console.log(error)
        }
        
        res.json({msg:'Новая проблема добавлена'});
        console.log('Новый тикет добавлен')
    } catch (err) {
        res.status(500).send('serve error');
    }
}
);

//get all tickets
router.get('/all', async(req,res) => {
    try {
        // let arr = [];
        let tickets = await Ticket.find().sort({date:-1}).populate('user','-tickets -projects');
    //     tickets.map(ticket => arr.push(
    //    {
    //     id:`${ticket.id}`,
    //     date:`${ticket.date.toString().slice(4,21)}`,
    //     user:`${ticket.user.name}`,
    //     problemname:`${ticket.problemname}`,
    //     emergency:`${ticket.emergency}`,
    //     status:`${ticket.status}`
    //     }
    //     ))
        res.json(tickets);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get ticket by id
router.get('/:id', async(req,res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('user', '-tickets -projects');

        if(!ticket) {
            return res.status(404).json({msg: "ticket not found"});
        };

        res.json({
            id:ticket.id,
            date:ticket.date,
            user:ticket.user.name,
            problemname:ticket.problemname,
            text:ticket.text,
            pcpass:ticket.pcpass,
            emergency:ticket.emergency,
            status:ticket.status,
            screenshot:ticket.screenshot
        });
    } catch (err) {
        console.log(err);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: "ticket not found"});
        }
        res.status(500).send('server error');
    }
});

//get all user's tickets
router.get('/user/:id', async(req,res) => {
    try {
        // let arr = [];
        let tickets = await Ticket.find({user: req.params.id}).sort({date: -1}).populate('user', '-projects -tickets');

        // tickets.map(ticket => arr.push(
        // {
        // id:`${ticket.id}`,
        // date:`${ticket.date.toString().slice(4,21)}`,
        // problemname:`${ticket.problemname}`,
        // emergency:`${ticket.emergency}`,
        // status:`${ticket.status}`
        // }
        // )
        // )

        res.json(tickets);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get all active tickets
router.get('/all/active', async(req,res) => {
    try {
        // let arr = [];
        let tickets = await Ticket.find({status:true}).sort({date: -1}).populate('user', '-tickets -projects');
        // tickets.map(ticket => arr.push(
        //     {
        //     id:`${ticket.id}`,
        //     date:`${ticket.date.toString().slice(4,21)}`,
        //     user:`${ticket.user.name}`,
        //     problemname:`${ticket.problemname}`,
        //     emergency:`${ticket.emergency}`,
        //     }
        // ))
        res.json(tickets);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get all tickets sorted by emergency
router.get('/all/emergency', async(req,res) => {
    try {
        // let arr = [];
        let tickets = await Ticket.find().sort({emergency: -1}).populate('user', '-projects -tickets');
        // tickets.map(ticket => arr.push(
        //     {
        //     id:`${ticket.id}`,
        //     date:`${ticket.date.toString().slice(4,21)}`,
        //     user:`${ticket.user.name}`,
        //     problemname:`${ticket.problemname}`,
        //     emergency:`${ticket.emergency}`,
        //     status:`${ticket.status}`
        //     }
        // ))
        res.json(tickets);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//deactivate ticket by id
router.put("/:id", async (req, res) => {
    try {
        let ticket = await Ticket.findOneAndUpdate({id: req.params._id}, {$set: {status:false}})
        res.json({msg:`${ticket.id} пофикшен`});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
});

//delete ticket by id
router.delete("/:id",auth,async(req,res)=>{
    try {
        let ticket = await Ticket.findOne({_id:req.params.id})
        await User.updateMany({tickets:ticket._id},{$pull:{tickets:ticket._id}},{multi:true})
        await Ticket.findOneAndDelete({_id:req.params.id})
        console.log("ticket deleted")
        return res.json({msg:"ticket udalen"})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
})

//delete all tickets
router.delete('/deleteall',async(req,res)=>{
    try {
        await Ticket.remove({})
        console.log('eee pizdec')
    } catch (error) {
        console.log('uuu pizdec')
        res.status(500).json({err:"blya ne udalilos"})
    }
})

module.exports = router;

