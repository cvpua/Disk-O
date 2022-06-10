import { google } from 'googleapis';
import { oauth2Client } from '../index';


export class DirectoryHandler{
    
    async initializeApp(refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
        try{
            const res = await drive.files.list({
                q:"name='Disk-O' and trashed=false",
                fields: 'files(id,name,mimeType)'
            })
            const files = res?.data?.files || []
            if(files.length === 0){
                console.log("Creating Folder")
                let fileMetadata = {
                    'name': 'Disk-O',
                    'mimeType': 'application/vnd.google-apps.folder',
                };
                // const resource
                const param = {
                    resource: fileMetadata,
                    fields: 'id'
                }
                const res = await drive.files.create(param);
                console.log(res.data.id)
                return [{
                    id: res.data.id,
                    name: "Disk-O",
                    mimeType: "application/vnd.google-apps.folder"
                }]
            }
            console.log("Return Disk")
            // console.log(res.data.files)
            return res.data.files;
        }catch(error){
            console.log(error.message);
            return;
        }
    }

    async createDirectory(parentDirectoryId:string, directoryName: string, deleteExistingPermission: boolean, refreshToken:string){

        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
        // console.log(parentDirectoryId)
        try{
            let fileMetadata = {
                'name': directoryName,
                'parents': [parentDirectoryId],
                'mimeType': 'application/vnd.google-apps.folder',
              };
            // const resource
            const param = {
                resource: fileMetadata,
                fields: 'id,name,mimeType,permissions/role,permissions/id,permissions/type,permissions/emailAddress,owners/emailAddress,createdTime,modifiedTime,thumbnailLink,iconLink'
            }
            // To check:
                // permissions, permissionIds, parents[]
            const res = await drive.files.create(param);
            if(!deleteExistingPermission){
                console.log(res.data);
                return res.data;
            }
            const directoryId:any = res.data.id; 
            const permissions:any = res.data.permissions;
            permissions.forEach((permission : any) => {
                if(permission.role !== 'owner'){
                    this.deletePermission(permission.id,directoryId,refreshToken);
                }
            })
            console.log("Permisisons Deleted!");
            return res.data;    
        }catch(error){
            console.log(error.message);
        }
    }

    async fetchDirectory(parentDirectoryId: string, forNavBar: boolean, refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        try{  
            const query = forNavBar ? 
            `'${parentDirectoryId}' in parents and trashed=false or name contains 'Disk-O' and sharedWithMe and trashed=false` : 
            `'${parentDirectoryId}' in parents and trashed=false`;
            const res= await drive.files.list({
                q:query,
                fields: 'files(id,name,mimeType,permissions/id,permissions/emailAddress,permissions/role,parents,owners/emailAddress,size,createdTime,modifiedTime,thumbnailLink,iconLink)', //permissions/role,permissions/type,
                orderBy: 'folder,name'
            })
            // console.log(res.data.files);
            return res.data.files;
        }catch(error){
            console.log(error.message)
            return;
        }
    }
    
    async fetchDirectoryForDeletion(parentDirectoryId: string, refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        try{  
            const query = `'${parentDirectoryId}' in parents and trashed=false`;
            const res: any = await drive.files.list({
                q:query,
                fields: 'files(id,name,mimeType,owners/emailAddress,permissions/id,permissions/emailAddress)',
                orderBy: 'name'
            });
            return res.data.files;
        }catch(error){
            console.log(error.message)
            return;
        }
    }


    async getParentDirectoryId(directoryId: string, refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
        try{  
            const res= await drive.files.get({
                fileId: directoryId,
                fields: 'parents'
            })
            // console.log(res.data)
            return res.data;
        }catch(error){
            console.log(error.message)
            return;
        }
    }

    // async createPermission(directoryId:string, role:string, type:string, emailAddress:string, refreshToken:string){
    //     oauth2Client.setCredentials({refresh_token:refreshToken})
    //     const drive = google.drive({
    //         version: 'v3',
    //         auth: oauth2Client
    //     })
    //     try{
    //         const res = await drive.permissions.create({ 
    //             sendNotificationEmail: false,
    //             fileId:directoryId,
    //             fields:'emailAddress,id,role,type',
    //             requestBody:{
    //                 role,
    //                 type,
    //                 emailAddress
    //             }
    //         })
    //         console.log(res.data) 
    //         return res.data
    //     }catch(error){
    //         console.log(error.message)
    //         return;
    //     }
    // }

    async updatePermission(fileId:string, permissionId:string, role:string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })

        try{
            const res = await drive.permissions.update({
                fileId,
                permissionId,
                requestBody:{
                    role
                }
            })
            // console.log(res.data)
            return res.data;
        }catch(error){
            console.log(error.message);
            return;
        }
    }

    async getPermissionList(directoryId:string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })

        const res = await drive.permissions.list({
            fields: '*',// fields:'emailAddress,id,role,type',
            fileId:directoryId
        })
        // console.log(res.data);
        return res.data;
    }

    async getPermission(directoryId: string, permissionId:string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
         
        const res = drive.permissions.get({
            fields:'emailAddress,id,role,type',
            fileId:directoryId,
            permissionId
        })
        .then(function(res) {
            // Handle the results here (response.result has the parsed body).
            return res.data;
          },
        function(_) { //console.error("Execute error", err); 
          return { message: "User doesn't have sufficient permission for this file"}
        });
        return res;
        // console.log(res.data)
    }

    async deletePermission(permissionId:string, directoryId:string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
        try{
            const res = await drive.permissions.delete({
                fileId:directoryId,
                permissionId
            })
            console.log(res.data)
            return res.data
        }catch(error){
            console.log(error);
            return;
        }
        
    }
}