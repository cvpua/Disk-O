import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';



const ColumnNames = () => {
    
    const columnNames = ['Name', 'Owner', 'Last Modified', 'File Size'];

    return(
        <List sx={{
            display: 'flex',
            justifyContent: 'space-around',
        }}>
            <Box sx={{
                display:'flex',
                flex: 0.75,
                justifyContent:'center'
            }}>
                <Typography variant="subtitle1" gutterBottom component="div">
                    {columnNames[0]}
                </Typography>
            </Box>
            
            <Box sx={{
                display:'flex',
                flex: 0.75,
                justifyContent:'center'
            }}>
                <Typography variant="subtitle1" gutterBottom component="div">
                    {columnNames[1]}
                </Typography>
            </Box>        
        
            <Box sx={{
                display:'flex',
                flex: 1,
                justifyContent:'center'
            }}>
                <Typography variant="subtitle1" gutterBottom component="div">
                    {columnNames[2]}
                </Typography>
            </Box>
            <Box sx={{
                display:'flex',
                flex: 1,
                justifyContent:'flex-start'
            }}>
                <Typography variant="subtitle1" gutterBottom component="div">
                    {columnNames[3]}
                </Typography>
            </Box>               
        </List>
    )
}

export default ColumnNames;