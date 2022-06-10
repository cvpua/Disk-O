import { RoleHandler } from '../handlers';
import { Response, Request, Router } from 'express';


export const RoleEndpoint = Router();


const initRoles = async (req: Request, res: Response) => {
    const handler = new RoleHandler();
    const {mainFolderId,name,userId} = req.body;
    const data: any = await handler.initRoles(mainFolderId,name,userId);
    res.json(data);
}


const getRoles = async( req: Request, res: Response) => {
    
    const mainFolderId = req.params.mainFolderId
    const handler = new RoleHandler();
    const data : any = await handler.getRoles(mainFolderId);

    res.json(data);

}

const createRole = async (req: Request, res: Response) => {
    const handler = new RoleHandler();
    const {mainFolderId,name} = req.body;
    const data: any = await handler.createRole(mainFolderId,name);
    res.json(data);
}

const deleteRole = async (req: Request, res: Response) => {
    const handler = new RoleHandler();
    const roleId = req.params.roleId;
    const data: any = await handler.deleteRole(roleId);
    res.json(data);
}

const patchRoleUsers = async (req: Request, res:Response) => {
    const handler = new RoleHandler();
    const { userIds } = req.body;
    const { roleId } = req.params;
    const data: any = await handler.patchRoleUsers(roleId,userIds);
    res.json(data);
}

const addRoleAccess = async (req: Request, res: Response) =>{
    const handler = new RoleHandler();
    const { accessIds } = req.body;
    const { roleId  }   = req.params;
    const data: any = await handler.addRoleAccess(roleId,accessIds);
    res.json(data);
}

const deleteMainFolderRoles = async(req: Request, res: Response) =>{
    const handler = new RoleHandler();
    const { mainFolderId } = req.params;
    const data: any = await handler.deleteMainFolderRoles(mainFolderId);
    res.json(data);
}

const deleteRoleAccess = async(req: Request, res: Response) =>{
    const handler = new RoleHandler();
    const { roleId } = req.params;
    const { accessIds } = req.body;
    const data: any = await handler.deleteRoleAccess(roleId, accessIds);
    res.json(data);
}

const deleteRoleUser = async(req: Request, res: Response) => {
    const handler = new RoleHandler();
    const { roleId, userId } = req.params;
    const data: any = await handler.deleteRoleUser(roleId,userId);
    res.json(data);
}


RoleEndpoint.post('/init',initRoles);
RoleEndpoint.get('/get/:mainFolderId',getRoles);
RoleEndpoint.post('/create',createRole);
RoleEndpoint.delete('/delete/:roleId',deleteRole);
RoleEndpoint.patch('/update/:roleId',patchRoleUsers)
RoleEndpoint.patch('/accessList/:roleId/add',addRoleAccess);
RoleEndpoint.delete('/mainFolder/:mainFolderId',deleteMainFolderRoles);
RoleEndpoint.delete('/:roleId/accessList',deleteRoleAccess);
RoleEndpoint.delete('/:roleId/user/:userId', deleteRoleUser);