import { google } from 'googleapis';
import mongoose from 'mongoose';
import { oauth2Client } from '../index';
import  User  from '../models/user';
import { DirectoryHandler } from './directory';


export class UserHandler{
    
    async addUser(mainDirectoryId:string, role:string, type:string, emailAddresses:[string], deleteExistingPermission: boolean, refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        try{
            console.log(mainDirectoryId);
            let userDetails: Array<any> = [];
            userDetails = await Promise.all(emailAddresses.map(async (emailAddress : string) => {
                const res = await drive.permissions.create({ 
                    sendNotificationEmail: true,
                    fileId:mainDirectoryId,
                    fields:'emailAddress,id,role,type',
                    requestBody:{
                        role,
                        type,
                        emailAddress
                    }
                })
                console.log('Adding user...');
                return res.data
            }))
            
            if(deleteExistingPermission){
                const handler = new DirectoryHandler();
                const directories:any = await handler.fetchDirectoryForDeletion(mainDirectoryId,refreshToken);
                
                const usersId: any = userDetails.map((user:any) =>{
                    return(
                        {
                            permissionId: user.id,
                        }
                    )
                })
                directories.forEach((directory:any) =>{
                    this.deletePermission(directory,usersId,refreshToken);
                });
            }
            
            console.log(userDetails);
            return userDetails;

        }catch(error){
            console.log(error);
            return;
        }
    }


    async createPermission(file: any, users: [], permission: string, refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        try{
            const handler = new DirectoryHandler();
            let initChildrenState;
            if(file.mimeType === 'application/vnd.google-apps.folder'){
                initChildrenState = await handler.fetchDirectoryForDeletion(file.id,refreshToken);
            }


            const owner = file.owners[0].emailAddress;
            let userDetails: Array<any> = [];
            userDetails = await Promise.all(users.map(async (user : any) => {
                if(user.emailAddress !== owner){
                    console.log("Adding: ",user.emailAddress," to ",file.name);
                    const res = await drive.permissions.create({ 
                        sendNotificationEmail: false,
                        fileId:file.id,
                        fields:'emailAddress,id,role,type',
                        requestBody:{
                            role: permission,
                            type: 'user',
                            emailAddress: user.emailAddress
                        }
                    });
                    console.log('Loading users....');
                    return res.data;
                }else{
                    return({
                        id: user.permissionId,
                        type: 'user',
                        emailAddress: user.emailAddress,
                        role: permission
                    })
                }
            }));
            
            return userDetails;

        }catch(error){
            console.log(error.message)
            return;
        }
    }

    async updatePermission(file: any, users:[], permissionType: string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        try{
            const handler = new DirectoryHandler();
            let initChildrenState;
            if(file.mimeType === 'application/vnd.google-apps.folder'){
                initChildrenState = await handler.fetchDirectoryForDeletion(file.id,refreshToken);
            }

            let userDetails: Array<any> = [];
            const owner = file.owners[0].emailAddress;
            userDetails = await Promise.all(users.map(async (user : any) => {
                if(user.emailAddress !== owner){
                    console.log("Editing: ",user.emailAddress," in ",file.name);
                    const res = await drive.permissions.update({ 
                        fileId:file.id,
                        permissionId: user.permissionId,
                        fields:'emailAddress,id,role,type',
                        requestBody:{
                            role: permissionType
                        }
                    });
                    console.log('Done!');
                    return res.data
                }else{
                    return({
                        id: user.permissionId,
                        type: 'user',
                        emailAddress: user.emailAddress,
                        role: permissionType
                    })
                }
            }));
            // if(file.mimeType === 'application/vnd.google-apps.folder'){
            //     const handler = new DirectoryHandler();
            //     const directories:any = await handler.fetchDirectoryForDeletion(file.id,refreshToken);
            //     console.log('Deleting users....');
            //     console.log('------Initial State-----');
            //     console.log(initChildrenState);
            //     console.log('------After Adding State------');
            //     console.log(directories);



            //     directories.forEach(async(directory: any) =>{
            //         await this.deletePermission(directory,users,refreshToken);
            //             }
            //     )
            //     // setTimeout(deletePermissions,5000);
            // }
            return userDetails;
        }catch(error){
            console.log('Error in updating permission');
            console.log(error.message);
            return;
        }
    }


    async deletePermission(file: any, users: [], refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        try{ 
            // console.log(file);
            // console.log(users);
            const owner = file.owners[0].emailAddress;
            users.forEach(async (user:any) => {
                // console.log(user.emailAddress);
                // console.log(owner);
                if(user.emailAddress !== owner){
                    console.log("Deleting: ",user.emailAddress,user.permissionId," from ",file.name,file.id);
                    drive.permissions.delete({
                        fileId: file.id,
                        permissionId: user.permissionId
                    })
                    .then(function(response) {
                        // Handle the results here (response.result has the parsed body).
                        console.log("Response", response.data);
                      },
                    function(err) { console.error("Execute error", err); 
                    });
                    console.log('Deleting...');
                }
            });
           
            // console.log("Deleted!");
            return ({message: "Deleted"});
        }catch(error){
            console.log('Error in deleting...');
            console.log(error.message);
            return;
        }
       
    }

    async fetchUser(emailAddresses: string[], permissions: any[any] = null){
        
        try{
            const newUsers = await Promise.all(emailAddresses.map(async(emailAddress,index:number) =>{
                const user = await User.findOne({emailAddress});
                
                if(user && !user.permissionId && permissions){
                   user.permissionId = permissions[index].id || null;
                   const res = await user.save();
                   return res; 
                }
                if(user){
                    return user;
                }
                
    
                let newUser;
                if(permissions){
                    newUser = new User({
                        _id: new mongoose.Types.ObjectId(),
                        emailAddress:permissions[index].emailAddress,
                        permissionId:permissions[index].id
                    });
                }else{
                    newUser = new User({
                        _id: new mongoose.Types.ObjectId(),
                        emailAddress
                    });
                } 
            
                const res = await newUser.save();
                return res;
            }));
            console.log('Users fetched!');
            return newUsers;
           

        }catch(error){
            console.log(error);
            return;
        }
    }

    async addUserRoles(userId: string, roleId: string){
        try{
            const user = await User.findById(userId);        
            user.roles = [...user.roles,roleId];
            const res = await user.save();
            console.log('User updated!');
            return res;

        }catch(error){
            console.log(error);
            return;
        }
        
    }

    async addUserPermissionId(users: any[]){
        try{
            const newPermissions = await Promise.all(users.map(async(user:any) =>{
                
                const userToUpdate = await User.findOne({emailAddress:user.emailAddress});
                
                userToUpdate.permissionId = user.id;
                const res = await userToUpdate.save(); 
                return res;
            }));
            return newPermissions;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async deleteUserRole(userId: string, roleId: string){
        try{
            console.log(userId, roleId);
            const user : any = await User.findById(userId);
            console.log(user);
            user.roles = user.roles.filter((role:any) => String(role) !== String(roleId));
            console.log(user);
            await user.save();
        }catch(error){
            console.log(error);
            return;
        }

    }

    async deleteBatchUserRole(userId: string, roleIds: string[]){

        const user: any = await User.findById(userId);
        console.log('Deleting batch user roles...');
        console.log(user.roles);
        user.roles = user.roles.filter((role: any) => roleIds.indexOf(String(role)) < 0);
        console.log(user.roles);
        const res = await user.save();
        return res;
    }

    
}