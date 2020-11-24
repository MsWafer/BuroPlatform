const express = require('express');
const router = express.Router();
const{check, validationResult} = require('express-validator');
const auth = require ('../middleware/auth');

const Ticket = require('../models/Ticket');
const { populate } = require('../models/User');
const User = require('../models/User');


//create ticket
router.post ('/', [auth, [
    check('problemname', 'Введите проблему').not().isEmpty(),
    check('text', 'Введите описание проблемы').not().isEmpty(),
    check('emergency', 'Укажите срочность').not().isEmpty()
]
], 
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        let currDate = new Date().toISOString().split('T')[0]
        const newTicket = new Ticket ({
            user: req.user.id,
            problemname: req.body.problemname,
            text: req.body.text,
            date: currDate,
            emergency: req.body.emergency,
            name: user.name,
            pcpass: req.body.pcpass
        });

        await newTicket.save();

        res.json({msg:'Ваша проблема будет обкашляна в ближайшее время'});
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('serve error');
    }
}
);

//get all tickets

router.get('/all', async(req,res) => {
    try {
        let arr = [];
        let tickets = await Ticket.find().sort({date:-1}).populate('user');
        tickets.map(ticket => arr.push(`${ticket.id}-${ticket.date}-${ticket.user.name}-${ticket.problemname}-${ticket.emergency}-${ticket.status}`))
        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get ticket by id

router.get('/:id', async(req,res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if(!ticket) {
            return res.status(404).json({msg: "ticket not found"});
        };

        res.json(ticket);
    } catch (err) {
        console.error(err.messsage);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: "ticket not found"});
        }
        res.status(500).send('server error');
    }
});

//get all user's tickets

router.get('/user/:username', async(req,res) => {
    try {
        let arr = [];
        let tickets = await Ticket.find({user: req.params.username}).sort({date: -1});
        tickets.map(ticket => arr.push(`${ticket.id}-${ticket.date}-${ticket.problemname}-${ticket.emergency}-${ticket.status}`))
        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get all active tickets
router.get('/active', async(req,res) => {
    try {
        let arr = [];
        let tickets = await Ticket.find({status: req.params.status}).sort({date: -1});
        tickets.map(ticket => arr.push(`${ticket.id}-${ticket.date}-${ticket.user.name}-${ticket.problemname}-${ticket.emergency}`))
        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//deactivate ticket by id
router.put("/:id", async (req, res) => {

    try {
        let ticket = await Ticket.findOneAndUpdate({id: req.params.id}, {$set: {status:false}})
        res.json({msg:`${ticket.id}пофикшен`});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
});

module.exports = router;

