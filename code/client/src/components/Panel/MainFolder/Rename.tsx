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

const Rename = (props: any) => {
    const userObject: any = useContext(myContext);
    const {
        setOpenRename,
        openRename,
        mainDirectory,
        mainDirectoryList,
        setMainDirectoryList
    } = props;
    
    const [name,setName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        let newName = event.target.value;
        setName(newName.trim());

    }
    
    const renameFile = async() =>{
        const res = await axios.patch("/api/file/rename",{
            fileId: mainDirectory.id,
            name: 'Disk-O '+name,
            refreshToken: userObject.refreshToken
        });
        return res.data
    }

    

    const renameHandler = async() => {
        setIsRenaming(true);
        let updatedFile = await renameFile();
        updatedFile = updatedFile.data;
        const directoryList = mainDirectoryList.filter((file:any) => file.id !== updatedFile.id);

        const newDirectoryList = [...directoryList,{
            id:updatedFile.id,
            name:updatedFile.name,
            mimeType:updatedFile.mimeType,
            owners: updatedFile.owners,
            thumbnailLink: updatedFile.thumbnailLink,
            modifiedTime: updatedFile.modifiedTime,
            iconLink: updatedFile.iconLink,
            permissions: updatedFile.permissions
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
        setMainDirectoryList(newDirectoryList);
        setIsRenaming(false);
        setOpenRename(false);
    }

    return(
        <div>
        <Modal
                open={openRename}
                onClose={() =>{setOpenRename(false)}}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Rename
                </Typography>
                <TextField  
                    fullWidth 
                    id="outlined-basic" 
                    // label={fileOnContextMenu.name} 
                    variant="outlined" 
                    onChange={handleChange}
                    placeholder={mainDirectory.name}
                    />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    marginTop: '10px',
                }}>
                    <Button
                        onClick={renameHandler} 
                        variant="contained"
                        disabled={isRenaming || name.length === 0}
                    >
                        {isRenaming ? 'Updating...': 'Update'}
                    </Button>
                </Box>  
            </Box>
        </Modal>
        </div>
    );
}

export default Rename;