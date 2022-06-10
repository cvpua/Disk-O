import React, {useState, useEffect, useContext, useRef} from "react";
import './DeleteUser.css'
import { myContext } from "../../Context";
import axios from "axios";

const DeleteUser = (props:any) => {
    const userObject: any = useContext(myContext);
    const [emails,setEmails] = useState([]);

    const deletePermission = async(directories: [any], users: [any], refreshToken: string) =>{
        const res = await axios.post("api/user/delete",{
            directories,
            users,
            refreshToken
        })
        return res;
    }

    // const deletePermissionHandler = async() => {
    //     const res = await deletePermission(
    //         [{id:'1TkvlE2dRllWCNooieidht0IEQdDfvOyI'}],// data.currentDirectories,
    //         data.updatedMembers,
    //         userObject.refreshToken
    //     )
    //     console.log(res);
    // }

    return(
        <div>
            <div id="delete-modal">
                <button id="delete-button">
                    Delete
                </button>
            </div>
        </div>
    );
}

export default DeleteUser;