'use client';

import React from 'react';

const formatAmount = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));

export default function SplitsShareCard({ shareRef, splitCalculation, filters }) {
    const { totalPendingExpenses, equalShare, memberBalances } = splitCalculation;

    const from = filters?.dateRange?.from;
    const to = filters?.dateRange?.to;
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const dateLabel = from || to
        ? from && to
            ? `${formatDate(from)} – ${formatDate(to)}`
            : from
            ? `From ${formatDate(from)}`
            : `Until ${formatDate(to)}`
        : null;

    return (
        <div
            ref={shareRef}
            style={{
                position: 'absolute',
                left: '-9999px',
                top: 0,
                width: '380px',
                background: '#faf5ff',
                borderRadius: '16px',
                padding: '24px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                color: '#1a1a2e',
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: '20px', borderBottom: '2px solid #e9d5ff', paddingBottom: '16px' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#7e22ce', marginBottom: '4px' }}>
                    🏠 RoomGrub
                </div>
                <div style={{ fontSize: '13px', color: '#9333ea' }}>
                    Expense Splits Summary
                </div>
                {dateLabel && (
                    <div style={{
                        marginTop: '6px',
                        display: 'inline-block',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#6d28d9',
                        background: '#ede9fe',
                        borderRadius: '6px',
                        padding: '3px 8px',
                    }}>
                        🗓 {dateLabel}
                    </div>
                )}
            </div>

            {/* Summary Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                    flex: 1, background: '#ede9fe', borderRadius: '12px',
                    padding: '12px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '11px', color: '#6d28d9', fontWeight: 600, marginBottom: '4px' }}>
                        TOTAL PENDING
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#4c1d95' }}>
                        {formatAmount(totalPendingExpenses)}
                    </div>
                </div>
                <div style={{
                    flex: 1, background: '#d1fae5', borderRadius: '12px',
                    padding: '12px', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '11px', color: '#065f46', fontWeight: 600, marginBottom: '4px' }}>
                        PER PERSON
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#064e3b' }}>
                        {formatAmount(equalShare)}
                    </div>
                </div>
            </div>

            {/* Member Balances */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {memberBalances.map((mb) => {
                    const isCredit = mb.status === 'credit';
                    const isDebit = mb.status === 'debit';
                    const bg = isCredit ? '#d1fae5' : isDebit ? '#fee2e2' : '#f3f4f6';
                    const color = isCredit ? '#065f46' : isDebit ? '#991b1b' : '#374151';
                    const label = isCredit ? '▲ gets back' : isDebit ? '▼ owes' : '✓ even';
                    const initial = (mb.member.name || mb.member.email).charAt(0).toUpperCase();

                    return (
                        <div key={mb.member.email} style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: bg, borderRadius: '10px', padding: '10px 12px'
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: '#7e22ce', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '15px', fontWeight: 700, flexShrink: 0
                            }}>
                                {initial}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color }}>
                                    {mb.member.name || mb.member.email}
                                </div>
                                <div style={{ fontSize: '11px', color, opacity: 0.8 }}>
                                    {label}
                                </div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color }}>
                                {mb.status === 'even' ? '₹0' : formatAmount(mb.balance)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#a78bfa' }}>
                Shared via RoomGrub
            </div>
        </div>
    );
}
