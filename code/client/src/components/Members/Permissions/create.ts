import axios from "axios";




const createPermission = async(file: any, users: string[], permission: string, checkboxIndex : number, refreshToken: string) => {
    const res = await axios.post("/api/user/permission/create",{
        file,
        users,
        permission,
        refreshToken
    });
    
    return res.data;
}

const createAccess = async(file: any,permissionType: string, roleId:string,isDirectlyEdited: boolean, checkboxStatus: any) =>{
    const res = await axios.post("/api/access/create",{
        fileName: file.name,
        fileId: file.id,
        roleId,
        permissionType,
        isDirectlyEdited,
        checkboxStatus
    });
    
    return res.data;
}

const fetchRoleFileAccess = async(roleId: string, fileId: string) =>{
    const res = await axios.get(`/api/access/role/${roleId}/file/${fileId}`);
    return res.data;
}

const updateRoleAccessList = async(roleId: string, accessIds:string[]) => {

    const res = await axios.patch(`/api/role/accessList/${roleId}/add`,{
        accessIds
    });
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

const fetchDirectoryContent = async(directoryId: string, forNavBar:boolean, refreshToken: string) => { 
    const res = await axios.post("/api/directory/fetch",{
        parentDirectoryId: directoryId,
        forNavBar,
        refreshToken
    });
    
    return res;
}

const createAccessRecursively = async(
        file: any, 
        users: any, 
        permissionType: string, 
        roleListCopy: any,
        roleId: string,
        permissionIndex: number, 
        checkboxesState: any, 
        newAccesses: any,
        refreshToken: string
    
    ) => {
    const { data } = await fetchDirectoryContent(file.id,false,refreshToken);
    const directoryList = data;
    
    const accessIds: any = Promise.all(directoryList.map(async(file: any) => {
        let otherAccesses : any = [];
        const existingAccess = await fetchRoleFileAccess(roleId,file.id);
        // if( existingAccess && !existingAccess.isDirectlyEdited){
        //     updateAccess(existingAccess.permissionType,existingAccess.accessId,true,existingAccess.checkboxStatus);
        // }
        if(!existingAccess){
            if(file.mimeType === 'application/vnd.google-apps.folder'){
                otherAccesses = await createAccessRecursively(file,users,permissionType,roleListCopy,roleId,permissionIndex,checkboxesState,newAccesses,refreshToken);
            }
            const newAccess: any = await createAccess(file,permissionType,roleId,false,checkboxesState);
            newAccesses.push(newAccess._id);
            roleListCopy[permissionIndex].listOfAccess.push({
                _id: newAccess._id,
                roleId: newAccess.roleId,
                fileId: newAccess.fileId
            });
            return [...otherAccesses,newAccess._id];
        }
        return otherAccesses;
    }));
    return accessIds;
}

export const create = async(toCreatePermission:[], roleListCopy: any, checkboxesState: any,refreshToken:string) =>{
    let writer: any = [];
    let commenter: any = [];
    let reader: any = [];
    toCreatePermission.forEach((permission:any) =>{
        if(permission.type === 'writer'){
            writer.push(...permission.users);
        } 
        if(permission.type === 'commenter'){
            commenter.push(...permission.users)
        }
        if(permission.type === 'reader'){
            reader.push(...permission.users);
        }
    });
    
    writer = writer.map((user:any) => ({emailAddress: user.emailAddress}));
    commenter = commenter.map((user:any) => ({emailAddress: user.emailAddress}));
    reader = reader.map((user:any) => ({emailAddress: user.emailAddress}));

    commenter = commenter.filter((user:any) => !writer.find((anotherUser: any)=> user.emailAddress === anotherUser.emailAddress ));

    reader = reader.filter((user:any) => !writer.find((anotherUser: any)=> user.emailAddress === anotherUser.emailAddress ));
    reader = reader.filter((user:any) => !commenter.find((anotherUser: any)=> user.emailAddress === anotherUser.emailAddress ));

    const users: any ={
        writer,
        commenter,
        reader
    }

    
    toCreatePermission.map(async(permission:any) =>{
        const newPermission = await createPermission(permission.file, users[permission.type], permission.type, permission.index,refreshToken);
        const newAccess = await createAccess(permission.file,permission.type,permission.roleId,true,checkboxesState[permission.index]);
        const updateRole = await updateRoleAccessList(roleListCopy[permission.index]._id, [newAccess._id]);
        roleListCopy[permission.index].listOfAccess.push({
            _id: newAccess._id,
            roleId: newAccess.roleId,
            fileId: newAccess.fileId
        });
        const newAccesses: any = [];
        if(permission.file.mimeType === 'application/vnd.google-apps.folder'){
            createAccessRecursively(
                permission.file,
                users[permission.type],
                permission.type,
                roleListCopy,
                permission.roleId,
                permission.index,
                checkboxesState[permission.index],
                newAccesses,
                refreshToken
            ).then((res: any) => {
                updateRoleAccessList(roleListCopy[permission.index]._id, newAccesses);
            });
        }
    })
}