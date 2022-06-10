import Role from '../models/role';
import User from '../models/user';
import mongoose from 'mongoose';
import user from '../models/user';

export class RoleHandler{
    
    async initRoles(mainFolderId : string, name: string, userId: any){
        
        try{
            const newRole = new Role({
            _id: new mongoose.Types.ObjectId(),
            name,
            mainFolderId,
            count : 1,
            users : [userId] 
            })

            const res = await newRole.save();
            console.log(res)
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async getRoles(mainFolderId: string){
        
        try{
            const roles : any = await Role
            .find({mainFolderId})
            .populate({
                path:'users',
                select: 'emailAddress permissionId roles'
            })
            .populate(
                {
                    path:'listOfAccess',
                    select: '_id fileId roleId'
                }
            )
            return roles;
        }catch(error){
            console.log(error);
            return;
        }
    }
    
    async createRole(mainFolderId: string, name: string){
        try{
            const newRole = new Role({
            _id: new mongoose.Types.ObjectId(),
            name,
            mainFolderId,
            count : 0
            })

            const res = await newRole.save();
            console.log(res)
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }


    async deleteRole(roleId : string){
        try{
            const role : any = Role.findById(roleId);
            const listOfAccess = role.listOfAccess;
    
            await Role.deleteOne({_id:roleId});
            console.log('Deleted');
            return;
        
        }catch(error){
            console.log(error);
            return;
        }
    
    }

    async patchRoleUsers(roleId: string, userIds : string[]){
        try{ 
            const role = await Role.findById(roleId);
            role.users = [...role.users,...userIds];
            role.count = role.count + userIds.length;
            const res = await role.save();
            console.log('Role updated!');
            return res;
        }catch(error){
            console.log(error);
            return;
        }
        
    }

    async deleteRoleUser(roleId: string, userId:string){
        try{
            const role = await Role.findById(roleId);
            role.users = role.users.filter((user:any) => String(user._id) !== String(userId));
            role.count = role.count - 1;
            const res = await role.save();
            console.log('User deleted from role!');
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async addRoleAccess(roleId: string, accessIds: string[]){
        
        try{
            console.log(accessIds);
            const role = await Role.findById(roleId);
            role.listOfAccess = [...role.listOfAccess,...accessIds];
            const res = await role.save();
            return res;
        
        }catch(error){
            return ;
        }
    }

    async deleteMainFolderRoles(mainFolderId: string){
        try{
            const res = await Role.deleteMany({mainFolderId});
            console.log(res);
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async deleteRoleAccess(roleId: string, accessIds: string[]){
        try{
            console.log('Removing accessIds...');
            console.log(roleId, accessIds);
            const role : any = await Role.findById(roleId);
            console.log(role);
            role.listOfAccess = role.listOfAccess.filter((access:any) => accessIds.indexOf(String(access)) < 0);
            const res = await role.save();
            return res;
        }catch(error){
            console.log(error);
            return;
        }
    }

    // async getRoleUsers(roleId: string){
    //     try{
    //         const role: any = await Role
    //         .findById(roleId)
    //         .populate({
    //             path:'users',
    //             select: 'emailAddress permissionId'
    //         })
        
    //     }catch(error){
    //         console.log(error);
    //         return;
    //     }
    // }

    
}