'use client'
import React, { useState } from 'react';
import { Box, Typography } from '@mui/joy';
import ActivityFilters from './ActivityFilters';
import ActivityCard from './ActivityCard';

export default function ActivityList({ activities, isAdmin, roomId, userMap }) {
  const [userFilter, setUserFilter] = useState('');
  const [textFilter, setTextFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filtered = activities.filter(a => {
    if (userFilter && a.userEmail !== userFilter) return false;
    if (textFilter && !a.description.toLowerCase().includes(textFilter.toLowerCase())) return false;
    if (dateRange.from && new Date(a.createdAt) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(a.createdAt) > new Date(dateRange.to + 'T23:59:59')) return false;
    return true;
  });

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
      <ActivityFilters
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        textFilter={textFilter}
        setTextFilter={setTextFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        userMap={userMap}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
        {filtered.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            bgcolor: 'background.surface',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'neutral.outlinedBorder',
          }}>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              No pending expenses found
            </Typography>
          </Box>
        ) : (
          filtered.map((activity) => (
            <ActivityCard
              key={`grocery-${activity.id}`}
              activity={activity}
              isAdmin={isAdmin}
              roomId={roomId}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
