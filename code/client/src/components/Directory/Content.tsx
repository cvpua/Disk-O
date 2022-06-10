import React, {useState, useEffect, useContext, useRef} from "react";
import { myContext } from "../../Context";
import Box from '@mui/material/Box';
import FolderIcon from '@material-ui/icons/Folder';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon  from "@mui/material/ListItemIcon";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ManagePermissions from "../Members/ManagePermissions";
import Delete from './Directory/Delete';
import Rename from './Directory/Rename';
import Copy from './Directory/Copy';





const listChildren = {
    'flex' : 1
}

const DirectoryContent = (props:any) =>{
    const userObject: any = useContext(myContext);
    const {
        setCurrentDirectoryList,
        currentDirectoryList,
        currentDirectory,
        roleList,
        setRoleList,
        handlerLeftClick,
        currentMainDirectory,
        currentUserPermission,
        deleteFile
    } = props;
    
    const [viewModal, setViewModal] = useState(false);
    const [contextMenu, setContextMenu] = React.useState<{
        mouseX: number;
        mouseY: number;
      } | null>(null);
    const [fileOnContextMenu, setFileOnContextMenu] = useState({id:"", permissions:[], mimeType: ""});
    const [openDelete, setOpenDelete] = useState(false);
    const [openRename, setOpenRename] = useState(false);
    const [openCopy, setOpenCopy] = useState(false);
    
    

    const handleContextMenu = (event: React.MouseEvent, file: any) => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
            }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
      );
      
      setFileOnContextMenu(file);
    };
    
    const handleClose = (event: React.MouseEvent) => {
        setContextMenu(null);
      };
    
    const handleEditAccessClick = () => {
        setContextMenu(null);
        setViewModal(true);
    }

    const handleRename = async() =>{
        setContextMenu(null);
        setOpenRename(true);
    }

    const handleCopy = async() =>{
        setContextMenu(null);
        setOpenCopy(true);
    }

    const handleDelete = async() =>{
        setContextMenu(null);
        setOpenDelete(true);
    }


    const iconPicker = (file: any) => {
        if(file.mimeType === 'application/vnd.google-apps.folder'){
            return <FolderIcon/>;
        }
        
        if(file.mimeType === 'application/vnd.google-apps.document' 
            || file.mimeType === 'application/vnd.google-apps.spreadsheet'
            || file.mimeType === 'application/vnd.google-apps.presentation'){
            return <img src={file.iconLink} width="24" height="24"/>
        } 


        if(file.thumbnailLink){
            return <img src={file.thumbnailLink} width="24" height="24" alt={file.iconLink}/>
        }
        return <img src={file.iconLink} width="24" height="24"/>
        
    }

    const fileSizeConverter = (fileSize: string) =>{
        if(!fileSize){
            return '-';   
        }
        let fileSizeNum = parseFloat(fileSize);
       
        
        if(fileSizeNum < 1000000){
            let res:any = fileSizeNum/1000;
            res = res.toFixed(2);
            return res + ' KB';
        }
        else{
            let res:any = fileSizeNum/1000000;
            res = res.toFixed(2);
            return res + ' MB';
        }
    }

    const dateConverter = (isoDate: string) => {
    
        const currentDate = new Date();
        const date = new Date(isoDate);
        const [currentMonth, currentDay, currentYear] = [currentDate.getMonth(), currentDate.getDate(), currentDate.getFullYear()];
        const [month, day, year] = [date.getMonth(), date.getDate(), date.getFullYear()];
        
        if(currentMonth === month && currentDay === day && currentYear === year){
            let [hours, minutes] :any = [date.getHours(),date.getMinutes()];
            if(minutes < 10) minutes = '0' + String(minutes);
            if(hours > 12){
                const pmHour = hours - 12;
                const time = [pmHour,':',minutes,' PM'];
                return time.join('');
            }else{
                const time = [hours,':',minutes,'AM'];
                return time.join('');
            }
        }
        return date.toLocaleString('default', { month: 'short' }) + ' ' + day.toString() +', ' + year.toString();
    }

    const disableButton = (button: String = null): boolean =>{
        
        if(button === 'delete'){
            
            const filePermissions = fileOnContextMenu.permissions;
            if(!filePermissions) return true;
            const userPermission = filePermissions.filter((permission: any) => permission.emailAddress === currentUserPermission.user); 
            if(userPermission[0].role === 'owner') return false;
            return true;
        }   
        if(!button && currentUserPermission.permissionType === 'writer' || currentUserPermission.permissionType === 'owner'){
            return false;
        }
        return true;
      }
    
    


    return(
        <Box>
            <Box>
                <List
                sx={{
                    maxHeight: '80vh',
                    overflow: 'auto',
                }}>
                    {currentDirectoryList.map((file: any, index: number) =>(
                        <ListItemButton
                                key={index}
                                onDoubleClick={()=>{handlerLeftClick(file)}}
                                onContextMenu={(event) => handleContextMenu(event,file)}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-evenly',
                                    borderTop: '1px solid #DCDCDC',
                                    paddingBottom: '8px',
                                    paddingTop: '8px'
                                }}
                            >
                            <Box sx={{
                                display: 'flex',
                                flex: 1.25
                            }}>
                                <ListItemIcon>
                                    {iconPicker(file)}    
                                </ListItemIcon>
                                <ListItemText primary={file.name} />
                            </Box>
                            <Box sx={listChildren}>
                                <ListItemText primary={file.owners[0].emailAddress}/>
                            </Box>
                            <Box sx={listChildren}>
                                <ListItemText primary={dateConverter(file.modifiedTime)}/>
                            </Box>
                            <Box sx={listChildren}>
                                <ListItemText primary={fileSizeConverter(file.size)}/>
                            </Box>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
            {contextMenu && 
            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
                }
                >
                <MenuItem onClick={handleEditAccessClick} disabled={disableButton()}>Edit Access</MenuItem>
                {
                    fileOnContextMenu.mimeType !== 'application/vnd.google-apps.folder' 
                    &&
                <MenuItem onClick={handleCopy}>Make a copy</MenuItem>
                }   
                <MenuItem onClick={handleRename} disabled={disableButton()}>Rename</MenuItem>
                <MenuItem onClick={handleDelete} disabled={disableButton('delete')}>Delete</MenuItem>
            </Menu>
            }
            {viewModal &&
                <ManagePermissions
                viewModal = {viewModal}
                setViewModal = {setViewModal}
                file = {fileOnContextMenu}
                roleList={roleList}
                setRoleList={setRoleList}
                currentMainDirectory={currentMainDirectory}
            />
            }
            {
                openDelete &&
                <Delete
                    openDelete={openDelete}
                    setOpenDelete={setOpenDelete}
                    fileOnContextMenu={fileOnContextMenu}
                    setCurrentDirectoryList={setCurrentDirectoryList}
                    currentDirectoryList={currentDirectoryList}
                    deleteFile={deleteFile}
                />
            }
            {
                openRename &&
                <Rename
                    setOpenRename={setOpenRename}
                    openRename={openRename}
                    currentDirectoryList={currentDirectoryList}
                    setCurrentDirectoryList={setCurrentDirectoryList}
                    fileOnContextMenu={fileOnContextMenu}
                />
            }
            {
                openCopy &&
                <Copy
                    setOpenCopy={setOpenCopy}
                    openCopy={openCopy}
                    currentDirectoryList={currentDirectoryList}
                    setCurrentDirectoryList={setCurrentDirectoryList}
                    fileOnContextMenu={fileOnContextMenu}
                    roleList={roleList}
                    setRoleList={setRoleList}
                    currentDirectory={currentDirectory}
                />
            }
        </Box>
    );
}

export default DirectoryContent;