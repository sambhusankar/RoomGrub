'use client'
import React, { useState } from "react";
import { TextField, Button, Paper } from "@mui/material";
import { createClient } from "@/utils/supabase/client";
import { useParams } from 'next/navigation'
import NotificationService from '@/services/NotificationService'

export default function AddGrocery() {
    const [grocery, setGrocery] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const params = useParams()

    const supabase = createClient()
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

        const { error } = await supabase
            .from("Spendings")
            .insert([{ room: params.room_id, material: grocery, money: parseFloat(price), user: userEmail }]);
        if (error) {
            setMsg("❌ Error adding grocery.");
            console.log(error)
        } else {
            setMsg("✅ Grocery added!");
            setGrocery("");
            setPrice("");
            
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

    return(
    <Paper className="p-6 max-w-md mx-auto mt-10 shadow-lg bg-white">
                <h2 className="text-2xl font-bold mb-4 text-center">Add Grocery</h2>
                <div className="flex flex-col gap-4">
                    <TextField
                        label="Grocery"
                        value={grocery}
                        onChange={e => setGrocery(e.target.value)}
                        variant="outlined"
                        className="bg-white"
                    />
                    <TextField
                        label="Price"
                        value={price}
                        onChange={e => setPrice(e.target.value.replace(/[^-0-9.]/g, ""))}
                        variant="outlined"
                        type="number"
                        inputProps={{ step: "0.01", min: "0" }}
                        className="bg-white"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAdd}
                        disabled={loading}
                        className="!py-3"
                    >
                        {loading ? "Adding..." : "Add Grocery"}
                    </Button>
                    {msg && (
    <div
        className={`text-center text-sm mt-2 ${
            msg === "✅ Grocery added!" ? "text-green-600" : "text-red-500"
        }`}
    >
        {msg}
    </div>
)
}
                </div>
            </Paper>

    )
}