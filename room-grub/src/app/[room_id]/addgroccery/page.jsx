"use client";
import React, { useState } from "react";
import { TextField, Button, Paper } from "@mui/material";
import { createClient } from "@/utils/supabase/client";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AddGrocery({ room_id }) {
    const [grocery, setGrocery] = useState("");
    const [price, setPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleAdd = async () => {
        setMsg("");
        if (!grocery || !price) {
            setMsg("Please fill all fields.");
            return;
        }
        setLoading(true);
        const { error } = await supabase
            .from("groceries")
            .insert([{ room_id, name: grocery, price: parseFloat(price) }]);
        if (error) {
            setMsg("Error adding grocery.");
        } else {
            setMsg("Grocery added!");
            setGrocery("");
            setPrice("");
        }
        setLoading(false);
    };

    return (
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
                    onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
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
                    <div className="text-center text-sm text-red-500 mt-2">{msg}</div>
                )}
            </div>
        </Paper>
    );
}