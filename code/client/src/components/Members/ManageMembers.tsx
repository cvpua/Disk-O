import axios from "axios";
import React,{useContext, useState, useEffect} from "react";
import { myContext } from "../../Context";
import MemberList from "./MemberList";

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




const memberModal = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45vw',
    height: '90vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

const peopleStyle = {
    display: 'flex',
    flexDirection: 'row'
}


const ManageMembers = (props:any) => {
    
    const { 
        setViewModal, 
        viewModal, 
        chosenRole, 
        currentDirectory,
        currentMainDirectory,
        roleList,
        setRoleList ,
        setUsers,
        users
    } = props;

    const permissionValue: any = {
        'writer': 2,
        'commenter': 1,
        'reader': 0
    };
    const userObject: any = useContext(myContext);
    const [addUserModal,setAddUserModal] = useState(false);
    const [owner, setOwner] = useState({emailAddress: ""});
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFull, setIsFull] = useState(false);

    
    const handleClose = ( ) =>{
        setViewModal(!viewModal);
    }

    useEffect(() =>{
        const list: any = roleList.find((role:any) => role.name === chosenRole.name);
        setUsers(list.users);
        const members: any = roleList.find((role:any) => role.name === 'Member');
        if(list.users.length >= (members.users.length - 1)){
            setIsFull(true);
        }
    },[]);

    useEffect(() =>{
        const permissions = currentMainDirectory.permissions;
        const mainDirectoryOwner = permissions.filter((permission:any) => permission.role === 'owner');
        setOwner(mainDirectoryOwner[0]);
    },[])

    const deleteUserRole = async(userId:string, roleId:string) => {
        const res = await axios.delete(`/api/user/${userId}/role/${roleId}`);
    }

    const deleteBatchUserRole = async(userId: string, roleIds: string[]) => {
        const headers = {};
        const data = {roleIds}
        const res = await axios.delete(`/api/user/${userId}/role`,{
            headers,data
        });
        return res;
    }


    const deletePermission = async(file: any, users:[any]) => {
        const res = await axios.post('/api/user/permission/delete',{
            file,
            users,
            refreshToken: userObject.refreshToken
        });
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

    const fetchMainDirectoryContent = async(directoryId: string, forNavBar:boolean) => { 
        const res = await axios.post("/api/directory/fetch",{
            parentDirectoryId: directoryId,
            forNavBar,
            refreshToken: userObject.refreshToken,
        });
        
        return res.data;
    }

    const fetchRoleAccesses = async(roleId: any) => {
        const res = await axios.get(`api/access/role/${roleId}`);
        return res.data;
    }

    const fetchAccesses = async(fileId: any) => {
        const res = await axios.get(`api/access/file/${fileId}`);
        return res.data;
    }

    const deleteRoleUser = async (roleId: string, userId: string) => {
        const res = await axios.delete(`api/role/${roleId}/user/${userId}`);
        // return res.data;
    }

    const handleDelete = async(user: any) => {
        setIsDeleting(true);
        // const accesses = await fetchRoleAccesses(chosenRole._id); //file accesses of the user's role
        // accesses.map(async(access:any) =>{
        //     const fileAccesses = await fetchAccesses(access.fileId); //roles that has access to a certian file
          
        //     const userRoles = user.roles;
        //     let otherAccesses = fileAccesses.filter((fileAccess:any) => userRoles.includes(fileAccess.roleId));
        //     const currentAccess = otherAccesses.filter((access:any) => access.roleId === chosenRole._id);

        //     otherAccesses = otherAccesses.filter((access:any) => access.roleId !== chosenRole._id); // the user still have access even if he/she is removed from the role since he/she has other role
        //     const file = {
        //         id: currentAccess[0].fileId
        //     }

        //     if(!otherAccesses.length){ //deletes the permission completely if the user doesn't have other role
        //         
        //         deletePermission(file,[user]);
        //     }else{ //will update the user's permission accordingly to user's other roles
        //         let shouldUpdate = true;
        //         const permissions: string[] = otherAccesses.map((access:any) => access.permissionType);
        //         const uniquePermissions: any = Array.from(new Set(permissions));
        //         const currentPermission = currentAccess[0].permissionType;
        //         let newPermission;
        //         uniquePermissions.forEach((permission:string) =>{
        //             
        //             if(permissionValue[permission] >= permissionValue[currentPermission]) shouldUpdate = false;
        //             else newPermission = permission;
        //         });
        //         if(shouldUpdate){
        //             updatePermission(file,[user],newPermission);
        //         }   
        //     }
        // });
        const files = await fetchMainDirectoryContent(currentMainDirectory.id,false);
        if(chosenRole.name !== 'Member'){
            if(files.length){
                files.map(async(file:any) => {
                    const fileAccesses : any = await fetchAccesses(file.id);
                    const chosenRoleAccess = fileAccesses.filter((fileAccess: any) => fileAccess.roleId === chosenRole._id);
                    let otherRoleAccess = fileAccesses.filter((fileAccess:any) => fileAccess.roleId !== chosenRole._id);
                    otherRoleAccess = otherRoleAccess.filter((access:any) => user.roles.includes(access.roleId));
                
                    if(chosenRoleAccess.length){
                        if(!otherRoleAccess.length){
                            await deletePermission(file,[user]);
                        }else{
                            const currentPermission = chosenRoleAccess[0].permissionType;
                            let shouldUpdate = true;
                            let newPermission: string;
                            otherRoleAccess.forEach((access: any) =>{    
                                if(permissionValue[access.permissionType] >= permissionValue[currentPermission]) shouldUpdate = false;
                                else newPermission = access.permissionType;
                            });
                            if(shouldUpdate){    
                                await updatePermission(file,[user],newPermission);
                            }       
                        }
                    }
                });
            }
            await deleteRoleUser(chosenRole._id,user._id);
            await deleteUserRole(user._id,chosenRole._id);
        }
        
        else{
            let roleIdsToDelete = [];
            let otherRoleIdsToDelete : string[] = [];
            let userRoleIdsToDelete : string[] = [];
            if(files.length){
                files.map(async(file:any) => {

                    const fileAccesses : any = await fetchAccesses(file.id);
                    const chosenRoleAccess = fileAccesses.filter((fileAccess: any) => fileAccess.roleId === chosenRole._id);
                    let otherRoleAccess = fileAccesses.filter((fileAccess:any) => fileAccess.roleId !== chosenRole._id);
                    otherRoleAccess = otherRoleAccess.filter((access:any) => user.roles.includes(access.roleId));
                    otherRoleIdsToDelete = await Promise.all(otherRoleAccess.map(async(access: any)=>{
                        await deleteRoleUser(access.roleId,user._id);
                        await deletePermission(file,[user]);
                        return access.roleId;
                    }));
                    
                });
            }
            const roleIds = roleList.map((role: any) => role._id);
            userRoleIdsToDelete = await Promise.all(user.roles.map(async(roleId: string) => {
                if(roleIds.includes(roleId) && roleId !== chosenRole._id){
                    await deleteRoleUser(roleId,user._id);
                    return roleId;
                }
            }));
            roleIdsToDelete = [...userRoleIdsToDelete, ...otherRoleIdsToDelete];
            roleIdsToDelete.push(chosenRole._id);
            await deleteRoleUser(chosenRole._id,user._id);
            await deleteBatchUserRole(user._id,roleIdsToDelete);
            await deletePermission(currentMainDirectory,[user])
        }
        
        const newListOfUsers = users.filter((currentUser : any) =>{
           return currentUser.emailAddress !== user.emailAddress;
        });
        setIsDeleting(false);
        setUsers(newListOfUsers);
    }
   
    return(
        <Box>
           <Modal
            open={viewModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
           >
                <Box sx={memberModal}>
                    <Button onClick={handleClose}>
                        X
                    </Button><br/>
                    
                    { chosenRole.name === 'Member' &&
                        <AddUser
                            directory={currentDirectory}
                            setUsers={setUsers}
                            users={users}
                            setRoleList={setRoleList}
                            roleList={roleList}
                            chosenRole={chosenRole}
                            currentMainDirectory={currentMainDirectory}
                        />
                    }
                    {
                        chosenRole.name !== 'Member' &&
                        <Button 
                            variant="contained"
                            endIcon={<AddIcon/>}
                            onClick={()=>{setAddUserModal(true)}}
                            disabled={isFull}
                        >
                            Add User
                        </Button>
                    }
                   
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                    {chosenRole.name}
                    </Typography>
                    <List>
                        {   
                            users.map((user : any, index: number) =>{
                                
                                return(
                                    <ListItem key={index} sx={peopleStyle}>
                                        <Box
                                            sx={{
                                                flex : 1
                                            }}
                                        >
                                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                                {user.emailAddress}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                flex : 1
                                            }}
                                        >
                                        <Button  
                                            onClick={() =>handleDelete(user)} 
                                            sx={{ mt: 1 }}
                                            disabled = {user.emailAddress === owner.emailAddress || isDeleting}
                                        >
                                            <DeleteIcon />
                                                Delete
                                        </Button>
                                        </Box>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </Box>
           </Modal>
           {
            addUserModal &&
            <MemberList
                setUsers={setUsers}
                users={users}
                addUserModal={addUserModal}
                setAddUserModal={setAddUserModal}
                chosenRole={chosenRole}
                roleList ={roleList}
                setRoleList ={setRoleList}
                currentMainDirectory={currentMainDirectory}
            />}

        </Box>
    );
}

export default ManageMembers;