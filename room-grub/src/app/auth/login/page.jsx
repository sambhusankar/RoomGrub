import React from 'react';
import Button from '@mui/material/Button';
import {FcGoogle} from 'react-icons/fc';
import Image from 'next/image'

export default function Login(){
    return(
        <div>
            <Image src = '/logo.png' 
                   width = {300}
                   height = {150}
                   className = 'w-3/6'/>
            <Button
               
            >Login with Google</Button>

        </div>
    )
}