import React,{ createContext, useEffect, useState} from 'react';
import axios from 'axios';

export const myContext = createContext({});
const Context = ( props : any) => {

    const [userObject, setUserObject] = useState();

    useEffect(() =>{
        const fetchUser = async() => {
            const res = await axios.get("/api/test/getUser",{withCredentials: true});
           
            if(res.data){
                setUserObject(res.data);
            }
        }
        fetchUser();
    },[])
    return(
        <myContext.Provider value={userObject}>{props.children}</myContext.Provider>
    )
}

export default Context;