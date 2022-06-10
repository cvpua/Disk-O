import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const user = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    emailAddress: {
        type: String,
        required: true,
        unique: true
    },
    permissionId : {type: String, default: null},
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref:'Role' }]
})

export default module.exports = mongoose.model('User',user);