import  express from 'express';
import { router } from './router';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';

const GoogleStrategy = require('passport-google-oauth20').Strategy;
dotenv.config();
const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    MONGODB_URI
} = process.env



export const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const uri = MONGODB_URI || '';
mongoose.connect(uri,{ 
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cors({
    origin:"http://0.0.0.0:8080",
    credentials: true
}));
app.use(
    session({
        secret: 'secretcode',
        resave: true,
        saveUninitialized: true
    })
);
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user: any,done: any) =>{
    return done(null,user);
})

passport.deserializeUser((user: any,done: any)=> {
    return done(null,user);
})


passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI
  },
  //Executed when auth is successful
  function(_: any, refreshToken: any, profile: any, cb: any) {
    profile.refreshToken = refreshToken;
    cb(null,profile);
  }
));


app.use('/',router);

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));