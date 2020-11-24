const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    problemname: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    emergency: {
        type: String,
        required: true
    },
    screenshot: {
        type: String,
        default: 0
    },
    pcpass: {
        type: String,
        default: 0
    }
    
});

module.exports = Ticket = mongoose.model('ticket', TicketSchema);