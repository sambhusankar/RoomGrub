'use client'
import React, { useState } from 'react';
import { Box, Typography } from '@mui/joy';
import ActivityFilters from './ActivityFilters';
import ActivityCard from './ActivityCard';

export default function ActivityList({ activities, isAdmin, roomId }) {
  const [filterType, setFilterType] = useState('all');

  // Filter activities based on selected type
  const filteredActivities = activities.filter(activity => {
    if (filterType === 'all') return true;
    return activity.type === filterType;
  });

  return (
    <Box sx={{
      maxWidth: '900px',
      mx: 'auto',
    }}>
      {/* Filters */}
      <ActivityFilters
        filterType={filterType}
        onFilterChange={setFilterType}
      />

      {/* Activities List */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 3,
      }}>
        {filteredActivities.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            bgcolor: 'background.surface',
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'neutral.outlinedBorder',
          }}>
            <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
              No activities found
            </Typography>
          </Box>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={`${activity.type}-${activity.id}`}
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
