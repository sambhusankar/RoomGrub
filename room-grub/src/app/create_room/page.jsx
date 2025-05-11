'use client'
import React from 'react';
import {Button} from '@mui/material'
import {useRouter} from 'next/navigation'
import {redirect} from 'next/navigation';

export default function page(){
    const router = useRouter()
    function createRoom(){
        console.log('testing')
        redirect('/1')
    }
    return(
        <div>
            <h2 class = "font-bold m-3">You are not joined any room</h2>
            <div class = "m-8 text-center">
                <Button sx = {{
                    backgroundColor: 'blue',
                    color: 'white',
                    padding: '5px 5px',
                    fontWeight: 'bold',
                    margin: '5px',
                    '&:hover': {
                        backgroundColor: 'darkblue'
                    }
                    
                }}
                onClick={ () => createRoom()}>Create & Manage Your room</Button>
                <p>--------------------- OR ------------------------</p>
                <p class="m-5 text-gray">Tell your friend to add you as a member</p>
            </div>
        </div>
    )
}