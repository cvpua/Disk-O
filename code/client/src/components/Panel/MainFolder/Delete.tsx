import React, {useState, useEffect, useContext, useRef} from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from "axios";



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


const Delete = (props: any) => {
    const{
        openDelete,
        setOpenDelete,
        mainDirectory,
        mainDirectoryList,
        setMainDirectoryList,
        setCurrentDirectoryList,
        setCurrentDirectory,
        setCurrentMainDirectory,
        setCurrentLocation,
        fetchChildDirectoryContent,
        roleList,
        deleteFile
    } = props;

    const [isDeleting, setIsDeleting] = useState(false);

    const deleteRoleAccess = async(roleId: string) =>{
        const res = await axios.delete(`/api/access/role/${roleId}`)
        
      }
  
    const deleteUserRole = async(userId: string, roleId: string) =>{
    const res = await axios.delete(`/api/user/${userId}/role/${roleId}`);
    
    }

    const deleteMainDirectoryRoles = async(mainFolderId: string) =>{
        const res = await axios.delete(`/api/role/mainFolder/${mainFolderId}`);
        
      }

    const deleteRoleAccessHandler = (roleIdList : string []) => {
        roleIdList.forEach((roleId: string) =>{
          deleteRoleAccess(roleId);
        });
      }
  
      const deleteUserRoleHandler = async(userList: any[], roleIdList: string[]) =>{
        
        userList.forEach((user) =>{
          roleIdList.forEach(async(roleId)=>{
            await deleteUserRole(user._id,roleId);
          })
        })
      }

    const handleDelete = async() => {
        setIsDeleting(true);
        setOpenDelete(false);
        // const mainDirectory = mainDirectoryList[selectedIndex];
        const newMainDirectoryList = mainDirectoryList.filter((directory: any) => directory.id !== mainDirectory.id);
        const roleIdList = roleList.map((role:any) => role._id);
        const userList2dArray = roleList.map((role:any) => role.users);
        const userList = [].concat(...userList2dArray);
        deleteUserRoleHandler(userList,roleIdList);
        deleteRoleAccessHandler(roleIdList);
        deleteMainDirectoryRoles(mainDirectory.id);
        deleteFile(mainDirectory);
        setMainDirectoryList(newMainDirectoryList);
        if(newMainDirectoryList.length > 0){
          setCurrentDirectory(newMainDirectoryList[0]);
          setCurrentMainDirectory(newMainDirectoryList[0]);
          let directory = newMainDirectoryList[0];
          directory.name = directory.name.replace("Disk-O","");
          setCurrentLocation([newMainDirectoryList[0]]);
          fetchChildDirectoryContent(newMainDirectoryList[0],false);
        }else{
          setCurrentDirectory({id:"", mimeType:"", name:""});
          setCurrentMainDirectory({id:"", mimeType:"", name:""});
          setCurrentLocation([]);
          setCurrentDirectoryList([]);
          
        }
        setIsDeleting(false);
        
        
    }

    return(
        <div>
        <Modal
                open={openDelete}
                onClose={() =>{setOpenDelete(false)}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Delete {mainDirectory.name}?
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    marginTop: '10px',
                }}>

                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        variant="contained"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                     <Button
                        onClick={()=>{setOpenDelete(false)}} 
                    >
                        Cancel
                    </Button>
                </Box>  
            </Box>
        </Modal>
        </div>
    );
}

export default Delete;