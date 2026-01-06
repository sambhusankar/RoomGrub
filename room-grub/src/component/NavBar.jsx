'use client'
import react from 'react'
import { Box, Sheet, Dropdown, Menu, MenuButton, MenuItem, Avatar, IconButton, Typography } from '@mui/joy';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRouter, useParams } from 'next/navigation';

export default function NavBar({ page_name = 'ali', user, signOut }) {
	const {room_id} = useParams()
	function handleSignOut() {
		console.log('signing out')
		signOut()
	}
	const router = useRouter();
	return (
		<Sheet
			variant='outlined'
			sx={{
				p: '6px',
				display: 'flex',
				justifyContent: "space-between",
				alignItems: "center",
				backgroundColor: 'transparent',
			}}
		>
			<Typography
				level="h3"
				onClick={() => router.push(`/${room_id}`)}
				sx={{
					cursor: 'pointer',
					'&:hover': {
						opacity: 0.8,
					},
				}}
			>
				RoomGrub
			</Typography>
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
					<MenuItem onClick={() => router.push(`${room_id}/settings`)}><SettingsIcon />Settings</MenuItem>
				</Menu>
			</Dropdown>}
		</Sheet>
	)
}