import { DirectoryHandler } from '../handlers';
import { Response, Request, Router } from 'express';


export const DirectoryEndpoint = Router();

// To do: Convert post functions (if necessary) to get once proper handling of token is done.


const createDirectory =async (req:Request, res: Response) => {
    const handler = new DirectoryHandler();
    const { parentDirectoryId, directoryName, refreshToken, deleteExistingPermission } = req.body;
    const data = await handler.createDirectory(parentDirectoryId, directoryName, deleteExistingPermission, refreshToken );
    res.json(data);
}

const fetchDirectory = async(req:any, res:Response) => {
    const handler = new DirectoryHandler();
    const refreshToken = req.user?.refreshToken || '';
    const { parentDirectoryId, forNavBar} = req.body;
    const data : any = await handler.fetchDirectory(parentDirectoryId,forNavBar, refreshToken);
    res.json(data);
}

const initializeApp = async(req: Request, res: Response) => {
    const handler = new DirectoryHandler();
    const { refreshToken } = req.body;
    const data: any = await handler.initializeApp(refreshToken);
    res.json(data);
}

// const createPermission = async (req:Request, res:Response) => {
//     const handler = new DirectoryHandler();
//     const{ directoryId,role,type,emailAddress, refreshToken } = req.body;
//     const data: any = await handler.createPermission(directoryId, role, type, emailAddress, refreshToken);
//     res.json(data);
// }

const getPermissionList = async(req:Request, res:Response) => {
    const handler = new DirectoryHandler();
    const { directoryId, refreshToken } = req.body;
    const data: any = await handler.getPermissionList(directoryId, refreshToken);
    res.json(data);
}

const getPermission = async(req: any, res:Response) => {
    const handler = new DirectoryHandler();
    const refreshToken = req.user?.refreshToken || '';
    const {directoryId, permissionId } = req.params;
    const data: any = await handler.getPermission(directoryId,permissionId,refreshToken);
    res.json(data);
}

const deletePermission = async (req:Request, res:Response) => {
    const handler = new DirectoryHandler();
    const{ permissionId, directoryId, refreshToken} = req.body;
    const data: any = await handler.deletePermission(permissionId, directoryId, refreshToken);
    res.json(data);
}

const updatePermisison = async( req: Request, res:Response) => {
    const handler = new DirectoryHandler();
    const { directoryId, permissionId, role, refreshToken} = req.body;
    const data: any = await handler.updatePermission(directoryId, permissionId, role, refreshToken);
    res.json(data);
}

const getParentDirectoryId = async ( req: Request, res: Response) =>{
    const handler = new DirectoryHandler();
    const { directoryId, refreshToken } = req.body;
    const data: any = await handler.getParentDirectoryId(directoryId, refreshToken);
    res.json(data);
}


DirectoryEndpoint.post('/create',createDirectory);
DirectoryEndpoint.post('/fetch',fetchDirectory);
DirectoryEndpoint.post('/init',initializeApp);
DirectoryEndpoint.post('/permission/list',getPermissionList);
DirectoryEndpoint.get('/permission/:permissionId/file/:directoryId',getPermission);
DirectoryEndpoint.post('/permission/delete',deletePermission);
DirectoryEndpoint.post('/permission/update',updatePermisison);
DirectoryEndpoint.post('/getParentId',getParentDirectoryId);
