import React from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';




const Copyright = (props: any) =>{
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
          {'Copyright © '}
          <Link color="inherit" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
            Disk-O
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      );
}


const Login = () => {
    
   
    const googleLogin = () =>{
        window.open("http://disko.yses.org/auth","_self");
    }
 
    return(
        
            <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                marginTop: 15,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
                 >
                <Avatar sx={{ width: 56, height: 56 }}>
                   <AccountCircleIcon style={{fontSize:50}}/>
                </Avatar>       
          
                <Typography component="h1" variant="h5">
                 Disk-O
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                    <Typography component="h3" variant="h5">
                        As of now, you can only login using your google account. We apologize for the inconvenience.
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ mt: 3, mb: 2 }}
                      onClick={googleLogin}
                    >
                      <img src="https://img.icons8.com/fluency/36/000000/google-logo.png" alt="" />
                      Sign In with Google
                    </Button>
        
                    </Box>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
    )
}



export default Login;