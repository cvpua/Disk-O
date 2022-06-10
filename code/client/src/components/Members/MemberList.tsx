import axios from "axios";
import React,{useContext, useState, useEffect} from "react";
import { myContext } from "../../Context";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import FormControl  from "@mui/material/FormControl";
import DeleteIcon from '@material-ui/icons/Delete';
// import DeleteIcon from '@mui/icons-material/Delete';
import AddUser from "../User/AddUser";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@material-ui/icons/Add';






const addMemberModal = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30vw',
    height: '60vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};


const peopleStyle = {
    display: 'flex',
    flexDirection: 'row'
}


const MemberList = (props:any) => {
    
    const { 
        setAddUserModal, 
        addUserModal, 
        chosenRole, 
        roleList,
        currentMainDirectory,
        setRoleList,
        users,
        setUsers
    } = props;
    const userObject: any = useContext(myContext);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [otherUsers,setOtherUsers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [owner, setOwner] = useState({emailAddress:""});
    
    const permissionValue: any = {
        'writer': 2,
        'commenter': 1,
        'reader': 0
    };
    
    useEffect(() =>{
          const permissions = currentMainDirectory.permissions
          const fileOwner = permissions.filter((permission:any) =>
              permission.role === 'owner');
          
          setOwner(fileOwner[0]);
    },[]);

    const handleClose = ( ) =>{
        setAddUserModal(!addUserModal);
    }

    const addUserRoles = async(userId: string, roleId: string) => {
        const res = await axios.patch(`/api/user/${userId}/add/role`,{
            roleId
        });
        
        return res;
    }
    

    const updateRoleUsers = async(roleId: string, userIds: string[]) => {
        const res = await axios.patch(`api/role/update/${roleId}/`,{
            userIds
        });
    }

    const fetchUsers = async(emailAddresses: string[]) => {
        
        const res = await axios.post("/api/user/fetch",{
            emailAddresses
        });
        return res.data;
    }

    const handleChange = (event: any,emailAddress: string) => {
        const isChecked = event.target.checked;
        if(isChecked){
            setSelectedUsers([...selectedUsers,emailAddress]);
        }else{
            const filteredUsers = selectedUsers.filter((userEmailAddress:string) => userEmailAddress !== emailAddress );
            setSelectedUsers(filteredUsers);
        }
    }

    const fetchMainDirectoryContent = async(directoryId: string, forNavBar:boolean) => { 
        const res = await axios.post("/api/directory/fetch",{
            parentDirectoryId: directoryId,
            forNavBar,
            refreshToken: userObject.refreshToken,
        });
        
        return res.data;
    }
  

    const fetchRoleAccesses = async(roleId:string) =>{
        const res = await axios.get(`/api/access/role/${roleId}`);
        return res.data;
    }

    const fetchAccesses = async(fileId:string) =>{
        const res = await axios.get(`api/access/file/${fileId}`);
        return res.data;
    }

    const createPermission = async(file: any, users: string[], permission: string) => {
        const res = await axios.post("/api/user/permission/create",{
            file,
            users,
            permission,
            refreshToken : userObject.refreshToken
        });
        
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

    const handleSubmit = async() => {
        
        if(selectedUsers.length){
            setIsAdding(true);
            const newUsers:any = await fetchUsers(selectedUsers);
            
            const userIds = newUsers.map((user:any) => user._id);
            const userEmails = newUsers.map((user:any) => {
                return(
                    { emailAddress: user.emailAddress }
                )
            });
            await updateRoleUsers(chosenRole._id,userIds);
        
            userIds.forEach( async(userId:any) =>{
                await addUserRoles(userId,chosenRole._id);
            });
            const files = await fetchMainDirectoryContent(currentMainDirectory.id,false);
            if(files.length){
                files.map((file:any) => {
                    newUsers.map(async(user:any) => {
                        const fileAccesses : any = await fetchAccesses(file.id);
                        const chosenRoleAccess = fileAccesses.filter((fileAccess: any) => fileAccess.roleId === chosenRole._id);
                        let otherRoleAccess = fileAccesses.filter((fileAccess:any) => fileAccess.roleId !== chosenRole._id);
                        otherRoleAccess = otherRoleAccess.filter((access:any) => user.roles.includes(access.roleId));
                        if(chosenRoleAccess.length){
                            if(!otherRoleAccess.length){
                                await createPermission(file,[user],chosenRoleAccess[0].permissionType)
                            }else{
                                let permission = chosenRoleAccess[0].permissionType;
                                let shouldUpdate = true;
                                otherRoleAccess.forEach((access: any) =>{
                                    
                                    if(permissionValue[access.permissionType]>permissionValue[permission]){
                                        shouldUpdate = false;
                                    }
                                });
                                if(shouldUpdate){
                                    
                                    await updatePermission(file,[user],permission);
                                }       
                            }
                        }
                    });
                });
            }

            newUsers.map((user: any) =>{
                const newUser = {
                    _id: user._id,
                    emailAddress: user.emailAddress,
                }
                    return newUser;
                })
                
            setUsers([...users,...userEmails]);
            setIsAdding(false);
            handleClose();
        }        
    }
    
    useEffect(() =>{
        const role: any = roleList.find((role:any) => role.name === chosenRole.name);
        const memberRole: any = roleList.find((role:any) => role.name === 'Member');
        
        const usersNotInRole =  memberRole.users.filter((user: any) => !role.users.find((memUser:any) => user.emailAddress === memUser.emailAddress));
        
        setOtherUsers(usersNotInRole);
    },[]);


    return(
        <Box>
           <Modal
            open={addUserModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
           >
                <Box sx={addMemberModal}>
                    <Button onClick={handleClose}>
                        X
                    </Button><br/>
                    {/* <Box>
                        <TextField
                            id="standard-search"
                            label="Search User"
                            type="search"
                            variant="standard"
                        />
                    </Box> */}
                    <List>
                        {   
                            otherUsers.map((user : any, index: number) =>{
                                if(user.emailAddress !== owner.emailAddress){
                                    return(
                                        <ListItem key={index} sx={peopleStyle}>
                                            <Box
                                                sx={{
                                                    flex: 2
                                                }}
                                            >
                                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                    {user.emailAddress}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    flex: 1
                                                }}
                                            >
                                            <input 
                                                className="checkBox"
                                                type="checkbox"
                                                onChange={(event) => {handleChange(event,user.emailAddress)}}
                                            />
                                            </Box>
                                        </ListItem>
                                    )
                                }   
                            })
                        }
                    </List>
                    <Button 
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isAdding}
                    >
                        { isAdding? 'Adding...': 'Add User' }
                    </Button>
                </Box>
           </Modal>
        </Box>
    );
}

export default MemberList;