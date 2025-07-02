'server-only'
import react from 'react'
import NavBar from './NavBar'
import {Box} from '@mui/joy'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default async function NavBarContainer({children}){
    const session = await auth()
    async function signOutFn(){
        'use server'
        const result = await signOut()
        if (result) {
            redirect('/login');
        }
    }
    return(
        <>
            <NavBar user = {session?.user} signOut = {signOutFn}></NavBar>
            <Box>
                {children}
            </Box>    
        </>
    )

}