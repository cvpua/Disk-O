import { Response, Request, Router } from 'express';
import { UserHandler } from '../handlers';

export const UserEndpoint = Router();


const addUser = async(req:Request,res:Response) =>{
    const handler = new UserHandler();
    const { mainDirectoryId, role, type, emailAddresses, deleteExistingPermission, refreshToken } = req.body;
    const data : any = await handler.addUser(mainDirectoryId, role, type, emailAddresses, deleteExistingPermission, refreshToken);
    res.json(data);
}

const createPermission = async(req: Request, res: Response) => {
    const handler = new UserHandler();
    const { file, users, permission, type, refreshToken } = req.body;
    const data: any = await handler.createPermission(file, users, permission, refreshToken);
    res.json(data);

}

const updatePermisison = async(req: Request, res: Response) => {
    const handler = new UserHandler();
    const { file, users, permission, refreshToken } = req.body;
    const data: any = await handler.updatePermission(file, users, permission, refreshToken);
    res.json(data);

}

const deletePermission = async (req:Request, res:Response) => {
    const handler = new UserHandler();
    const{ file, users, refreshToken} = req.body;
    const data: any = await handler.deletePermission(file, users, refreshToken);
    res.json(data);
}

const fetchUser = async (req: Request, res: Response) => {
    const handler = new UserHandler();
    const { emailAddresses, permissions} = req.body;
    const data: any = await handler.fetchUser(emailAddresses,permissions);
    res.json(data);
}

const addUserRoles = async ( req: Request, res: Response) => {
    const handler = new UserHandler();
    const { roleId } = req.body;
    const { userId } = req.params;
    const data: any = await handler.addUserRoles(userId,roleId);
    res.json(data);
}

const addUserPermissionId = async (req: Request, res: Response) => {
    const handler = new UserHandler();
    const { users } = req.body;
    const data : any = await handler.addUserPermissionId(users);
    res.json(data);
}

const deleteUserRole = async (req: Request, res: Response) => {
    const handler = new UserHandler();
    const {userId, roleId} = req.params;
    const data: any = await handler.deleteUserRole(userId,roleId);
    res.json(data);
}

const deleteBatchUserRole = async (req: Request, res: Response) => {
    const handler = new UserHandler();
    const { userId } = req.params;
    const { roleIds } = req.body;
    const data: any = await handler.deleteBatchUserRole(userId,roleIds);
    res.json(data);
}

UserEndpoint.post('/add',addUser);
UserEndpoint.post('/permission/create',createPermission);
UserEndpoint.post('/permission/update',updatePermisison);
UserEndpoint.post('/permission/delete',deletePermission);
UserEndpoint.post('/fetch', fetchUser);
UserEndpoint.patch('/:userId/add/role',addUserRoles);
UserEndpoint.patch('/permissionId/add',addUserPermissionId);
UserEndpoint.delete('/:userId/role/:roleId',deleteUserRole);
UserEndpoint.delete('/:userId/role',deleteBatchUserRole);