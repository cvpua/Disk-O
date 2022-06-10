import React,{useContext, useState, useEffect} from "react";
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Button  from "@mui/material/Button";
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';


const Location = (props:any) => {

    const { 
      currentLocation, 
      setCurrentLocation,
      setCurrentDirectory,
      setCurrentDirectoryList,
      setIsLoading
    } = props;

    const fetchDirectoryContent = async(directoryId: string, forNavBar:boolean) => { 
      const res = await axios.post("/api/directory/fetch",{
          parentDirectoryId: directoryId,
          forNavBar,
      });     
      setIsLoading(false);
      return res.data;
    }
    
    const handleClick = async(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, file: any, position: number) =>{
        event.preventDefault();
        let newLocation = currentLocation.filter((location: any,index: number) => index <= position );
        setCurrentLocation(newLocation);
        setIsLoading(true);
        const directoryContent = await fetchDirectoryContent(file.id, false);
        setCurrentDirectoryList(directoryContent);
        setCurrentDirectory(file);
        
    }
   


    return(
        <Breadcrumbs separator="›" aria-label="breadcrumb">
        {
          currentLocation.map((file:any,index:number) => {
            if(index === currentLocation.length - 1){
              return(
                <Typography key = {index} variant="h6">
                  {file.name}
                </Typography>
              )
            }else{
              return(
                <Button
                  key={index}
                  color="inherit"
                  onClick={(event: any)=>{handleClick(event,file,index)}}
                >
                  <Typography
                      variant="h6"
                  >
                  {file.name}
                  </Typography>
                </Button>
              )
            }
          })
        }
      </Breadcrumbs>
    );
}

export default Location;