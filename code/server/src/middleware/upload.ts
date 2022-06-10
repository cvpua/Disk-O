import multer from 'multer';
import fs from 'fs-extra';
import { Response, Request,NextFunction } from 'express';





const storage = multer.diskStorage({
    destination: function(_: Request,__: any,cb){
        cb(null, './uploads'); 
    },
    filename : function(_: Request,file: any,cb){
        cb(null, new Date().toISOString() + file.originalname);
    }
});

// File type checker
const fileFilter = (_: Request,file: any,cb: any) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        cb(null,true);
    }else{
        cb(new Error("Wrong file format"),false);
    }
}

const upload = multer({
    storage, 
    // limits: {
    //     fileSize: 1024 * 1024 * 3
    // },
    // fileFilter

}).array('FILE');


export const parseFiles = async(req:Request, res: Response, next:NextFunction ) =>{
    fs.ensureDirSync('./uploads');
    upload(req,res,async function(err){
        if(err){
            res.status(415).json({
                message:"Error in uploading images in the uploads folder (only 3 images are allowed per post)",
                response: err
            });
        }
        res.locals.files = req.files
        next();
    });
}

