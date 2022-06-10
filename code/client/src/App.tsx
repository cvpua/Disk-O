import React, { useContext, useEffect, useState } from "react";
import "App.css";
import { myContext } from "./Context";
import { 
  BrowserRouter, 
  Routes, 
  Route } 
from 'react-router-dom';
import axios from "axios";

import Login from "./pages/Login";
import Main from "./pages/Main";
import Navbar from "./components/Panel/Navbar";
import Members from "./components/Panel/Members";
import Member from "./pages/Member";
import Loading from "./components/Loading/Loading";
import useMediaQuery  from "@mui/material/useMediaQuery";




const App = () => {
    const userObject: any = useContext(myContext);
    const [isUserLoggedIn,setIsUserLoggedIn] = useState(false); 
    const [diskODetails, setDiskODetails] = useState({id:"", mimeType:"", name:""});
    const [currentDirectory, setCurrentDirectory] = useState({id:"", mimeType:"", name:""});
    const [currentDirectoryList, setCurrentDirectoryList] = useState([]);
    const [currentMainDirectory, setCurrentMainDirectory] = useState({id:"", mimeType:"", name:""});
    const [openFolderSettings, setOpenFolderSettings] = useState(false);
    const [currentLocation, setCurrentLocation] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [currentUser, setCurrentUser] = useState({emailAddress: "", permissionId: ""});
    const [currentUserPermission, setCurrentUserPermission] = useState({user: "",permissionType:"",permissionId:""});
    const [users, setUsers] = useState([]);  
    const [isLoading, setIsLoading] = useState(false);
    const isVisible = useMediaQuery("(min-width: 600px)");
    

    const fetchUser = async() => {
      const res: any = await axios.post("/api/user/fetch",{
        emailAddresses: [userObject.emails[0].value]
      })

      const user = res.data;
      setCurrentUser(user[0]); //fetchUser always returns an array and currentUser is an object
    }

    
    useEffect(() =>{
      if(userObject){
        setIsUserLoggedIn(true);
        fetchUser();
      }
    },[userObject])
    

    useEffect(() =>{ 
      if(userObject && currentMainDirectory.id){
        const getRoles = async() => {
          const mainFolderId = currentMainDirectory.id;
          const res : any = await axios.get(`/api/role/get/${mainFolderId}`);
          const roles = res.data || [];
          return roles;
        }
        getRoles()
        .then((roles) => setRoleList(roles))
        .catch((error) => console.log(error));
      }
      

    },[currentMainDirectory,users])


    const initializeDiskO = async() =>{
      const res:any = await axios.post("/api/directory/init",{
          refreshToken: userObject.refreshToken
      });
      return res;
    }

    useEffect(() =>{
      if(userObject){
          initializeDiskO()
          .then(
            (res: any) => {
                setDiskODetails(res.data[0]);
            })
      }
    },[userObject]);

    const getUserPermission = async() =>{
      const directoryId = currentDirectory.id
      const permissionId = currentUser.permissionId;
      const res = await axios.get(`/api/directory/permission/${permissionId}/file/${directoryId}`);
      return res.data;
    }

    useEffect(() =>{
        if(currentDirectory.id){
            getUserPermission()
            .then((res:any) =>{
                const currentPermission = {
                  user: res.emailAddress || currentUser.emailAddress,
                  permissionType: res.role,
                  permissionId: res.id || currentUser.permissionId
                }
                setCurrentUserPermission(currentPermission);
            })
            
        }
        
    },[currentDirectory]);

    const fetchDirectoryContent = async(directoryId: string, forNavBar:boolean) => { 
      const res = await axios.post("/api/directory/fetch",{
          parentDirectoryId: directoryId,
          forNavBar
      });
      
      return res;
    }

    const fetchChildDirectoryContent = async(directory: any, forNavBar: boolean) => {
        const res = await fetchDirectoryContent(directory.id,forNavBar);
        setCurrentDirectoryList(res.data);
        setCurrentDirectory(directory);
        setIsLoading(false);
    }

    const deleteFile = async(file: any) => {

      const res = await axios.post('api/file/delete',{
        file,
        refreshToken: userObject.refreshToken
      });
    }
    
    let MainContent;
    if(!openFolderSettings && !isLoading && currentMainDirectory.id){
      MainContent = 
      <Main
        setCurrentDirectoryList={setCurrentDirectoryList}
        currentDirectoryList={currentDirectoryList}
        currentDirectory={currentDirectory}
        fetchChildDirectoryContent={fetchChildDirectoryContent}
        setCurrentLocation={setCurrentLocation}
        currentLocation={currentLocation}
        roleList={roleList}
        setRoleList={setRoleList}
        deleteFile={deleteFile}
        currentMainDirectory={currentMainDirectory}
        currentUser={currentUser}
        currentUserPermission={currentUserPermission}
        setIsLoading={setIsLoading}
      />
    }
    else if(!openFolderSettings && !isLoading && !currentMainDirectory.id){
      MainContent =
      <Loading
        textToDisplay = "Create a main folder to start being productive!"
      />
    }
    else if(!openFolderSettings && isLoading){
      MainContent = 
      <Loading/>
    }
    else{
      MainContent = 
      <Member
        setOpenFolderSettings={setOpenFolderSettings}
        currentDirectory={currentDirectory}
        setRoleList={setRoleList}
        roleList={roleList}
        currentMainDirectory={currentMainDirectory}
        users={users}
        setUsers={setUsers}
      />
    }


    return (
      <div className="App">
        {
        !isUserLoggedIn?
          <Login/> 
          :
              <BrowserRouter>
                <Navbar
                  setIsUserLoggedIn={setIsUserLoggedIn}
                  setCurrentDirectory={setCurrentDirectory}
                  currentDirectory={currentDirectory}
                  setCurrentDirectoryList={setCurrentDirectoryList}
                  currentDirectoryList={currentDirectoryList}
                  diskODetails={diskODetails}
                  initializeDiskO={initializeDiskO}
                  fetchDirectoryContent={fetchDirectoryContent}
                  fetchChildDirectoryContent={fetchChildDirectoryContent}
                  setOpenFolderSettings={setOpenFolderSettings}
                  setCurrentLocation={setCurrentLocation}
                  currentLocation={currentLocation}
                  deleteFile={deleteFile}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  setCurrentMainDirectory={setCurrentMainDirectory}
                  currentUserPermission={currentUserPermission}
                  roleList={roleList}
                  setIsLoading={setIsLoading}
                />
                {
                  !openFolderSettings && 
                  currentMainDirectory.id &&
                  isVisible &&
                  <Members
                    roleList = {roleList}
                  />
                }
                {/* <Routes>
                  <Route path='/' element={
                      {Main}
                  }/>
                </Routes> */}
                {MainContent}
              </BrowserRouter>
        }
      </div>
    );
}

export default App;