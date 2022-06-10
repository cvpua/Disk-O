import { FileHandler } from '../handlers';
import { Response, Request, Router } from 'express';
import { parseFiles } from '../middleware/upload';
import fs from 'fs-extra';

export const FileEndpoint = Router();




const uploadFile =async (req:Request, res: Response) => {
    
    const handler = new FileHandler();
    const { parentDirectoryId,  deleteExistingPermission, refreshToken} = req.body;
    const filePath = res.locals.files[0].path;
    const fileName = res.locals.files[0].originalname;
    const booleanDeleteExistingPermission = deleteExistingPermission === 'true';
    const data: any = await handler.uploadFile(
        parentDirectoryId,
        fileName,
        filePath,
        booleanDeleteExistingPermission,
        refreshToken
    );
    fs.emptyDir('./uploads',(err) => {
        if (err) {
            throw err;
        }
        console.log(`./uploads deleted!`);
    });
    res.json(data);
}

const createGoogleDoc = async(req: Request, res:Response) => {
    const handler = new FileHandler();
    const { parentDirectoryId, fileName, deleteExistingPermission, refreshToken} = req.body;
    const data = await handler.createGoogleDoc(
        parentDirectoryId,
        fileName,
        deleteExistingPermission,
        refreshToken
    );
    res.json(data);
}

const createGoogleSheet = async(req: Request, res: Response) =>{
    const handler = new FileHandler();
    const { parentDirectoryId, fileName, deleteExistingPermission, refreshToken} = req.body;
    const data = await handler.createGoogleSheet(
        parentDirectoryId,
        fileName,
        deleteExistingPermission,
        refreshToken
    );
    res.json(data);
}

const createGoogleSlide = async(req: Request, res: Response) =>{
    const handler = new FileHandler();
    const { parentDirectoryId, fileName, deleteExistingPermission, refreshToken} = req.body;
    const data = await handler.createGoogleSlide(
        parentDirectoryId,
        fileName,
        deleteExistingPermission,
        refreshToken
    );
    res.json(data);
}

const copyFile = async(req: Request, res:Response) => {
    const handler = new FileHandler();
    const {fileId, fileName, refreshToken} = req.body;
    const data = await handler.copyFile(fileId, fileName, refreshToken);
    res.json(data);
}

const getFile = async(req: Request, res:Response) => {
    const handler = new FileHandler();
    const {fileId, refreshToken} = req.body;
    const data = await handler.getFile(fileId,refreshToken);
    res.json(data);
}

const renameFile = async(req: Request, res: Response) =>{
    const handler = new FileHandler();
    const {fileId, name, refreshToken} = req.body;
    const data = await handler.renameFile(fileId,name,refreshToken);
    res.json(data);
}

const deleteFile = async (req: Request, res: Response) => {
    const {file, refreshToken} = req.body
    const handler = new FileHandler();
    const data = await handler.deleteFile(file,refreshToken)
    res.json(data);
}

FileEndpoint.post('/upload/',parseFiles,uploadFile);
FileEndpoint.post('/upload/googledoc',createGoogleDoc);
FileEndpoint.post('/upload/googlesheet',createGoogleSheet);
FileEndpoint.post('/upload/googleslide',createGoogleSlide);
FileEndpoint.patch('/rename',renameFile);
FileEndpoint.post('/get',getFile);
FileEndpoint.post('/copy',copyFile);
FileEndpoint.post('/delete',deleteFile);