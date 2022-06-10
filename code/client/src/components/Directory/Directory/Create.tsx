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
        setCurrentDirectoryList,
        purpose,
        currentUser,
        setCurrentUser,
        mimeType,
        setRoleList,
        roleList
    } = props;
    
    const [name,setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const createTitle: any = {
        googleDoc : 'Create Google Docs',
        googleSheet: 'Create Google Sheets',
        googleSlide: 'Create Google Slides'
    }

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
    
        const res = await axios.post("/api/directory/create",{
            refreshToken: userObject.refreshToken,
            directoryName : name,
            parentDirectoryId: currentDirectory.id,
            deleteExistingPermission : currentDirectory.id === currentMainDirectory.id ? true: false
        });
        const   file = res.data;
        
        return file;
    }

    const createGoogleDoc = async() => {
        const res = await axios.post("/api/file/upload/googledoc",{
            refreshToken: userObject.refreshToken,
            fileName : name,
            parentDirectoryId: currentDirectory.id,
            deleteExistingPermission : currentDirectory.id === currentMainDirectory.id ? true : false
        });
        return res.data;
    }

    const createGoogleSheet = async() => {
        const res = await axios.post("/api/file/upload/googlesheet",{
            refreshToken: userObject.refreshToken,
            fileName : name,
            parentDirectoryId: currentDirectory.id,
            deleteExistingPermission : currentDirectory.id === currentMainDirectory.id ? true : false
        });
        return res.data;
    }

    const createGoogleSlide = async() => {
        const res = await axios.post("/api/file/upload/googleslide",{
            refreshToken: userObject.refreshToken,
            fileName : name,
            parentDirectoryId: currentDirectory.id,
            deleteExistingPermission : currentDirectory.id === currentMainDirectory.id ? true : false
        });
        return res.data;
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
        let newFile: any;
        
        if(mimeType === 'folder'){
            newFile = await createDirectory();
        }
        else if(mimeType === 'googleDoc'){
            newFile = await createGoogleDoc();
            newFile = newFile.data;
        }

        else if(mimeType === 'googleSheet'){
            newFile = await createGoogleSheet();
            newFile = newFile.data;
        }

        else if(mimeType === 'googleSlide'){
            newFile = await createGoogleSlide();
            newFile = newFile.data;
        }

        const parentAccesses = await fetchAccesses(currentDirectory.id);
        
        if(parentAccesses.length){
            await inheritAccess(parentAccesses,newFile);
        }
        
        const newDirectoryList = [...currentDirectoryList,{
            id:newFile.id,
            name:newFile.name,
            mimeType:newFile.mimeType,
            owners: newFile.owners,
            createdTime: newFile.createdTime,
            modifiedTime: newFile.modifiedTime,
            iconLink: newFile.iconLink,
            size: newFile.size,
            thumbnailLink: newFile.thumbnailLink,
            permissions: newFile.permissions
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
                    {mimeType === 'folder' ? 'Create Folder' : createTitle[mimeType]}
                </Typography>
                <TextField  
                    fullWidth 
                    id="outlined-basic" 
                    label={mimeType === 'folder'? 'Folder Name':'File Name' } 
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
                        {isCreating ? 'Creating...': 'Create'}
                    </Button>
                </Box>  
            </Box>
        </Modal>
        </div>
    );
}

export default Create;