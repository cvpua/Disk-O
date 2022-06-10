import React,{ useState } from "react";
import ManageRole from "../components/Members/ManageRole";
import ManageMembers from "../components/Members/ManageMembers";
import Box from '@mui/material/Box';
import useMediaQuery  from "@mui/material/useMediaQuery";


const Member = (props:any) => {
    const {
        currentDirectory,
        setRoleList,
        roleList,
        setOpenFolderSettings,
        currentMainDirectory,
        setUsers,
        users
    } = props;
    
    const [viewModal, setViewModal] = useState(false);
    const [chosenRole, setChosenRole] = useState("");
    const isVisible = useMediaQuery("(min-width: 600px)");
    
   
    const handleModal = (role : any) =>{
        setViewModal(!viewModal);
        setChosenRole(role);
        
    }

    return(
        <Box sx={{
            marginLeft : !isVisible ? '0' :  '250px',
            marginRight: !isVisible ? '0' :  '250px'
        }}>
            <ManageRole
                setOpenFolderSettings={setOpenFolderSettings}
                currentDirectory={currentDirectory}
                setRoleList={setRoleList}
                roleList={roleList}
                viewModal={viewModal}
                setViewModal={setViewModal}
                handleModal={handleModal}
                currentMainDirectory={currentMainDirectory}
            />
            {
                viewModal &&
                <ManageMembers
                    viewModal = {viewModal}
                    chosenRole = {chosenRole}
                    setViewModal = {setViewModal}
                    currentDirectory= {currentDirectory}
                    setRoleList={setRoleList}
                    roleList={roleList}
                    currentMainDirectory={currentMainDirectory}
                    users={users}
                    setUsers={setUsers}
                />
                }
        </Box>
    )
}

export default Member;