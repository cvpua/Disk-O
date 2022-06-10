import React from 'react';
import {render} from 'react-dom';
import App from './App';
import Context from './Context';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

render(
<React.StrictMode>
    <ThemeProvider theme={theme}>
        <Context>
            <App/>
        </Context>
    </ThemeProvider>   
</React.StrictMode>,
document.getElementById('root'));