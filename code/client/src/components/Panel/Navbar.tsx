import React, {useState, useEffect, useContext, useRef} from "react";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import axios from "axios";

import { myContext } from "../../Context";
import Delete from './MainFolder/Delete';
import Rename from './MainFolder/Rename';
import Location from './Location';

import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
// import FolderIcon from '@mui/icons-material/Folder';
// import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Create from './MainFolder/Create';
import Tooltip from '@mui/material/Tooltip';
import Hidden from '@material-ui/core/Hidden';
import useMediaQuery  from "@mui/material/useMediaQuery";



const drawerWidth = 250;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      maxHeight: '100vh',
      overflow: 'hidden'
    },
    drawerPaper: {
      width: drawerWidth,
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  }),
);


const Navbar = (props:any) => {
    const userObject: any = useContext(myContext);
    const classes = useStyles();

    const {
      setIsUserLoggedIn,
      diskODetails,
      setCurrentDirectoryList,
      setCurrentDirectory,
      fetchDirectoryContent,
      fetchChildDirectoryContent,
      setOpenFolderSettings,
      setCurrentLocation,
      currentLocation,
      deleteFile,
      currentUser,
      setCurrentUser,
      setCurrentMainDirectory,
      currentUserPermission,
      roleList,
      setIsLoading
    } = props;


    const [openCreate, setOpenCreate] = useState(false);
    const [mainDirectoryList, setMainDirectoryList] = useState([]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [openRename, setOpenRename] = useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const isVisible = useMediaQuery("(min-width: 600px)");

  
    const [contextMenu, setContextMenu] = React.useState<{
      mouseX: number;
      mouseY: number;
    } | null>(null);
    

    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };

    useEffect(() =>{
        
        if(diskODetails.id){
            
            fetchDirectoryContent(diskODetails.id,true)
            .then((res:any) =>{
                
                setMainDirectoryList(res.data);
                if(res.data.length){
                    setCurrentDirectory(res.data[0]);
                    setCurrentMainDirectory(res.data[0]);
                    let directory = res.data[0];
                    directory.name = directory.name.replace("Disk-O","");
                    setCurrentLocation([directory]);
                    fetchChildDirectoryContent(res.data[0],false);
                }
            });
        }
    },[diskODetails])

   
    const handleContextMenu = (event: React.MouseEvent, index: number) => {
      event.preventDefault();
      setSelectedIndex(index);
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
            }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
            // Other native context menus might behave different.
            // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
            null,
      );
     
    };
  
    const handleClose = (event: React.MouseEvent) => {
      setContextMenu(null);
    };

    const disableButton = (button: String = null) =>{
      if(button === 'delete' && currentUserPermission.permissionType === 'owner'){
        return false;
      }
      if(!button && currentUserPermission.permissionType === 'owner'){ //currentUserPermission.permissionType === 'writer') ||
          return false;
      }
      return true;
    }

    const handleContextMenuClick = async(event: React.MouseEvent) =>{
      setCurrentMainDirectory(mainDirectoryList[selectedIndex]);
      setOpenFolderSettings(true);
      handleClose(event);
    }
    
    const handleLeftClick = async(directory: any,event: React.MouseEvent<HTMLDivElement, MouseEvent>,index: number,) => {
      setIsLoading(true);
      setCurrentMainDirectory(mainDirectoryList[index]);
      directory.name = directory.name.replace("Disk-O","");
      setCurrentLocation([directory]);
      setSelectedIndex(index);
      setOpenFolderSettings(false);
      fetchChildDirectoryContent(directory,false);
      setCurrentDirectory(directory);
    }

    const handleRename = () =>{
      setOpenRename(true);
      setContextMenu(null);
    }
  
    const handleDelete = () =>{
      setOpenDelete(true);
      setContextMenu(null);
    }

    const googleLogout = async() =>{
        const res = await axios.get("/api/auth/logout",{
            withCredentials: true
        })
        if(res && res.data === 'done'){
            window.location.href = "/";
            setIsUserLoggedIn(false);
        }
    }

    const drawerConent = (
      <Box
        sx={{
          // maxHeight: '100vh'
        }}
      >
          <Toolbar 
          sx={{
            display:"flex",
            justifyContent:"center",}}
          >
            <Typography variant="h6" noWrap component="div" align='center'>
                Disk-O
            </Typography>
          </Toolbar>
          <Divider />
            <Box sx={{textAlign:'center'}}>
              <Button onClick={() => {setOpenCreate(true)}}>
                  Create Main Folder
              </Button>
            </Box>
          <Divider />
          <List
            sx={{
              maxHeight: '78vh',
              height: '78vh',
              overflow: 'auto'
            }}
          >
              {mainDirectoryList.map((directory:any, index:number) => (
                <ListItemButton 
                  key={index} 
                  selected={selectedIndex === index}
                  onClick={(event)=>handleLeftClick(directory,event,index)} 
                  onContextMenu={(event) =>handleContextMenu(event,index)} 
                >
                  <ListItemIcon>
                    <FolderIcon/>
                  </ListItemIcon>
                  <ListItemText primary={directory.name.replace("Disk-O","")} />
                </ListItemButton>
              ))}
          </List>
          <Divider />
          <List
            
          >
          <Tooltip key={'User'} title={userObject.emails[0].value} placement="top">
            <ListItemButton >
                  <ListItemIcon>
                    <img 
                      src={userObject.photos[0].value} 
                      style ={{borderRadius:'50%'}}
                      height = "32"
                      width = "32"
                      alt={currentUser.emailAddress[0] || ''}
                    />
                  </ListItemIcon>
                <ListItemText primary={userObject.displayName}/>
            </ListItemButton>
            </Tooltip>
          <Divider />
            <ListItemButton key ={'Logout'} onClick={googleLogout}>
              <ListItemIcon>
                  <ExitToAppIcon/>
                </ListItemIcon>
              <ListItemText primary={'Logout'}/>
            </ListItemButton>
          </List>
      </Box>
    )

  return (
    <Box sx={{padding:0, maxHeight: '10vh' }}>
      <Box sx={{ display: 'flex',padding:0 }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={ !isVisible ?{ } 
              :{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
        >
          <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
            <Location
              currentLocation={currentLocation}
              setCurrentLocation={setCurrentLocation}
              setCurrentDirectoryList={setCurrentDirectoryList}
              setCurrentDirectory={setCurrentDirectory}
              setIsLoading={setIsLoading}
            />
          </Toolbar>
        </AppBar>
        <Box >
          <Hidden smUp implementation="css">

          
          <Drawer
            className={classes.drawer}
            variant="temporary"
            classes={{
              paper: classes.drawerPaper,
            }}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true
            }}
            anchor="left"
          >
          {drawerConent}
          </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left"
            open
          >
          {drawerConent}
          </Drawer>
          </Hidden>
        </Box>
        
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          <Toolbar />

        </Box>
      </Box>
        {contextMenu && 
        <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleContextMenuClick} disabled={disableButton()}>Edit Roles and Members</MenuItem>
            <MenuItem onClick={handleRename} disabled={disableButton()}>Rename</MenuItem>
            <MenuItem onClick={handleDelete} disabled={disableButton('delete')}>Delete</MenuItem>
          </Menu>}
      {
        openCreate && 
        <Create
          setOpenCreate={setOpenCreate}
          openCreate={openCreate}
          diskODetails={diskODetails}
          setCurrentDirectoryList={setMainDirectoryList}
          currentDirectoryList={mainDirectoryList}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          setCurrentDirectory={setCurrentDirectory}
          setCurrentMainDirectory={setCurrentMainDirectory}
          setCurrentLocation={setCurrentLocation}
          fetchChildDirectoryContent={fetchChildDirectoryContent}
        />
      }
      {
        openDelete &&
        <Delete
            openDelete={openDelete}
            setOpenDelete={setOpenDelete}
            mainDirectory={mainDirectoryList[selectedIndex]}
            mainDirectoryList={mainDirectoryList}
            setMainDirectoryList={setMainDirectoryList}
            roleList={roleList}
            deleteFile={deleteFile}
            setCurrentDirectory={setCurrentDirectory}
            setCurrentDirectoryList={setCurrentDirectoryList}
            setCurrentMainDirectory={setCurrentMainDirectory}
            setCurrentLocation={setCurrentLocation}
            fetchChildDirectoryContent={fetchChildDirectoryContent}
        />
      }
      {
        openRename &&
        <Rename
            setOpenRename={setOpenRename}
            openRename={openRename}
            mainDirectory={mainDirectoryList[selectedIndex]}
            mainDirectoryList={mainDirectoryList}
            setMainDirectoryList={setMainDirectoryList}
        />
      }
    </Box>
  );
}


export default Navbar;