'use client'
import React, { useState, useEffect, useRef } from "react";
import { Avatar, Input } from "@mui/joy";
import { createClient } from "@/utils/supabase/client";
import { useParams } from 'next/navigation'
import NotificationService from '@/services/NotificationService'
import { addGroceryForFriend } from '../actions';

// Parse raw input, enforce max 5 integer digits, return clean numeric string
function parseAmountInput(raw) {
    // strip everything except digits and one decimal point
    let clean = raw.replace(/[^0-9.]/g, '');
    // only one decimal point
    const parts = clean.split('.');
    if (parts.length > 2) clean = parts[0] + '.' + parts.slice(1).join('');
    // max 5 integer digits
    const [intPart, decPart] = clean.split('.');
    if (intPart && intPart.length > 5) return null; // reject
    return clean;
}

// Format stored numeric string with commas for display
function formatAmount(raw) {
    if (!raw) return '';
    const [intPart, decPart] = raw.split('.');
    const formatted = parseInt(intPart || '0', 10).toLocaleString('en-IN');
    return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

// Shared expense entry screen — flows inside the normal page layout
function ExpenseScreen({
    title,
    amount,
    description,
    date,
    loading,
    msg,
    onAmountChange,
    onAmountKeyDown,
    onDescriptionChange,
    onDescriptionKeyDown,
    onSubmit,
    onDatePick,
    formattedDate,
    amountInputRef,
    descriptionInputRef,
    dateInputRef,
    friendSlot,
    submitLabel = 'Add Expense',
}) {
    const canSubmit = description.trim().length > 0 && parseFloat(amount) > 0;

    return (
        <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 120px)' }}>
            {/* Header label */}
            <div className="flex items-center justify-center pt-4 pb-1">
                <p className="text-purple-500 text-xs font-semibold tracking-widest uppercase">{title}</p>
            </div>

            {/* Zone 1: Amount + description inputs */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 min-h-0 gap-10">
                {/* Amount — MUI Joy Input with ₹ decorator, comma formatting, 5-digit cap */}
                <Input
                    slotProps={{ input: { ref: amountInputRef, inputMode: 'decimal', autoFocus: true } }}
                    value={formatAmount(amount)}
                    onChange={onAmountChange}
                    onKeyDown={onAmountKeyDown}
                    placeholder="0"
                    startDecorator={<span style={{ fontSize: 'clamp(1.5rem, 8vw, 3rem)', fontWeight: 300, color: '#a855f7' }}>₹</span>}
                    variant="plain"
                    sx={{
                        background: 'transparent',
                        boxShadow: 'none !important',
                        border: 'none !important',
                        outline: 'none',
                        '&:before': { display: 'none' },
                        '&:after': { display: 'none' },
                        '--Input-focusedHighlight': 'transparent',
                        '--Input-focusedThickness': '0px',
                        '--Input-radius': '0px',
                        gap: 0,
                        p: 0,
                        '& input': {
                            fontSize: 'clamp(3.5rem, 18vw, 7rem)',
                            fontWeight: 700,
                            color: '#1f2937',
                            caretColor: '#9333ea',
                            textAlign: 'left',
                            p: 0,
                            width: `${Math.max(1, (formatAmount(amount) || '0').length)}ch`,
                            minWidth: '1ch',
                        },
                    }}
                />

                {/* Description — disabled (and dimmed) until amount is entered */}
                <div className="w-full max-w-xs text-center">
                    <input
                        ref={descriptionInputRef}
                        type="text"
                        inputMode="text"
                        placeholder="What did you buy?"
                        value={description}
                        onChange={onDescriptionChange}
                        onKeyDown={onDescriptionKeyDown}
                        disabled={!(parseFloat(amount) > 0)}
                        className="w-full bg-transparent border-b-2 text-gray-800 text-xl font-medium outline-none pb-2 text-center transition-colors
                            disabled:opacity-30 disabled:cursor-not-allowed
                            border-purple-200 focus:border-purple-400 placeholder-purple-200"
                        style={{ caretColor: '#9333ea' }}
                    />
                </div>

                {msg && (
                    <div className={`mt-6 text-sm font-medium px-5 py-2.5 rounded-xl ${
                        msg.startsWith('✅')
                            ? 'text-green-700 bg-green-50 border border-green-200'
                            : 'text-red-700 bg-red-50 border border-red-200'
                    }`}>
                        {msg}
                    </div>
                )}
            </div>

            {/* Zone 2: Toolbar */}
            <div className="flex items-center px-5 py-3 gap-3 border-t border-purple-100">
                {friendSlot}
                <div className="flex-1" />
                <input
                    ref={dateInputRef}
                    type="date"
                    value={date}
                    onChange={e => onDatePick(e.target.value)}
                    className="sr-only"
                    aria-hidden="true"
                />
                <button
                    onClick={() => { try { dateInputRef.current?.showPicker(); } catch (_) {} }}
                    className="flex items-center gap-1.5 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 active:bg-purple-100 select-none font-medium"
                >
                    📅 {formattedDate ?? 'Today'}
                </button>
            </div>

            {/* Zone 3: Submit button — always visible, disabled until both fields filled */}
            <div className="px-5 pb-4 pt-2">
                <button
                    onClick={onSubmit}
                    disabled={!canSubmit || loading}
                    className="w-full py-4 rounded-2xl text-lg font-bold text-white tracking-wide transition-all active:scale-[0.98] disabled:opacity-30 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)' }}
                >
                    {loading ? 'Adding...' : submitLabel}
                </button>
            </div>
        </div>
    );
}

export default function AddGrocery({ userRole }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const [showFriendScreen, setShowFriendScreen] = useState(false);
    const [friendAmount, setFriendAmount] = useState('');
    const [friendDescription, setFriendDescription] = useState('');
    const [friendDate, setFriendDate] = useState('');
    const [friendLoading, setFriendLoading] = useState(false);
    const [friendMsg, setFriendMsg] = useState('');

    const [roomMembers, setRoomMembers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showMemberPicker, setShowMemberPicker] = useState(false);

    const amountInputRef = useRef(null);
    const descriptionInputRef = useRef(null);
    const dateInputRef = useRef(null);
    const friendAmountInputRef = useRef(null);
    const friendDescriptionInputRef = useRef(null);
    const friendDateInputRef = useRef(null);

    const params = useParams();
    const supabase = createClient();

    useEffect(() => {
        if (showFriendScreen) {
            setTimeout(() => friendAmountInputRef.current?.focus(), 100);
        }
    }, [showFriendScreen]);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;
            const { data: memberRows } = await supabase.from('UserRooms').select('Users(*)').eq('room_id', params.room_id);
            const members = memberRows?.map(r => r.Users) ?? [];
            if (members.length > 0) {
                setRoomMembers(members);
                const me = members.find(m => m.email === session.user.email);
                if (me) { setCurrentUser(me); setSelectedFriend(me); }
            }
        };
        init();
    }, [params.room_id]);

    const formattedDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : null;

    const handleAdd = async () => {
        setMsg('');
        if (!description || parseFloat(amount) <= 0) { setMsg('Please enter amount and description.'); return; }
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email;
        if (!userEmail) { setMsg('Unable to get session.'); setLoading(false); return; }
        const { data: userData } = await supabase.from('Users').select('id, name').eq('email', userEmail).single();
        const insertData = { room: params.room_id, material: description, money: parseFloat(amount), user: userEmail };
        if (date) insertData.created_at = new Date(date).toISOString();
        const { error } = await supabase.from('Spendings').insert([insertData]);
        if (error) {
            setMsg('❌ Error adding expense.');
        } else {
            setMsg('✅ Expense added!');
            setAmount(''); setDescription(''); setDate('');
            setTimeout(() => { setMsg(''); amountInputRef.current?.focus(); }, 1500);
            try {
                if (userData) await NotificationService.notifyGroceryAdded(parseInt(params.room_id), userData.id, userData.name || userEmail, 1);
            } catch (_) {}
        }
        setLoading(false);
    };

    const openFriendScreen = () => {
        setFriendAmount('');
        setFriendDescription('');
        setFriendDate('');
        setFriendMsg('');
        setShowFriendScreen(true);
    };

    const handleFriendAdd = async () => {
        setFriendMsg('');
        if (!friendDescription || parseFloat(friendAmount) <= 0) { setFriendMsg('Please enter amount and description.'); return; }
        if (!selectedFriend) { setFriendMsg('Please select a friend.'); return; }
        setFriendLoading(true);
        if (selectedFriend.email === currentUser?.email) {
            const { data: { session } } = await supabase.auth.getSession();
            const userEmail = session?.user?.email;
            const insertData = { room: params.room_id, material: friendDescription, money: parseFloat(friendAmount), user: userEmail };
            if (friendDate) insertData.created_at = new Date(friendDate).toISOString();
            const { error } = await supabase.from('Spendings').insert([insertData]);
            if (error) { setFriendMsg('❌ Error adding expense.'); }
            else { setFriendMsg('✅ Expense added!'); setTimeout(() => setShowFriendScreen(false), 1200); }
        } else {
            const result = await addGroceryForFriend(params.room_id, selectedFriend.email, friendDescription, friendAmount, friendDate);
            if (result.success) { setFriendMsg('✅ ' + result.message); setTimeout(() => setShowFriendScreen(false), 1200); }
            else { setFriendMsg('❌ ' + result.error); }
        }
        setFriendLoading(false);
    };

    const friendSelectorSlot = (
        <div className="relative">
            <button
                onClick={() => userRole === 'Admin' && setShowMemberPicker(p => !p)}
                className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-full pl-1 pr-3 py-1 active:bg-purple-100 select-none font-medium"
            >
                <Avatar
                    src={selectedFriend?.profile || '/default-profile.png'}
                    alt={selectedFriend?.name || ''}
                    size="sm"
                    sx={{ width: 26, height: 26 }}
                />
                <span>{selectedFriend?.id === currentUser?.id ? 'Me' : (selectedFriend?.name || 'Select')}</span>
                {userRole === 'Admin' && <span className="text-purple-400 text-xs">▾</span>}
            </button>
            {showMemberPicker && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 min-w-[180px] z-10">
                    {roomMembers.map(member => (
                        <button
                            key={member.id}
                            onClick={() => { setSelectedFriend(member); setShowMemberPicker(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-purple-50 transition-colors ${selectedFriend?.id === member.id ? 'bg-purple-50' : ''}`}
                        >
                            <Avatar src={member.profile || '/default-profile.png'} alt={member.name} size="sm" sx={{ width: 28, height: 28 }} />
                            <div>
                                <div className="text-sm font-medium text-gray-800">
                                    {member.id === currentUser?.id ? `${member.name} (Me)` : member.name}
                                </div>
                                <div className="text-xs text-gray-400">{member.email}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    if (showFriendScreen) {
        return (
            <ExpenseScreen
                title="Add Expense for Friend"
                amount={friendAmount}
                description={friendDescription}
                date={friendDate}
                loading={friendLoading}
                msg={friendMsg}
                onAmountChange={e => { const v = parseAmountInput(e.target.value); if (v !== null) setFriendAmount(v); }}
                onAmountKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); friendDescriptionInputRef.current?.focus(); } }}
                onDescriptionChange={e => setFriendDescription(e.target.value)}
                onDescriptionKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); document.activeElement?.blur(); } }}
                onSubmit={handleFriendAdd}
                onDatePick={setFriendDate}
                formattedDate={formattedDate(friendDate)}
                amountInputRef={friendAmountInputRef}
                descriptionInputRef={friendDescriptionInputRef}
                dateInputRef={friendDateInputRef}
                submitLabel={`Add for ${selectedFriend?.id === currentUser?.id ? 'Me' : (selectedFriend?.name || 'Friend')}`}
                friendSlot={friendSelectorSlot}
            />
        );
    }

    return (
        <ExpenseScreen
            title="Add Expense"
            amount={amount}
            description={description}
            date={date}
            loading={loading}
            msg={msg}
            onAmountChange={e => { const v = parseAmountInput(e.target.value); if (v !== null) setAmount(v); }}
            onAmountKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); descriptionInputRef.current?.focus(); } }}
            onDescriptionChange={e => setDescription(e.target.value)}
            onDescriptionKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); document.activeElement?.blur(); } }}
            onSubmit={handleAdd}
            onDatePick={setDate}
            formattedDate={formattedDate(date)}
            amountInputRef={amountInputRef}
            descriptionInputRef={descriptionInputRef}
            dateInputRef={dateInputRef}
            friendSlot={
                userRole === 'Admin' ? (
                    <button
                        onClick={openFriendScreen}
                        className="flex items-center gap-1.5 text-sm text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-4 py-2 active:bg-purple-100 select-none font-medium"
                    >
                        👥 Friend
                    </button>
                ) : null
            }
        />
    );
}
