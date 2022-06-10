import React,{useState, useEffect} from "react";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';



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

const MemberPanel = (props:any) => {
    const {
        roleList,
    } = props;
    const classes = useStyles();
    const [users,setUsers] = useState([]);
    const [openUserRoles, setOpenUserRoles] = useState(false);
    const [selectedUser, setSelectedUser] = useState({emailAddress:""});
    const [selectedUserRoles, setSelectedUserRoles] = useState([]);
    const [userRolesButtonMenu, setUserRolesButtonMenu] = React.useState<{
      mouseX: number;
      mouseY: number;
    } | null>(null);
    
    useEffect(()=>{
        if(roleList.length){
          const memberRole: any = roleList.filter((role:any) => role.name === 'Member');
          setUsers(memberRole[0].users);
        }
    },[roleList]);
   
    const handleUserRolesButton = (event: React.MouseEvent) => {
      event.preventDefault();
      setUserRolesButtonMenu(
        userRolesButtonMenu === null
          ? {
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
              }
          : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
              // Other native context menus might behave different.
              // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
              null,
      );
  }

    const clickHandler = (event: React.MouseEvent,user: any) => {
      const userRoles = user.roles;
      const roleNames = roleList.filter((role:any) => userRoles.includes(role._id));
      setSelectedUser(user);
      setSelectedUserRoles(roleNames);
      
      setOpenUserRoles(true);
      handleUserRolesButton(event);
    }
    const handleCloseUserRoles = () => {
      setUserRolesButtonMenu(null);
  }
    
    return(
      <Box>
          <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="right"
        >
          <Toolbar 
          sx={{
            display:"flex",
            justifyContent:"center",}}
          >
            <Typography variant="subtitle1" noWrap component="div" align='center'>
                Members
            </Typography>
          </Toolbar>
        <List>
          {users.length !== 0 &&
            users.map((user:any, index:number) => (
            <ListItem button key={index} onClick={(event)=>{clickHandler(event,user)}}>
              <ListItemText primary={user.emailAddress} />
            </ListItem>
          ))}
        </List>
        </Drawer>
        {
            userRolesButtonMenu && 
            <Menu
                open={openUserRoles !== null}
                onClose={handleCloseUserRoles}
                anchorReference="anchorPosition"
                anchorPosition={
                  userRolesButtonMenu !== null
                    ? { top: userRolesButtonMenu.mouseY, left: userRolesButtonMenu.mouseX }
                    : undefined
                }
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                  }}
                transformOrigin={{
                vertical: 'center',
                horizontal: 'right',
                }}
                >
                
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '5px',
                  }}
                >
                  <Box>
                    <Typography>
                    {selectedUser?.emailAddress || ''}
                    </Typography>
                  </Box>
                  <Box>
                  <Typography>
                  Roles:
                  </Typography>
                  {
                    selectedUserRoles.map((role:any, index:number) =>{
                      return(
                        <Box key={index}>
                          <Typography>
                            {role.name}
                          </Typography>
                        </Box>
                      )
                    })
                  }
                  </Box>
                </Box>
            </Menu>
            }
      </Box> 
    );
}

export default MemberPanel;