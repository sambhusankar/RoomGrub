'use client'
import react from 'react'
import { Box, Sheet, Dropdown, Menu, MenuButton, MenuItem, Avatar, IconButton, Typography } from '@mui/joy';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

export default function NavBar({ page_name = 'ali', user, signOut }) {
	function handleSignOut() {
		console.log('signing out')
		signOut()
	}
	
	return (
		<Sheet
			variant='outlined'
			sx={{
				p: '6px',
				display: 'flex',
				justifyContent: "space-between",
				alignItems: "center"
			}}
		>
			<Typography level="h3">ROOM GRUB</Typography>
			{user && <Dropdown >
				<MenuButton
					slots={{ root: IconButton }}
					slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
				>
					<Avatar size="sm" src={user?.user_metadata?.picture} />
				</MenuButton>
				<Menu placement="bottom-start" size="sm">
					<MenuItem disabled>{user?.user_metadata?.name}</MenuItem>
					<MenuItem onClick={handleSignOut} ><LogoutIcon />Logout</MenuItem>
				</Menu>
			</Dropdown>}
		</Sheet>
	)
}