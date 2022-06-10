import axios from 'axios';


const permissionValue: any = {
    'writer': 2,
    'commenter': 1,
    'reader': 0
};


const createAccess = async(file: any,permissionType: string, roleId:string, checkboxStatus: any) =>{
    const res = await axios.post("/api/access/create",{
        fileName: file.name,
        fileId: file.id,
        roleId,
        permissionType,
        checkboxStatus
    });
    
    return res.data;
}

const fetchAccesses = async(fileId:string) =>{
    const res = await axios.get(`api/access/file/${fileId}`);
    return res.data;
}

const fetchRoleFileAccess = async(roleId: string, fileId: string) =>{
    const res = await axios.get(`/api/access/role/${roleId}/file/${fileId}`);
    return res.data;
}

const updateAccess = async(permissionType: string, accessId: string, isDirectlyEdited: boolean, checkboxStatus: any) =>{
    
    const res = await axios.patch(`/api/access/${accessId}/update`,{
        permissionType,
        checkboxStatus,
        isDirectlyEdited
    });
    
    return res.data;
}


const updatePermission = async( file: any, users: [any], permission: string, refreshToken: string ) => {
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

const editAccessRecursively = async(file:any, roleId: string, permissionType: string, checkboxesState: any, refreshToken: string) =>{
    const { data } = await fetchDirectoryContent(file.id,false,refreshToken);
    const  directoryList = data;
    
    directoryList.map(async(file:any) => {
        if(file.mimeType === 'application/vnd.google-apps.folder'){
            await editAccessRecursively(file,roleId,permissionType,checkboxesState,refreshToken);
        }

        let access = await fetchRoleFileAccess(roleId,file.id);
        
        if(!access) await createAccess(file,permissionType,roleId,checkboxesState);
        
        await updateAccess(permissionType, access._id,false, checkboxesState);
    });
}


export const edit = async(toUpdatePermission: any,roleList:any, checkboxesState: any, refreshToken: string) =>{
    toUpdatePermission.forEach(async(permission:any) => {
        let usersEmail = permission.users.map((user:any) => user.emailAddress);
        let removedEmails: any = [];
        let otherUsersToUpdate: any = [];
        const otherUpdate: any = {
            users: [],
            permission: '',
            file: permission.file
        }
        const roleId = roleList[permission.index]._id;
        const fileId = permission.file.id;

        const accesses = await fetchAccesses(fileId); //Will fetch all roles that has access to the file
        const initialAccessState = accesses.find((access:any)=> access._id === permission.accessId); //Will fetch the initial state of the role
        
        accesses.forEach((access:any) =>{

            // Will check if the access in the db will also be updated
            // If yes, the state that will be used is the one stored in local else in the mongodb
            let isAccessWillBeUpdated = toUpdatePermission.find((update: any) => 
                update.accessId === access._id
            ); 
            let accessType = access.permissionType; //Use the one stored in mongodb
            if(isAccessWillBeUpdated) accessType = isAccessWillBeUpdated.type; // Use the one stored in local

            //If the user exists on other roles that has higher permission compared to the new permission, the user will be filtered out 
            if(access._id !== permission.accessId && permissionValue[accessType] > permissionValue[permission.type]){
                const role = roleList.filter((role:any) => role._id === access.roleId);
                const roleUsers = role[0].users;
                const roleUsersEmail = roleUsers.map((role:any)=> role.emailAddress);
                
                removedEmails = usersEmail.filter((email:string) => roleUsersEmail.includes(email));
                usersEmail = usersEmail.filter((email:string) => !roleUsersEmail.includes(email));
                
                
                // Give users another update if they have higher permission existing in another roles
                if(removedEmails.length > 0 && permissionValue[initialAccessState.permissionType] > permissionValue[accessType]){
                    otherUsersToUpdate = permission.users.filter((user:any) =>removedEmails.includes(user.emailAddress));
                    otherUpdate.permission = accessType;
                    otherUpdate.users = otherUsersToUpdate;
                }

                // Removes user if they already have the permission
                if(removedEmails.length > 0 && permissionValue[initialAccessState.permissionType] === permissionValue[accessType]){
                    otherUsersToUpdate = otherUsersToUpdate.filter((user:any) =>usersEmail.includes(user));
                    otherUpdate.users = otherUsersToUpdate;
                }
                permission.users = permission.users.filter((user:any) => usersEmail.includes(user.emailAddress));
            }
        });
        

        await updateAccess(permission.type, permission.accessId, true, checkboxesState[permission.index]);
        if(otherUpdate.users.length) 
            await updatePermission(otherUpdate.file,otherUpdate.users,otherUpdate.permission,refreshToken);
        if(permission.users.length) 
            await updatePermission(permission.file, permission.users, permission.type,refreshToken);
        if(permission.file.mimeType === 'application/vnd.google-apps.folder'){   
            await editAccessRecursively(permission.file, permission.roleId,permission.type, checkboxesState[permission.index], refreshToken);
        }
    });
}