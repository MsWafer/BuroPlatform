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
    },
    dateFinish: {
        type: Date,
        default: null
    },
    team: [
        {
        user:{
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        }
    ],
    customer: {
        type: String
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