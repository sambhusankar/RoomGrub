'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, isBefore, isAfter, addMonths, subMonths, getDay } from 'date-fns';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function Calendar({ month, from, to, hovered, onDayClick, onDayHover, maxDate }) {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const startOffset = getDay(start);

    const rangeEnd = hovered || to;

    return (
        <div>
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}
                {days.map(day => {
                    const isFrom = from && isSameDay(day, from);
                    const isTo = to && isSameDay(day, to);
                    const isHoveredEnd = hovered && !to && isSameDay(day, hovered);
                    const isEndpoint = isFrom || isTo || isHoveredEnd;
                    const isFuture = maxDate && isAfter(day, maxDate);

                    const inRange = from && rangeEnd && (
                        isBefore(from, rangeEnd)
                            ? isWithinInterval(day, { start: from, end: rangeEnd })
                            : isWithinInterval(day, { start: rangeEnd, end: from })
                    ) && !isEndpoint;

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDayClick(day)}
                            onMouseEnter={() => !isFuture && onDayHover(day)}
                            onMouseLeave={() => onDayHover(null)}
                            disabled={isFuture}
                            className={[
                                'text-sm h-9 w-full flex items-center justify-center transition-colors',
                                isFuture
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : isEndpoint
                                        ? 'rounded-full bg-blue-500 text-white font-semibold'
                                        : inRange
                                            ? 'bg-blue-100 text-blue-900'
                                            : 'rounded-full hover:bg-gray-100 text-gray-800',
                            ].join(' ')}
                        >
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function DateRangePicker({ from, to, onChange }) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(from ? parseISO(from) : new Date());
    const [hovered, setHovered] = useState(null);
    const [selecting, setSelecting] = useState(null); // first click stored here
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fromDate = from && isValid(parseISO(from)) ? parseISO(from) : null;
    const toDate = to && isValid(parseISO(to)) ? parseISO(to) : null;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const handleDayClick = (day) => {
        if (isAfter(day, today)) return;
        if (!selecting) {
            setSelecting(day);
            onChange({ from: format(day, 'yyyy-MM-dd'), to: '' });
        } else {
            const [start, end] = isBefore(selecting, day)
                ? [selecting, day]
                : [day, selecting];
            onChange({ from: format(start, 'yyyy-MM-dd'), to: format(end, 'yyyy-MM-dd') });
            setSelecting(null);
            setOpen(false);
        }
    };

    const label = (() => {
        if (fromDate && toDate) return `${format(fromDate, 'MMM d')} – ${format(toDate, 'MMM d')}`;
        if (fromDate) return `${format(fromDate, 'MMM d')} – ?`;
        return 'Select date range';
    })();

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 hover:border-gray-400 transition-colors"
            >
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className={fromDate ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => setMonth(m => subMonths(m, 1))}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                        >
                            ‹
                        </button>
                        <span className="text-sm font-semibold text-gray-800">
                            {format(month, 'MMMM yyyy')}
                        </span>
                        <button
                            onClick={() => setMonth(m => addMonths(m, 1))}
                            className="p-1 rounded hover:bg-gray-100 text-gray-600"
                        >
                            ›
                        </button>
                    </div>

                    {(fromDate || selecting) && (
                        <div className="text-center text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                            {selecting
                                ? `${format(selecting, 'MMM d')} – pick end date`
                                : fromDate && toDate
                                    ? `${format(fromDate, 'MMM d')} – ${format(toDate, 'MMM d')}`
                                    : null
                            }
                        </div>
                    )}

                    <Calendar
                        month={month}
                        from={selecting || fromDate}
                        to={!selecting ? toDate : null}
                        hovered={hovered}
                        onDayClick={handleDayClick}
                        onDayHover={setHovered}
                        maxDate={today}
                    />

                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => { onChange({ from: '', to: '' }); setSelecting(null); setOpen(false); }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        {toDate && !selecting && (
                            <button
                                onClick={() => setOpen(false)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
