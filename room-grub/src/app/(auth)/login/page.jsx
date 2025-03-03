import React from 'react';
import Box from '@mui/material/Box';

import Image from 'next/image'
import LoginBtn from './components/login_btn'


export default async function Login(){
    return(
        <div className = "h-screen w-screen flex justify-center items-center">
            <Box
                sx={{
                    height:"120vw",
                    width:"90vw",
                    color: 'white',
                    padding: 2,
                  }}
                  className = "flex flex-col justify-center"
            >
            <Image src = '/logo.png' 
                   width = {300}
                   height = {150}
                   className = 'w-full'/>
            <LoginBtn></LoginBtn>
            </Box>
        </div>
    )
}