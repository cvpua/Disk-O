import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const role = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    mainFolderId: String,
    count: Number,
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    listOfAccess: [{type: Schema.Types.ObjectId, ref: 'Access'}]

})

export default module.exports = mongoose.model('Role',role);