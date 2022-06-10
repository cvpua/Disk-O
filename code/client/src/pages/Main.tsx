import axios from "axios";
import React,{useContext, useState} from "react";
import { myContext } from "../Context";
import Content from "../components/Directory/Content";
import ColumnNames from "../components/Directory/ColumnNames";
import Create from "../components/Directory/Directory/Create";
import './Upload.css';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fab from '@mui/material/Fab';
import AddIcon from '@material-ui/icons/Add';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery  from "@mui/material/useMediaQuery";


const Main = (props:any) => {

    const {
        currentDirectory,
        currentDirectoryList,
        setCurrentDirectoryList,
        fetchChildDirectoryContent,
        setCurrentLocation,
        currentLocation,
        roleList,
        setRoleList,
        deleteFile,
        currentMainDirectory,
        currentUserPermission,
        setIsLoading
    } = props;
    const userObject: any = useContext(myContext);
    const [openCreate, setOpenCreate] = useState(false);
    const [file, setFile] = useState<any>();
    const [mimeType, setMimeType] = useState("");
    const [uploadButtonMenu, setUploadButtonMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
      } | null>(null);
    
    const isVisible = useMediaQuery("(min-width: 600px)");
    const handleUploadButton = (event: React.MouseEvent) => {
        event.preventDefault();
        setUploadButtonMenu(
            uploadButtonMenu === null
            ? {
                mouseX: event.clientX - 2,
                mouseY: event.clientY - 4,
                }
            : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                // Other native context menus might behave different.
                // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    }


    const handleCloseUploadButton = () => {
        setUploadButtonMenu(null);
    }

    const fetchAccesses = async(fileId:string) =>{
        const res = await axios.get(`api/access/file/${fileId}`);
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

    const handleUploadFile = async(event: React.ChangeEvent<HTMLInputElement>) =>{
        handleCloseUploadButton();
        setFile(event.target.files[0]);
        const file = event.target.files[0];
        const deleteExistingPermission = currentDirectory.id === currentMainDirectory.id ? true : false;
        const formData = new FormData();
        formData.append('parentDirectoryId',currentDirectory.id);
        formData.append('refreshToken',userObject.refreshToken);
        formData.append('deleteExistingPermission', deleteExistingPermission.toString());
        formData.append('FILE', file);
        
        const res = await axios.post(`/api/file/upload`,formData,{
            headers: {
                'Content-Type' : "multipart/form-data; boundary=<calculated when request is sent>"
            }
        });
        const newFile = res.data.data;
        
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
            thumbnailLink: newFile.thumbnailLink
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
         
    }

    const disableButton = () =>{
        if(currentUserPermission.permissionType === 'writer' || currentUserPermission.permissionType === 'owner'){
            return false;
        }
        return true;
    }


    const getFile = async(fileId: string) => {
        const res = await axios.post('/api/file/get',{
            fileId,
            refreshToken: userObject.refreshToken
        });

        return res.data.data;
    }

    const handleOpenCreate = (mimeType: string) => {
        setMimeType(mimeType);
        setOpenCreate(true);
        setUploadButtonMenu(null);
    }

    const openFile = (url:string) =>{
        window.open(url);
    }

    const handlerLeftClick = async(file: any) =>{
        if(file.mimeType !== 'application/vnd.google-apps.folder'){
            const fetchedFile: any = await getFile(file.id);
            openFile(fetchedFile.webViewLink);
        }else{
            setIsLoading(true)
            setCurrentLocation([...currentLocation,file]);
            fetchChildDirectoryContent(file,false);
        }
        
    }


    return(
        <Box sx={{
            position: 'relative',
            height: '85vh',
            marginLeft : !isVisible ? '0' :  '250px',
            marginRight: !isVisible ? '0' :  '250px'
            
        }}>
            { 
               currentMainDirectory.id &&
               currentDirectoryList.length === 0 && 
               <Box sx={{
                    height: '80vh',
                    display: 'flex',
                    alignItems:'center',
                    justifyContent: 'center'
                }}>
                    <Typography
                        variant="h2"
                        color='lightgray'
                    >
                        This folder is empty
                    </Typography>
                </Box>
            }
            {   currentMainDirectory.id && 
                currentDirectoryList.length !== 0 &&
                <Box>
                    <ColumnNames/>
                    <Content
                        setCurrentDirectoryList={setCurrentDirectoryList}
                        currentDirectoryList={currentDirectoryList}
                        fetchChildDirectoryContent={fetchChildDirectoryContent}
                        roleList={roleList}
                        setRoleList={setRoleList}
                        deleteFile={deleteFile}
                        handlerLeftClick ={handlerLeftClick}
                        currentMainDirectory={currentMainDirectory}
                        currentUserPermission={currentUserPermission}
                        currentDirectory={currentDirectory}
                    />
                </Box>
            }
            {
                currentMainDirectory.id &&
                currentDirectory &&
                <Box sx={{
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        paddingRight: '2%',
                        marginTop: '5%',
                        position: 'absolute',
                        bottom:'10px',
                        right:'10px'
                    }}>
                    <Fab color="primary" aria-label="add" 
                        onClick={handleUploadButton}
                        onContextMenu={handleUploadButton}    
                    >
                        <AddIcon />
                    </Fab>
                </Box>
            }

            {
                openCreate && 
                <Create
                    setOpenCreate={setOpenCreate}
                    openCreate={openCreate}
                    currentDirectory={currentDirectory}
                    currentDirectoryList={currentDirectoryList}
                    currentMainDirectory={currentMainDirectory}
                    setCurrentDirectoryList={setCurrentDirectoryList}
                    purpose = {'SubFolder'}
                    setRoleList={setRoleList}
                    setPeople={''}
                    people={''}
                    roleList={roleList}
                    mimeType={mimeType}
                />
            }
            {uploadButtonMenu && 
            <Menu
                open={uploadButtonMenu !== null}
                onClose={handleCloseUploadButton}
                anchorReference="anchorPosition"
                anchorPosition={
                    uploadButtonMenu !== null
                    ? { top: uploadButtonMenu.mouseY, left: uploadButtonMenu.mouseX }
                    : undefined
                }
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                  }}
                transformOrigin={{
                vertical: 'center',
                horizontal: 'right',
                }}
                >
                <MenuItem onClick={()=>{handleOpenCreate('folder')}} disabled={disableButton()}>Create Folder</MenuItem>
                <MenuItem disabled={disableButton()}>
                <label className="custom-file-upload">
                    <input type="file" onChange={handleUploadFile}/>
                    Upload File
                </label>
                </MenuItem>
                <MenuItem onClick={()=>{handleOpenCreate('googleDoc')}} disabled={disableButton()}>Create Google Docs</MenuItem>
                <MenuItem onClick={()=>{handleOpenCreate('googleSheet')}} disabled={disableButton()}>Create Google Sheets</MenuItem>
                <MenuItem onClick={()=>{handleOpenCreate('googleSlide')}} disabled={disableButton()}>Create Google Slides</MenuItem>
            </Menu>
            } 
        </Box>
    )
}

export default Main;