import React, {useState, useEffect, useContext, useRef} from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import axios from "axios";
import { myContext } from '../../../Context';


const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

const Create = (props: any) => {
    const userObject: any = useContext(myContext);
    const {
        setOpenCreate,
        openCreate,
        diskODetails,
        currentDirectory,
        currentDirectoryList,
        currentMainDirectory,
        setCurrentDirectory,
        setCurrentDirectoryList,
        setCurrentMainDirectory,
        setCurrentLocation,
        fetchChildDirectoryContent,
        currentUser,
        setCurrentUser,
        setRoleList,
        roleList
    } = props;
    
    const [name,setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        let newName = event.target.value;
        setName(newName.trim());

    }
    
    const initRoles = async(mainFolderId: string, ) => {
        const res = await axios.post("/api/role/init",{
            mainFolderId,
            name: 'Member',
            userId: currentUser._id
        })
        return res.data;
    }

    const updateUserRoles = async(userId: string, roleId: string) => {
        const res = await axios.patch(`/api/user/${userId}/add/role`,{
            roleId
        });
        return res;
    }

    const addUserPermissionId = async(users:any[]) =>{
        
        const res = await axios.patch('/api/user/permissionId/add',{
            users
        });
        
        return res.data;
    }

    const createDirectory = async() =>{
        let file: any;
        let folderName = name; 
        if(folderName === '') folderName = 'New Folder';
        const res = await axios.post("/api/directory/create",{
            refreshToken: userObject.refreshToken,
            directoryName : 'Disk-O ' + folderName,
            parentDirectoryId: diskODetails.id,
            deleteExistingPermission : false
        });
        file = res.data;
        
        const memberRole = await initRoles(file.id);
        await updateUserRoles(currentUser._id,memberRole._id);
        if(!currentUser.permissionId){
            await addUserPermissionId(file.permissions);
            setCurrentUser({...currentUser,permissionId : file.permissions[0].id});
            
        }
        
        return file;
    }

   

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

    const updateRoleAccessList = async(roleId: string, accessIds:string[]) => {

        const res = await axios.patch(`/api/role/accessList/${roleId}/add`,{
            accessIds
        });
        return res.data;
        
    }

    const inheritAccess = async(accesses: any,file: any) =>{
        const roleListReference = roleList.map((role : any) => {
            return role;
        });
        accesses.forEach(async(access:any) =>{
            const newAccess = await createAccess(
                file,
                access.permissionType,
                access.roleId,
                access.checkboxStatus
            );
            await updateRoleAccessList(newAccess.roleId,[newAccess._id]); //updates in db
            const role = roleListReference.find((role: any)=> role._id === newAccess.roleId); // updates locally
            role.listOfAccess.push({
                _id: newAccess._id,
                fileId: newAccess.fileId,
                roleId: newAccess.roleId
            });
        
        });
        setRoleList(roleListReference);
    }

    const createHandler = async() => {
        setIsCreating(true);
        const file = await createDirectory();
        // const parentAccesses = await fetchAccesses(currentMainDirectory.id);
        
        // if(parentAccesses.length){
        //     await inheritAccess(parentAccesses,file);
        // }
        
        if(currentDirectoryList.length === 0){
            setCurrentDirectory(file);
            setCurrentMainDirectory(file);
            let directory = file;
            directory.name = directory.name.replace("Disk-O","");
            setCurrentLocation([directory]);
            fetchChildDirectoryContent(file,false);
        }
        const newDirectoryList = [...currentDirectoryList,{
            id:file.id,
            name:file.name,
            mimeType:file.mimeType,
            owners: file.owners,
            createdTime: file.createdTime,
            iconLink: file.iconLink,
            permissions: file.permissions
        }];
        newDirectoryList.sort((file1:any,file2:any) => {
            
            let fileName1 = file1.name.toLowerCase();
            let fileName2 = file2.name.toLowerCase();
            
            if(fileName1 <  fileName2){
                return -1;
            }
            if(fileName1 > fileName2){
                return 1;
            }
            return 0;
        });
        
        
        
        
        setCurrentDirectoryList(newDirectoryList);
        setIsCreating(false);
        setOpenCreate(false);

        


    }

    return(
        <div>
        <Modal
                open={openCreate}
                onClose={() =>{setOpenCreate(false)}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    MainFolder
                </Typography>
                <TextField  
                    fullWidth 
                    id="outlined-basic" 
                    label="Folder Name" 
                    variant="outlined" 
                    onChange={handleChange}
                    />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    marginTop: '10px',
                }}>
                    <Button
                        onClick={createHandler} 
                        variant="contained"
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                </Box>  
            </Box>
        </Modal>
        </div>
    );
}

export default Create;