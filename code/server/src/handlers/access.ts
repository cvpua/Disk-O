import Access from '../models/access';
import mongoose from 'mongoose';

export class AccessHandler{
    
    async createAccess(permissionType: string, fileName: string, fileId: string, roleId:string,isDirectlyEdited: boolean, checkboxStatus: any){    
        try{
            const newAccess = new Access({
                _id: new mongoose.Types.ObjectId(),
                permissionType,
                fileName,
                fileId,
                roleId,
                isDirectlyEdited,
                checkboxStatus
            })
            const res = await newAccess.save();
            // console.log(res);
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }
    

    async updateAccess(permissionType: string, accessId: string,isDirectlyEdited: boolean, checkboxStatus: any){
        try{
            const updateAccess = await Access.findById(accessId);
            updateAccess.permissionType = permissionType;
            updateAccess.checkboxStatus = checkboxStatus;
            updateAccess.isDirectlyEdited = isDirectlyEdited;
            const res = await updateAccess.save();
            // console.log(res);
            return res;
        }catch(error){

        }
    }
    
    // async deleteAccess(fileId: string)

    async fetchAccess(accessId:string){
        try{
            const access = await Access.findById(accessId);
            return access;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async fetchAccesses(fileId: string){
        try{
            const accesses = await Access.find({fileId});
            if(accesses) return accesses;
            return [];
        }catch(error){
            console.log(error);
            return;
        }
    }

    async fetchRoleAccesses(roleId: string){
        try{
            const res = await Access.find({roleId}, 'permissionType fileId roleId isDirectlyEdited');
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async fetchRoleFileAccess(roleId: string, fileId: string){
        try{
            const res = await Access.findOne({roleId,fileId},'permissionType fileId roleId isDirectlyEdited');
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async deleteRoleAccess(roleId: string){
        try{
            const res = await Access.deleteMany({roleId});
            console.log(res);
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async deleteFileAccess(fileId: string){
        try{
            const res = await Access.deleteMany({fileId});
            console.log(res);
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async deleteAccess(accessId: string){
        try{
            const res = await Access.deleteOne({_id:accessId});
            console.log(res);
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async deleteFileAndRoleAccess(fileId: string, roleId:string){
        try{
            const res = await Access.deleteOne({fileId,roleId});
            console.log(res);
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }
}