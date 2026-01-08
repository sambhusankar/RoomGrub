'use client'
import React, { useState, useEffect } from "react";
import { TextField, Button, Paper } from "@mui/material";
import { Box, Modal, ModalDialog, ModalClose, Avatar, Stack, Select, Option } from "@mui/joy";
import { createClient } from "@/utils/supabase/client";
import { useParams } from 'next/navigation'
import NotificationService from '@/services/NotificationService'
import useUserRole from '@/hooks/useUserRole';
import { addGroceryForFriend } from '../actions';

export default function AddGrocery() {
    const [grocery, setGrocery] = useState("");
    const [price, setPrice] = useState("");
    const [date, setDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const params = useParams()
    const dateInputRef = React.useRef(null);
    const { role, loadings } = useUserRole();

    // Add for friend state
    const [showFriendModal, setShowFriendModal] = useState(false);
    const [roomMembers, setRoomMembers] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendGrocery, setFriendGrocery] = useState("");
    const [friendPrice, setFriendPrice] = useState("");
    const [friendDate, setFriendDate] = useState("");
    const [friendLoading, setFriendLoading] = useState(false);
    const [friendMsg, setFriendMsg] = useState("");

    const supabase = createClient();

    // Fetch room members for admin
    useEffect(() => {
        if (!loadings && role === 'Admin') {
            fetchRoomMembers();
        }
    }, [loadings, role]);

    const fetchRoomMembers = async () => {
        const { data: members, error } = await supabase
            .from('Users')
            .select('*')
            .eq('room', params.room_id);

        if (!error && members) {
            setRoomMembers(members);
        }
    };
    const handleAdd = async () => {
        setMsg("");
        if (!grocery || !price) {
            setMsg("Please fill all fields.");
            return;
        }
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user?.email) {
            setMsg("Unable to get user session.");
            setLoading(false);
            return;
        }
        const userEmail = session.user.email;
        
        // Get user data for notifications
        const { data: userData } = await supabase
            .from("Users")
            .select("id, name")
            .eq("email", userEmail)
            .single();

        const insertData = { 
            room: params.room_id, 
            material: grocery, 
            money: parseFloat(price), 
            user: userEmail 
        };
        
        // If user provided a date, use it; otherwise let database use default (current timestamp)
        if (date) {
            insertData.created_at = new Date(date).toISOString();
        }
        
        const { error } = await supabase
            .from("Spendings")
            .insert([insertData]);
        if (error) {
            setMsg("❌ Error adding grocery.");
            console.log(error)
        } else {
            setMsg("✅ Grocery added!");
            setGrocery("");
            setPrice("");
            setDate("");
            
            // Send notification to room members
            try {
                if (userData) {
                    await NotificationService.notifyGroceryAdded(
                        parseInt(params.room_id),
                        userData.id,
                        userData.name || userEmail,
                        1 // item count
                    );
                    console.log('Grocery notification sent successfully');
                }
            } catch (notificationError) {
                console.error('Failed to send grocery notification:', notificationError);
                // Don't show error to user as the main action succeeded
            }
        }
        setLoading(false);
    };

    const handleDateFieldClick = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker();
        }
    };

    const handleAddForFriend = async () => {
        setFriendMsg("");

        if (!selectedFriend) {
            setFriendMsg("Please select a friend.");
            return;
        }

        if (!friendGrocery || !friendPrice) {
            setFriendMsg("Please fill all fields.");
            return;
        }

        setFriendLoading(true);

        const result = await addGroceryForFriend(
            params.room_id,
            selectedFriend.email,
            friendGrocery,
            friendPrice,
            friendDate
        );

        if (result.success) {
            setFriendMsg("✅ " + result.message);
            setSelectedFriend(null);
            setFriendGrocery("");
            setFriendPrice("");
            setFriendDate("");

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowFriendModal(false);
                setFriendMsg("");
            }, 2000);
        } else {
            setFriendMsg("❌ " + result.error);
        }

        setFriendLoading(false);
    };

    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Paper className="p-8 max-w-lg mx-auto mt-10 shadow-2xl bg-white rounded-2xl">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Add Grocery
                </h2>
                <div className="flex flex-col gap-6">
                    <TextField
                        label="Grocery Item"
                        value={grocery}
                        onChange={e => setGrocery(e.target.value)}
                        variant="outlined"
                        fullWidth
                        className="bg-white"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2563eb',
                                },
                            },
                        }}
                    />
                    <TextField
                        label="Price ($)"
                        value={price}
                        onChange={e => setPrice(e.target.value.replace(/[^-0-9.]/g, ""))}
                        variant="outlined"
                        type="number"
                        inputProps={{ step: "0.01", min: "0" }}
                        fullWidth
                        className="bg-white"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2563eb',
                                },
                            },
                        }}
                    />
                    <TextField
                        label="Date (optional)"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        variant="outlined"
                        type="date"
                        fullWidth
                        className="bg-white"
                        helperText="Leave empty to use current date"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                '&:hover fieldset': {
                                    borderColor: '#3b82f6',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2563eb',
                                },
                            },
                            '& .MuiFormHelperText-root': {
                                color: '#6b7280',
                                fontSize: '0.875rem',
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={loading}
                        className="!py-4 !mt-4 !rounded-xl !text-lg !font-semibold"
                        sx={{
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            boxShadow: loading ? 'none' : '0 4px 15px 0 rgba(59, 130, 246, 0.4)',
                            '&:hover': {
                                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                boxShadow: loading ? 'none' : '0 6px 20px 0 rgba(59, 130, 246, 0.6)',
                                transform: loading ? 'none' : 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {loading ? "Adding..." : "Add Grocery"}
                    </Button>
                    {msg && (
                        <div
                            className={`text-center text-lg font-medium p-4 rounded-xl ${
                                msg === "✅ Grocery added!"
                                    ? "text-green-700 bg-green-50 border border-green-200"
                                    : "text-red-700 bg-red-50 border border-red-200"
                            }`}
                        >
                            {msg}
                        </div>
                    )}
                </div>

                {/* Add for friend button - only visible to admins */}
                {!loadings && role === 'Admin' && (
                    <div className="mt-6 text-left">
                        <p
                            onClick={() => setShowFriendModal(true)}
                            className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition-colors"
                            style={{ display: 'inline-block' }}
                        >
                            Add for your friend
                        </p>
                    </div>
                )}
            </Paper>

            {/* Add for Friend Modal */}
            <Modal open={showFriendModal} onClose={() => setShowFriendModal(false)}>
                <ModalDialog sx={{ minWidth: { xs: '90%', sm: 500 }, maxWidth: 600 }}>
                    <ModalClose />
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">
                        Add Grocery for Friend
                    </h3>
                    <div className="flex flex-col gap-4">
                        {/* Friend Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Friend
                            </label>
                            <Select
                                placeholder="Choose a friend..."
                                value={selectedFriend?.id}
                                onChange={(e, newValue) => {
                                    const friend = roomMembers.find(m => m.id === newValue);
                                    setSelectedFriend(friend || null);
                                }}
                            >
                                {roomMembers.map((member) => (
                                    <Option key={member.id} value={member.id}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar
                                                src={member.profile || '/default-profile.png'}
                                                alt={member.name}
                                                size="sm"
                                            />
                                            <Box>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                            </Box>
                                        </Stack>
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        {/* Grocery Item */}
                        <TextField
                            label="Grocery Item"
                            value={friendGrocery}
                            onChange={e => setFriendGrocery(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                },
                            }}
                        />

                        {/* Price */}
                        <TextField
                            label="Price ($)"
                            value={friendPrice}
                            onChange={e => setFriendPrice(e.target.value.replace(/[^-0-9.]/g, ""))}
                            variant="outlined"
                            type="number"
                            inputProps={{ step: "0.01", min: "0" }}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                },
                            }}
                        />

                        {/* Date */}
                        <TextField
                            label="Date (optional)"
                            value={friendDate}
                            onChange={e => setFriendDate(e.target.value)}
                            variant="outlined"
                            type="date"
                            fullWidth
                            helperText="Leave empty to use current date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                },
                            }}
                        />

                        {/* Add Button */}
                        <Button
                            variant="contained"
                            onClick={handleAddForFriend}
                            disabled={friendLoading}
                            className="!py-3 !mt-2 !rounded-xl !text-base !font-semibold"
                            sx={{
                                background: friendLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                '&:hover': {
                                    background: friendLoading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                },
                            }}
                        >
                            {friendLoading ? "Adding..." : "Add Grocery"}
                        </Button>

                        {/* Message */}
                        {friendMsg && (
                            <div
                                className={`text-center text-sm font-medium p-3 rounded-xl ${
                                    friendMsg.startsWith("✅")
                                        ? "text-green-700 bg-green-50 border border-green-200"
                                        : "text-red-700 bg-red-50 border border-red-200"
                                }`}
                            >
                                {friendMsg}
                            </div>
                        )}
                    </div>
                </ModalDialog>
            </Modal>
        </div>
    )
}