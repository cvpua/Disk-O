import { AccessHandler } from '../handlers';
import { Response, Request, Router } from 'express';




export const AccessEndpoint = Router();


const createAccess = async(req: Request, res: Response) =>{
    const handler = new AccessHandler();
    const { permissionType, fileName, fileId, roleId, checkboxStatus,isDirectlyEdited } = req.body;
    const data : any = await handler.createAccess(permissionType,fileName,fileId,roleId,isDirectlyEdited,checkboxStatus);
    res.json(data);
}

const fetchAccess = async(req: Request, res: Response) =>{
    const handler = new AccessHandler();
    const { accessId } = req.params;
    const data : any = await handler.fetchAccess(accessId);
    res.json(data);
}

const fetchAccesses = async(req: Request, res: Response) =>{
    const handler= new AccessHandler();
    const { fileId } = req.params;
    const data: any = await handler.fetchAccesses(fileId);
    res.json(data);
}

const updateAccess = async(req: Request, res: Response) =>{
    const handler = new AccessHandler();
    const{ permissionType, isDirectlyEdited, checkboxStatus} = req.body;
    const{ accessId } = req.params;
    const data: any = await handler.updateAccess(permissionType, accessId,isDirectlyEdited, checkboxStatus);
    res.json(data);
}

const fetchRoleAccesses = async(req: Request, res: Response) => {
    const handler = new AccessHandler();
    const { roleId } = req.params;
    const data: any = await handler.fetchRoleAccesses(roleId);
    res.json(data);
}

const fetchRoleFileAccess = async(req: Request, res: Response) =>{
    const handler = new AccessHandler();
    const { roleId, fileId } = req.params;
    const data: any = await handler.fetchRoleFileAccess(roleId,fileId);
    res.json(data);
}

const deleteRoleAccess = async(req: Request, res: Response) =>{
    const handler = new AccessHandler();
    const { roleId } = req.params;
    const data: any = await handler.deleteRoleAccess(roleId);
    res.json(data);
}

const deleteFileAccess = async(req: Request, res: Response) =>{
    const handler = new AccessHandler();
    const { fileId } = req.params;
    const data: any = await handler.deleteFileAccess(fileId);
    res.json(data);
}

const deleteAccess = async(req: Request, res:Response) => {
    const handler = new AccessHandler();
    const { accessId } = req.params;
    const data: any = await handler.deleteAccess(accessId);
    res.json(data);
}

const deleteFileAndRoleAccess = async(req: Request, res: Response) => {
    const handler = new AccessHandler();
    const {roleId, fileId} = req.params;
    const data: any = await handler.deleteFileAndRoleAccess(fileId,roleId);
    res.json(data);
}

AccessEndpoint.post("/create",createAccess);
AccessEndpoint.get("/:accessId",fetchAccess);
AccessEndpoint.get("/file/:fileId",fetchAccesses);
AccessEndpoint.get("/role/:roleId",fetchRoleAccesses);
AccessEndpoint.get("/role/:roleId/file/:fileId",fetchRoleFileAccess);
AccessEndpoint.patch("/:accessId/update",updateAccess);
AccessEndpoint.delete("/role/:roleId",deleteRoleAccess);
AccessEndpoint.delete("/file/:fileId",deleteFileAccess);
AccessEndpoint.delete("/:accessId",deleteAccess); //di pa to nagagamit
AccessEndpoint.delete("/file/:fileId/role/:roleId",deleteFileAndRoleAccess);
