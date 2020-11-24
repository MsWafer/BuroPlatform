const express = require('express');
const router = express.Router();
const{check, validationResult} = require('express-validator');
const auth = require ('../middleware/auth');

const Ticket = require('../models/Ticket');
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

        const newTicket = new Ticket ({
            problemname: req.body.problemname,
            text: req.body.text,
            emergency: req.body.emergency,
            name: user.name,
            user: req.user.id
        });

        const ticket = await newTicket.save();

        res.json(ticket);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('serve error');
    }
}
);

//get all tickets

router.get('/all', auth, async(req,res) => {
    try {
        let arr = [];
        let tickets = await Ticket.find().sort({date: -1});
        tickets.map(ticket => arr.push(`${ticket.date}-${ticket.user.name}-${ticket.problemname}-${ticket.emergency}-${ticket.status}`))
        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get all user's tickets

router.get('/user/:username', auth, async(req,res) => {
    try {
        let arr = [];
        let tickets = await Ticket.find({user: req.params.username}).sort({date: -1});
        tickets.map(ticket => arr.push(`${ticket.date}-${ticket.problemname}-${ticket.emergency}-${ticket.status}`))
        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

//get all active tickets
router.get('/active', auth, async(req,res) => {
    try {
        let arr = [];
        let tickets = await Ticket.find({status: req.params.status}).sort({date: -1});
        tickets.map(ticket => arr.push(`${ticket.date}-${ticket.user.name}-${ticket.problemname}-${ticket.emergency}`))
        res.json(arr);
    } catch (err) {
        console.error(err.messsage);
        res.status(500).send('server error');
    }
});

module.exports = router;

