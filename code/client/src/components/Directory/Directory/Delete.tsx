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
        fileOnContextMenu,
        currentDirectoryList,
        setCurrentDirectoryList,
        deleteFile
    } = props;

    const [isDeleting, setIsDeleting] = useState(false);

    const fetchAccesses = async(fileId:string) =>{
        const res = await axios.get(`api/access/file/${fileId}`);
        return res.data;
    }

    const deleteFileAccess = async(fileId: string) => {
        const res = await axios.delete(`/api/access/file/${fileId}`);
        
    }

    const deleteRoleAccess = async(roleId: string, accessId: string) =>{
        const headers = {};
        const data = {accessIds:[accessId]}
        const res = await axios.delete(`api/role/${roleId}/accessList`,{
            headers,data
        });
        
    }


    const handleDelete = async() => {
        setIsDeleting(true);
        const accesses: any = await fetchAccesses(fileOnContextMenu.id);
        
        accesses.map(async(access: any) => {
            await deleteRoleAccess(access.roleId,access._id);
        })
        await deleteFileAccess(fileOnContextMenu.id);
        const newDirectoryList = currentDirectoryList.filter((directory: any) => directory.id !== fileOnContextMenu.id);
        
        setCurrentDirectoryList(newDirectoryList);
        await deleteFile(fileOnContextMenu);
        setIsDeleting(false);
        setOpenDelete(false);
    
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
                    Delete {fileOnContextMenu.name}?
                </Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    marginTop: '10px',
                }}>
                     <Button
                        onClick={handleDelete} 
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...': 'Delete'}
                    </Button>
                    <Button
                        onClick={()=>{setOpenDelete(false)}}
                    >
                        No
                    </Button>
                </Box>  
            </Box>
        </Modal>
        </div>
    );
}

export default Delete;