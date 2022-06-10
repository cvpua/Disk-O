import axios from 'axios';


const permissionValue: any = {
    'writer': 2,
    'commenter': 1,
    'reader': 0
};

const fetchAccesses = async(fileId:string) =>{
    const res = await axios.get(`api/access/file/${fileId}`);
    return res.data;
}

const fetchRoleFileAccess = async(roleId: string, fileId: string) =>{
    const res = await axios.get(`/api/access/role/${roleId}/file/${fileId}`);
    return res.data;
}

const deletePermission = async(file: any, users: [any], refreshToken: string) => {
    
    const res = await axios.post("/api/user/permission/delete",{
        file,
        users,
        refreshToken
    });
    
    return res;
}

const deleteAccess = async(accessId: string) =>{
    const res = await axios.delete(`/api/access/${accessId}`);
    return res;
}

const deleteRoleAccess = async(roleId: string, accessIds: string[]) => {
    const headers = {};
    const data = {accessIds}
    const res = await axios.delete(`/api/role/${roleId}/accessList`,{
        headers,data
    });
    return res;
}

const updatePermission = async( file: any, users: [any], permission: string, refreshToken: any ) => {
    const res = await axios.post("/api/user/permission/update",{
        file,
        users,
        permission,
        refreshToken
    });
    
    return res.data;
    
}

const fetchDirectoryContent = async(directoryId: string, forNavBar:boolean, refreshToken: string) => { 
    const res = await axios.post("/api/directory/fetch",{
        parentDirectoryId: directoryId,
        forNavBar,
        refreshToken
    });
    
    return res;
  }

const removeAccessRecursively = async(file:any, parentPermissionType: string,role:any,accessIdsToDelete: string[], refreshToken: string) =>{
    const { data } = await fetchDirectoryContent(file.id,false,refreshToken);
    const directoryList = data;
    
    const accessIds = Promise.all(directoryList.map(async (file:any) =>{
        let accessIds: any = [];
        const roleAccess: any = await fetchRoleFileAccess(role._id,file.id);
        if((roleAccess && !roleAccess.isDirectlyEdited) || (roleAccess && roleAccess.isDirectlyEdited && 
            permissionValue[roleAccess.permissionType] < permissionValue[parentPermissionType])){
            if(file.mimeType === 'application/vnd.google-apps.folder' && file.permissions.length > 1){
                accessIds = await removeAccessRecursively(file,roleAccess.permissionType,role,accessIdsToDelete,refreshToken);
            }
            if(file.permissions.length > 1){
                accessIdsToDelete.push(roleAccess._id);
                
                role.listOfAccess = role.listOfAccess.filter((access: any) => access._id !== roleAccess._id);
                
                await deleteAccess(roleAccess._id);
                return [...accessIds,roleAccess._id];
            }
            return accessIds;
        }
        return accessIds;
    }));
    return accessIds;
}

export const remove = async(toDeletePermission:[], toUpdatePermission:[],refreshToken:string) =>{
    
    const roleIdsToDelete = toDeletePermission.map((permission:any) => permission.role._id);
    
    toDeletePermission.forEach(async(permission:any) => {
        const users = permission.users;
        const file = permission.file;
        const role: any = permission.role;
        const fileAccesses = await fetchAccesses(file.id); 
        const roleAccess = fileAccesses.filter((access:any) => role._id === access.roleId && file.id === access.fileId);
        users.map(async(user:any) => {
            
            const userRoles = user.roles;
            let otherAccesses = fileAccesses.filter((fileAccess:any) => userRoles.includes(fileAccess.roleId));
            const currentAccess: any = otherAccesses.filter((access:any) => access.roleId === role._id);
            
            otherAccesses = otherAccesses.filter((access:any) => access.roleId !== role._id && !roleIdsToDelete.includes(access.roleId));
            // otherAccesses = otherAccesses.filter((access:any) => access.roleId !== role._id )
            
            const file = {
                id: currentAccess[0].fileId,
                owners: permission.file.owners
            }
            
            if(!otherAccesses.length){
                await deletePermission(file,[user],refreshToken);
            }else{
                let shouldUpdate = true;
                const currentPermission = currentAccess[0].permissionType;
                let newPermission: string;
                otherAccesses.forEach((access:any) =>{
                    
                    const toUpdateAccessIds = toUpdatePermission.map((access:any)=> access.accessId);
                    if(permissionValue[access.permissionType] >= permissionValue[currentPermission]) shouldUpdate = false;
                    else if(permissionValue[access.permissionType] < permissionValue[currentPermission] && toUpdateAccessIds.includes(access._id)) shouldUpdate = false;
                    else newPermission = access.permissionType;
                });
                if(shouldUpdate){
                    await updatePermission(file,[user],newPermission,refreshToken);
                }   
            }
            
        });
        const accessIdsToDelete: any = [];
        const accessToBeDeleted = {roleId: permission.role._id, accessId: roleAccess[0]._id}
        await deleteAccess(accessToBeDeleted.accessId);
        await deleteRoleAccess(accessToBeDeleted.roleId,accessToBeDeleted.accessId);
        if(permission.file.mimeType === 'application/vnd.google-apps.folder'){
            removeAccessRecursively(
                permission.file,
                roleAccess[0].permissionType,
                role,
                accessIdsToDelete,
                refreshToken
            ).then((res:any)=>{
                
                deleteRoleAccess(accessToBeDeleted.roleId,accessIdsToDelete);
            });
            
        }
    });
}