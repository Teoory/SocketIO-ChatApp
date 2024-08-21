const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const messageSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    senderInfo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel'
    },
    hidden: {
        type: Boolean,
        default: false
    },
    highlighted: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = model('Message', messageSchema);

module.exports = Message;
