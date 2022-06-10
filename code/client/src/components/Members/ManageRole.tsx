import axios from "axios";
import React,{useContext, useState, useRef} from "react";
import { myContext } from "../../Context";
import './Manage.css';
import ManageMembers from "./ManageMembers";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Delete from './Roles/Delete';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import EditIcon from '@material-ui/icons/Edit';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { height } from "@mui/system";
// import NumbersIcon from '@material-ui/icons/Numbers';
// import DeleteIcon from '@mui/icons-material/Delete';
// import MoreVertIcon from '@mui/icons-material/MoreVert';




const ManageRole = (props:any) => {
    const {
        currentDirectory,
        setRoleList,
        roleList,
        setViewModal,
        viewModal,
        handleModal,
        currentMainDirectory
    } = props;

    const userObject: any = useContext(myContext);
    const [content,setContent] = useState([]);
    const [roleName,setRoleName] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [openDelete, setOpenDelete] = useState(false);
    const [isError, setIsError ] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
   
    const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
        setRoleName(event.target.value);

    }

    const createRole = async(name: string, mainFolderId: string) => {
        const res = await axios.post("/api/role/create",{
            name,
            mainFolderId
        });
        return res.data;
    }
    
    const checkExistingRoleNames = (newRoleName: string): Boolean => {
        
        for(let i = 0; i < roleList.length; i++){

            if(roleList[i].name.toLowerCase() === newRoleName.toLowerCase()) return true;
        }
        return false;
    }

    const handleSubmit = async () => {
        setIsCreating(true);
        const trimmedRoleName = roleName.trim();
        if(trimmedRoleName.length > 0){
            const isExisting: Boolean = checkExistingRoleNames(trimmedRoleName);
            if(!isExisting){
                const newRole = await createRole(trimmedRoleName,currentMainDirectory.id);
                setRoleList([...roleList,{...newRole}]);
            }else{
                setErrorMessage('Role name already exists!');
                setIsError(true);
            }
            
        }else{
            setErrorMessage('Role name must contain atleast one character');
            setIsError(true);
            
        }
        setRoleName("");
        setIsCreating(false);
    }
    

    const handleDelete = async(role:any) => {
        setSelectedRole(role);
       setOpenDelete(true);
    }
    
    return(
        <Box>
            <Box
                sx={{
                    height:"10vh",
                    maxHeight:"10vh"
                }}
            >                    
                <TextField  
                        value={roleName} 
                        id="outlined-basic" 
                        label="Role Name" 
                        variant="outlined" 
                        size="small"
                        helperText={isError ? errorMessage : ""}
                        error = {isError}
                        onChange={handleChange}
                        onClick={() => {setIsError(false)}}
                        />
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isCreating}
                >
                    {isCreating? 'Creating...':'Create Role'}
                </Button>
            </Box>
            <List>
            {
                roleList.map((role:any,index:any) =>{
                    return(
                        <ListItem key={index}
                            sx={{
                                display:'flex',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flex: 1,
                                }}
                            >
                                <ListItemIcon>
                                    <AccountBoxIcon/>
                                </ListItemIcon>
                                <ListItemText primary={role.name}/>
                            </Box>
                            <Box 
                                sx={{
                                    flex: 1,
                            }}>
                            <ListItemText primary={"Count: " + role.users.length}/>
                            </Box>
                         
                            <Box
                                sx={{
                                    flex: 1,
                                }}
                            >
                                <ListItemButton
                                    sx={{
                                        maxWidth:'fit-content'
                                    }}
                                    disabled = {role.name === 'Owner'}
                                    onClick={()=>{handleModal(role)}}
                                >
                                    <ListItemText sx={{maxWidth:'fit-content'}} primary="Edit"/>
                                    <ListItemIcon>
                                        <EditIcon />
                                    </ListItemIcon>
                                </ListItemButton>
                            </Box>
                            
                            <Box 
                                sx={{
                                    flex: 1
                                }}    
                            >
                                <ListItemButton  
                                    sx={{
                                        maxWidth:'fit-content'
                                    }}
                                    
                                    onClick={() =>handleDelete(role)} 
                                    disabled = { role.name === 'Member' }
                                    >
                                    <ListItemText sx={{maxWidth:'fit-content'}} primary="Delete"/>
                                    <ListItemIcon>
                                        <DeleteIcon />
                                    </ListItemIcon>
                                </ListItemButton>
                            </Box>
                           
                        </ListItem>
                    )
                })
            }
            </List>
            {
                openDelete &&
                <Delete
                    openDelete={openDelete}
                    setOpenDelete={setOpenDelete}
                    selectedRole={selectedRole}
                    setRoleList={setRoleList}
                    roleList={roleList}
                />
            }
        </Box>
    )
}

export default ManageRole;