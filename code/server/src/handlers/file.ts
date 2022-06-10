import  path  from 'path';
import fs from 'fs';
import { google } from 'googleapis';
const filePath = '/home/bullet/Desktop/SP/ay2021-2022-1st-sem-cmsc190-sp1-cvpua/code/server/src/ai.jpg';
import { oauth2Client } from '../index';


export class FileHandler{
    
    
    async uploadFile(parentDirectoryId:string, fileName:string, filePath: string, deleteExistingPermission: boolean, refreshToken:string): Promise<any>{
        
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
        try{
            let fileMetadata = {
                name: fileName,
                parents: [parentDirectoryId]
            }

            let media = {
                body: fs.createReadStream(filePath)
            }

            const res = await drive.files.create({
                requestBody: fileMetadata,
                media,
                fields: 'id,name,mimeType,webContentLink,webViewLink,thumbnailLink,iconLink,size,parents,owners/emailAddress,createdTime,modifiedTime,permissions/id,permissions/emailAddress,permissions/role'
            });
            // console.log(res.data); 
            if(!deleteExistingPermission){
                return res;
            }

            const permissions: any = res.data.permissions;
            const fileId: any = res.data.id;
            permissions.forEach((permission : any) => {
                if(permission.role !== 'owner'){
                    this.deletePermission(permission.id,fileId,refreshToken);
                }
            });
            return res;
        }catch(error){
            console.log(error.message);
        }
    }

    async createGoogleDoc(parentDirectoryId:string, fileName:string, deleteExistingPermission:boolean, refreshToken:string){
        
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        const docs = google.docs({
            version: 'v1',
            auth: oauth2Client
        });
        try{
            
            const file: any = await docs.documents.create({
                requestBody:{
                    title: fileName,
                },
                fields: 'documentId,title'
            });
            
            const fileLocation: any = await drive.files.get({
                fileId: file.data.documentId,
                fields: 'id,parents'

            });
            const formerParent = fileLocation.data.parents[0].toString();
            const newParent = parentDirectoryId;
            
            const updatedFile = await drive.files.update({
                fileId: file.data.documentId,
                removeParents: formerParent,
                addParents: newParent,
                fields: 'id,name,mimeType,webContentLink,webViewLink,thumbnailLink,iconLink,size,parents,owners/emailAddress,createdTime,modifiedTime,permissions/id,permissions/emailAddress,permissions/role'
            });
            
            if(!deleteExistingPermission){
                return updatedFile;
            }

            const permissions: any = updatedFile.data.permissions;
            const fileId: any = updatedFile.data.id;
            permissions.forEach((permission : any) => {
                if(permission.role !== 'owner'){
                    this.deletePermission(permission.id,fileId,refreshToken);
                }
            });
            return updatedFile;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async createGoogleSheet(parentDirectoryId:string, fileName:string, deleteExistingPermission: boolean, refreshToken:string){
        
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        const sheet = google.sheets({
            version: 'v4',
            auth: oauth2Client
        });
        try{
            
            const file: any = await sheet.spreadsheets.create({
                requestBody:{
                    properties:{
                        title: fileName,
                    }
                    
                },
                fields: 'spreadsheetId,properties/title'
            });
            
            const fileLocation: any = await drive.files.get({
                fileId: file.data.spreadsheetId,
                fields: 'id,parents'

            });
            const formerParent = fileLocation.data.parents[0].toString();
            const newParent = parentDirectoryId;
            
            const updatedFile = await drive.files.update({
                fileId: file.data.spreadsheetId,
                removeParents: formerParent,
                addParents: newParent,
                fields: 'id,name,mimeType,webContentLink,webViewLink,thumbnailLink,iconLink,size,parents,owners/emailAddress,createdTime,modifiedTime,permissions/id,permissions/emailAddress,permissions/role'
            });
            
            if(!deleteExistingPermission){
                return updatedFile;
            }

            const permissions: any = updatedFile.data.permissions;
            const fileId: any = updatedFile.data.id;
            permissions.forEach((permission : any) => {
                if(permission.role !== 'owner'){
                    this.deletePermission(permission.id,fileId,refreshToken);
                }
            });
            return updatedFile;
        }catch(error){
            console.log(error);
            return;
        }
    }

    async createGoogleSlide(parentDirectoryId:string, fileName:string, deleteExistingPermission: boolean, refreshToken:string){
        
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        
        const slide = google.slides({
            version: 'v1',
            auth: oauth2Client
        });
        try{
            
            const file: any = await slide.presentations.create({
                requestBody:{
                    title: fileName,
                },
                fields: 'presentationId,title'
            });
            
            const fileLocation: any = await drive.files.get({
                fileId: file.data.presentationId,
                fields: 'id,parents'

            });
            const formerParent = fileLocation.data.parents[0].toString();
            const newParent = parentDirectoryId;
            
            const updatedFile = await drive.files.update({
                fileId: file.data.presentationId,
                removeParents: formerParent,
                addParents: newParent,
                fields: 'id,name,mimeType,webContentLink,webViewLink,thumbnailLink,iconLink,size,parents,owners/emailAddress,createdTime,modifiedTime,permissions/id,permissions/emailAddress,permissions/role'
            });
            
            if(!deleteExistingPermission){
                return updatedFile;
            }

            const permissions: any = updatedFile.data.permissions;
            const fileId: any = updatedFile.data.id;
            permissions.forEach((permission : any) => {
                if(permission.role !== 'owner'){
                    this.deletePermission(permission.id,fileId,refreshToken);
                }
            });
            return updatedFile;
            
        }catch(error){
            console.log(error);
            return;
        }
    }

    async copyFile(fileId: string, fileName: string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        const res = await drive.files.copy({
            fileId,
            requestBody:{
                name: 'Copy of ' + fileName
            },
            fields: 'id,name,mimeType,webContentLink,webViewLink,thumbnailLink,iconLink,size,parents,owners/emailAddress,createdTime,modifiedTime,permissions/id,permissions/emailAddress,permissions/role'
        });
        return res;
    }
    
    async getFile(fileId: string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });

        const res = await drive.files.get({
            fileId,
            fields: 'id,name,mimeType,webContentLink,webViewLink,thumbnailLink'
        });
        return res;
    }

    async renameFile(fileId: string, name: string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        const res = await drive.files.update({
            fileId,
            requestBody:{
                name
            },
            fields:'id,name,mimeType,webContentLink,webViewLink,thumbnailLink,iconLink,parents,owners/emailAddress,createdTime,modifiedTime,permissions/id,permissions/emailAddress,permissions/role'
        });
        return res;
    }

    async deleteFile(file:any,refreshToken:string){
        oauth2Client.setCredentials({refresh_token:refreshToken})
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        try{
            const res = await drive.files.delete({
                fileId: file.id
            });
            console.log(res.data,res.status);
            return { messge: 'Deleted'}
        }catch(error){
            console.log(error.message);
            return error.message
        }
    }

    async deletePermission(permissionId:string, fileId:string, refreshToken: string){
        oauth2Client.setCredentials({refresh_token:refreshToken});
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        })
        try{
            const res = await drive.permissions.delete({
                fileId,
                permissionId
            })
            return res.data
        }catch(error){
            console.log(error);
            return;
        }
        
    }
    
}