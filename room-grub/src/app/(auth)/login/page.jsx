import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {FcGoogle} from 'react-icons/fc';
import Image from 'next/image'

export default function Login(){
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
            <Button sx= {{color: 'black',background: 'white', padding: 0.5, borderRadius: 2, fontSize: '18px'}}>
                <FcGoogle style={{ marginRight: '8px' }} />
                Login with Google
            </Button>
            </Box>
        </div>
    )
}