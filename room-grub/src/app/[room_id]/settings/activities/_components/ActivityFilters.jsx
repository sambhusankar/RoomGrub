'use client'
import React from 'react';
import { Box, Typography, Sheet } from '@mui/joy';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function ActivityFilters({ filterType, onFilterChange }) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        padding: 2.5,
        borderRadius: '12px',
        bgcolor: 'background.surface',
        border: '1px solid',
        borderColor: 'neutral.outlinedBorder',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FilterListIcon sx={{ color: 'text.secondary' }} />
        <Typography level="title-sm" sx={{ fontWeight: 600 }}>
          Filter by:
        </Typography>
        <select
          value={filterType}
          onChange={(e) => onFilterChange(e.target.value)}
          style={{
            flex: 1,
            maxWidth: '250px',
            padding: '8px 12px',
            fontSize: '0.95rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: 'black',
            cursor: 'pointer',
          }}
        >
          <option value="all">All Activities</option>
          <option value="grocery">Groceries Only</option>
          <option value="payment">Payments Only</option>
        </select>
      </Box>
    </Sheet>
  );
}
