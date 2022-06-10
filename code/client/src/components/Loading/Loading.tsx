import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';





const Loading = (props: any) => {
    const { textToDisplay } = props;  

    return(
      <Box
        sx={{
            marginLeft: '250px',
            marginRight: '250px',
            height: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
        >
          <Typography
                variant="h4"
                color="lightgray"
          >
              {textToDisplay ? textToDisplay : 'Loading...'}
          </Typography>
      </Box> 
    );
}

export default Loading;