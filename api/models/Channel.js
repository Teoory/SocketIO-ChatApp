const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    private: {
        type: Boolean,
        default: false
    },
    closed: {
        type: Boolean,
        default: false
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    allowedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Channel = model('Channel', channelSchema);

module.exports = Channel;
