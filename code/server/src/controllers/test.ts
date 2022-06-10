import { Response, Request, Router } from 'express';

export const TestEndpoint = Router();


const getUser = (req:Request,res:Response) =>{
    res.send(req.user);
}

TestEndpoint.get('/hello',(_:any,res:Response) =>{
    console.log("Hello");
    res.json({msg:"Hello"});
})

TestEndpoint.get('/getUser',getUser);