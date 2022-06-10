
import { Response, Router, Request } from 'express';
// import { oauth2Client } from '../index';
import passport, { AuthenticateOptions } from 'passport';



export const AuthEndpoint = Router();

const options : any = {
    scope:[
        'profile', 
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/presentations'
    ],
    accessType: 'offline',
    prompt: 'consent'
}

const authUser = passport.authenticate('google',options);

const logout = (req : any,res : any) =>{
    if(req.user){
        req.logout();
        res.send('done');
    }
}


const redirectUser = passport.authenticate('google',{
    failureRedirect: '/'
});

AuthEndpoint.get('/logout',logout);
AuthEndpoint.get('/google', authUser);
AuthEndpoint.get('/google/callback',redirectUser,(_: any,res: Response) => {
    res.redirect('http://disko.yses.org');
});



