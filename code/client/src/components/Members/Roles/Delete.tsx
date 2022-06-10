import React, {useState, useEffect, useContext, useRef} from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from "axios";
import { myContext } from "../../../Context";


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
        selectedRole,
        setRoleList,
        roleList
    } = props;
    const userObject: any = useContext(myContext);
    const [isDeleting, setIsDeleting] = useState(false);
    const permissionValue: any = {
        'writer': 2,
        'commenter': 1,
        'reader': 0
    };

    const deleteRoleAccess = async(roleId: string) =>{
        const res = await axios.delete(`/api/access/role/${roleId}`)
        
      }
  
    const deleteUserRole = async(userId: string, roleId: string) =>{
        const res = await axios.delete(`/api/user/${userId}/role/${roleId}`);
        
    }
    const deletePermission = async(file: any, users:[any]) => {
        const res = await axios.post('/api/user/permission/delete',{
            file,
            users,
            refreshToken: userObject.refreshToken
        });
    }

    const deleteRole = async(role: any) => {
        const roleId = role._id;
        const res = await axios.delete(`/api/role/delete/${roleId}`);
        
    }

    const fetchRoleAccesses = async(roleId: any) => {
        const res = await axios.get(`api/access/role/${roleId}`);
        return res.data;
    }

    const fetchAccesses = async(fileId: any) => {
        const res = await axios.get(`api/access/file/${fileId}`);
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

    const handleDelete = async() => {
       
        setIsDeleting(true);
        const accesses = await fetchRoleAccesses(selectedRole._id);
        const users = selectedRole.users;
        accesses.map(async(access:any) =>{
            const fileAccesses = await fetchAccesses(access.fileId);
            users.map((user:any) => {
                const userRoles = user.roles;
                let otherAccesses = fileAccesses.filter((fileAccess:any) => userRoles.includes(fileAccess.roleId));
                const currentAccess = otherAccesses.filter((access:any) => access.roleId === selectedRole._id);
                otherAccesses = otherAccesses.filter((access:any) => access.roleId !== selectedRole._id);
                const file = {
                    id: currentAccess[0].fileId
                }
                if(!otherAccesses.length){
                    
                    deletePermission(file,[user]);
                }else{
                    let shouldUpdate = true;
                    const permissions: string[] = otherAccesses.map((access:any) => access.permissionType);
                    const uniquePermissions: any = Array.from(new Set(permissions));
                    const currentPermission = currentAccess[0].permissionType;
                    let newPermission;
                    uniquePermissions.forEach((permission:string) =>{
                        
                        if(permissionValue[permission] >= permissionValue[currentPermission]) shouldUpdate = false;
                        else newPermission = permission;
                    });
                    if(shouldUpdate){
                        updatePermission(file,[user],newPermission);
                    }   
                }
            });
        
        });
        const newRoleList = roleList.filter((role : any) =>{
            return role.name !== selectedRole.name;
        });
        users.forEach(async(user:any) =>{
            await deleteUserRole(user._id,selectedRole._id);
        })
        await deleteRoleAccess(selectedRole._id);
        await deleteRole(selectedRole);
        setIsDeleting(false);
        setRoleList(newRoleList);
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
                    Delete {selectedRole.name}?
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
                        {isDeleting ? 'Deleting...' : 'Yes'}
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