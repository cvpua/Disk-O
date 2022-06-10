import axios from "axios";
import React,{useContext, useState, useEffect, ReactEventHandler} from "react";
import { myContext } from "../../Context";
// import { RoleList } from '../../roleDB';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import FormControl  from "@mui/material/FormControl";
import DeleteIcon from '@material-ui/icons/Delete';
// import DeleteIcon from '@mui/icons-material/Delete';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
// import Checkbox from '@material-ui/core/Checkbox';
import './Manage.css';
import {create, remove, edit} from './Permissions';


const style = {
    box: {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40vw',
        maxWidth: '40vw',
        height: 'auto',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4
    },
    permission:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginLeft: '20px',
    }
  };


const ManagePermissions = (props:any) => {

    const { 
        setViewModal, 
        viewModal, 
        file, 
        roleList,
        setRoleList,
        currentMainDirectory 
    } = props;
    const userObject: any = useContext(myContext);
    const permissionList : any = {
        0: 'writer',
        1: 'commenter',
        2: 'reader'
    }
    const permissionValue: any = {
        'writer': 2,
        'commenter': 1,
        'reader': 0
    };

    const PermissionList : any = ['Writer', 'Commenter', 'Reader']; //'Organizer', 'File Organizer',
    const [checkboxesState, setCheckboxesState] = useState(null);
    const [initCheckboxesState,setInitCheckboxesState] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    


    const initCheckboxes = async() =>{
        const currentState = await Promise.all(roleList.map(async (role : any,index :any) => {
            if(roleList[index].listOfAccess.length){
                const listOfAccess = roleList[index].listOfAccess;
                const fileAccess = listOfAccess.find((access : any) => access.fileId === file.id && access.roleId === roleList[index]._id);
                if(fileAccess){
                    const access = await fetchAccess(fileAccess._id);
                    const copyOfFileAccess= access.checkboxStatus.map((checkbox:any) => ({...checkbox}));
                    return copyOfFileAccess;   
                }else if(role.name === 'Member'){
                    let rowState = new Array(3).fill(null).map(() =>({state:false, disabled: true}));
                    return rowState;
                }else{
                    let rowState = new Array(3).fill(null).map(() =>({state:false, disabled: false}));
                    return rowState;
                }
            }else if(role.name === 'Member'){
                let rowState = new Array(3).fill(null).map(() =>({state:false, disabled: true}));
                return rowState;
            }else{
                let rowState = new Array(3).fill(null).map(() =>({state:false, disabled: false}));
                return rowState;
            }
        }));
        return currentState;
    }


    useEffect(() => {        
        initCheckboxes()
        .then((checkboxes) => {
            setCheckboxesState(checkboxes)
        })    
        .catch((error) => console.log(error))
    },[]);

    useEffect(() => {
        initCheckboxes()
        .then((checkboxes) => {
            setInitCheckboxesState(checkboxes);
        })    
        .catch((error) => console.log(error))
    },[]);
    

    const fetchAccess = async(accessId: string) =>{
        const res = await axios.get(`/api/access/${accessId}`);
        
        return res.data;
    }

    const updatePermission = async( file: any, users: [any], permission: string ) => {
        const res = await axios.post("/api/user/permission/update",{
            file,
            users,
            permission,
            refreshToken: userObject.refreshToken
        });
        
        return res.data;
        
    }

    const handleClose = ( ) =>{
        setViewModal(!viewModal);
    }


    const checkBoxHandler = (event: React.ChangeEvent ,row:number, col: number) =>{
        const checkboxesCopy = checkboxesState.map((checkbox : any) => {
            return checkbox.slice()
        })
        checkboxesCopy[row][col].state = !checkboxesCopy[row][col].state
        for(let i = col + 1; i < 3; i++){
            checkboxesCopy[row][i].state  = checkboxesCopy[row][col].state
            checkboxesCopy[row][i].disabled = checkboxesCopy[row][col].state 
        }
        setCheckboxesState(checkboxesCopy);
    }
    
    const handleSave = async() => {
        setIsUpdating(true);
        const roleListCopy = roleList.map((role : any) => {
            return role
        });
        let shouldUpdateState = false;
        let toCreatePermission : any = [];
        let toUpdatePermission : any = [];
        let toDeletePermission : any = [];
        
        roleListCopy.map(async(role:any, index: number) =>{
            
            const accessIndex = role.listOfAccess.findIndex((access: any) => {  
                return access.fileId === file.id
            });
            const permissionIndex = checkboxesState[index].findIndex((checkbox : any) => checkbox.state === true);
            
            // Will create permission
            if (accessIndex === -1 && permissionIndex !== -1){
                const permission ={
                    file : file,
                    users: role.users,
                    roleId: role._id,
                    type: permissionList[permissionIndex],
                    index
                }
                
                toCreatePermission.push(permission);
                shouldUpdateState = true;
            }
            // Will delete permission
            else if(accessIndex !== -1 && permissionIndex === -1){
                role.listOfAccess.splice(accessIndex,1);
                toDeletePermission.push({
                    file: file,
                    users: role.users,
                    role
                })
                // shouldUpdateState = true;
            }
            // Will update permisison
            else{
                
                const oldState = initCheckboxesState[index].map((checkbox:any) => checkbox.state) || [false, false, false, false, false];
                
                const currentState = checkboxesState[index].map((checkbox : any) => checkbox.state);
                
                if(JSON.stringify(oldState) !== JSON.stringify(currentState)){
                    const updateAccess = {
                        _id: role.listOfAccess[accessIndex]._id,
                        name: file.name,
                        fileId: file.id,
                        permission: permissionList[permissionIndex],
                        checkboxStatus: checkboxesState[index],
                        roleId: role._id
                    }
                    toUpdatePermission.push({
                        file : file,
                        users: role.users,
                        roleId: role._id,
                        accessId: role.listOfAccess[accessIndex]._id,
                        type: permissionList[permissionIndex],
                        index,
                    });
                    role.listOfAccess[accessIndex] = updateAccess;
                    shouldUpdateState = true;
                    // role.listOfAccess.splice(accessIndex,1);
                    // role.listOfAccess.push(updateAccess);
                }
            }
            
        })
    
        if(toCreatePermission.length){
            create(toCreatePermission,roleListCopy,checkboxesState,userObject.refreshToken);
        }

        if(toDeletePermission.length){
            remove(toDeletePermission, toUpdatePermission, userObject.refreshToken);
        }
        if(toUpdatePermission.length){
            
            edit(toUpdatePermission,roleListCopy,checkboxesState,userObject.refreshToken);
        }
        if(shouldUpdateState){
            setRoleList(roleListCopy);
        }
        setIsUpdating(false);
        setViewModal(false);
    }

    return(
        <div>
           <Modal
            open={viewModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
           >
                <Box sx={style.box}>
                    <Box>
                        <Button onClick={handleClose}>
                            X
                        </Button><br/>
                    </Box>
                    <Box>
                        {file.name}
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-around'
                    }}>
                    
                        <Box 
                            sx={{
                                flex:1.25
                            }}
                        >
                        </Box>
                        <Box 
                            sx={{
                                flex:1
                            }}
                        >
                            <Typography id="modal-modal-description">
                                {PermissionList[0]}
                            </Typography>
                        </Box>
                        

                        <Box 
                            sx={{
                                flex:1
                            }}
                        >
                            <Typography id="modal-modal-description">
                                {PermissionList[1]}
                            </Typography>
                        </Box>


                        <Box 
                            sx={{
                                flex:1
                            }}
                        >
                            <Typography id="modal-modal-description">
                                {PermissionList[2]}
                            </Typography>
                        </Box>

                    </Box>
                    <Box>
                        {
                            checkboxesState &&
                            roleList.map((role: any, index: number) =>{
                                return(
                                    <Box 
                                        key={index} 
                                        sx={{
                                            display:'flex',
                                            justifyContent:'space-around',
                                            marginTop: '16px',
                                            marginBottom: '16px'
                                        }}>                   
                                            <Box
                                                sx={{
                                                    flex:1
                                                }}
                                            >
                                                <Typography>{role.name}</Typography>    
                                            </Box>    
                                            
                                            <Box
                                                sx={{
                                                    flex:1
                                                }}
                                            >
                                                <input 
                                                    className="checkBox" 
                                                    value="writer" 
                                                    type="checkbox"
                                                    onChange={(event)=>{checkBoxHandler(event,index,0)}}
                                                    checked={checkboxesState[index][0]?.state}
                                                    disabled={checkboxesState[index][0]?.disabled}
                                                />
                                            </Box>
                                            <Box
                                                sx={{
                                                    flex:1
                                                }}
                                            >
                                                <input 
                                                    className="checkBox" 
                                                    value="commenter" 
                                                    type="checkbox"
                                                    onChange={(event)=>{checkBoxHandler(event,index,1)}}
                                                    checked={checkboxesState[index][1]?.state}
                                                    disabled={checkboxesState[index][1]?.disabled}
                                                />

                                            </Box>
                                            <Box
                                                sx={{
                                                    flex:1
                                                }}
                                            >
                                                <input 
                                                    className="checkBox" 
                                                    value="reader" 
                                                    type="checkbox"
                                                    onChange={(event)=>{checkBoxHandler(event,index,2)}}
                                                    checked={checkboxesState[index][2].state}
                                                    disabled={checkboxesState[index][2]?.disabled}
                                                />
                                            </Box>    
                                    </Box>
                                );
                            })
                        }
                       
                    </Box>

                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: 'row-reverse',
                            marginTop: '10px',
                        }}    
                    >
                        <Button 
                            variant="contained" 
                            onClick={handleSave}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Saving...': 'Save'}
                        </Button>
                    </Box>
                </Box>
           </Modal>
        </div>
    );
}

export default ManagePermissions;