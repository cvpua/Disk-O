import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const access = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    permissionType: String,
    fileId: String,
    fileName: String,
    roleId: {type: Schema.Types.ObjectId, ref: 'Role'},
    isDirectlyEdited: {type: Boolean, default: false},
    checkboxStatus: [{state: Boolean, disabled: Boolean}]
});

export default module.exports = mongoose.model('Access',access);