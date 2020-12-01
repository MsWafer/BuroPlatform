const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    dateStart: {
        type: Date,
        default: Date.now()
    },
    dateFinish: {
        type: Date,
        default: Date.now()
    },
    team: [
        {
        user1:{
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        user2:{
            type: Schema.Types.ObjectId,
            ref: 'user'
            },
        user3:{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }}
    ],
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    city: {
        type: String
    },
    area: {
        type: String,
    },
    crypt: {
        type: Number
    }
    
});

module.exports = Project = mongoose.model('project', ProjectSchema);