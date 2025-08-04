'use client'
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Sheet } from '@mui/joy';
import { format, subMonths } from 'date-fns'; 

export default function Month() {
  // Generate months array
  const months = Array.from({ length: 12 }).map((_, index) => {
    const date = subMonths(new Date(), index);
    const monthYear = format(date, 'MMMM yyyy');
    return monthYear;
  });

  // Initialize with the first month
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const handleUpdate = () => {
    console.log(`Month-Year selected: ${selectedMonth}`);
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    console.log('Native select value:', value);
    setSelectedMonth(value);
  };

  useEffect(() => {
    console.log('Component mounted');
    console.log(`Initial selectedMonth: ${selectedMonth}`);
  }, []);  

  useEffect(() => {
    console.log(`Selected month updated: ${selectedMonth}`);
  }, [selectedMonth]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 2,
        flexDirection: 'column',
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          padding: 2,
          width: '100%',
          maxWidth: 500,
          borderRadius: '8px',
          boxShadow: 2,
        }}
      >
        <Typography level="h4" align="center" sx={{ marginBottom: 2 }}>
          Settings Page
        </Typography>
        
        <Typography level="body1" sx={{ marginBottom: 1 }}>
          Select Month-Year:
        </Typography>
        
        {/* Using native HTML select instead of MUI Joy Select */}
        <select
          value={selectedMonth}
          onChange={handleSelectChange}
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          {months.map((monthYear) => (
            <option key={monthYear} value={monthYear}>
              {monthYear}
            </option>
          ))}
        </select>

        <Button
          onClick={handleUpdate}
          variant="solid"
          sx={{ 
            width: '100%', 
            backgroundColor: "blue",
            '&:hover': {
              backgroundColor: "darkblue"
            }
          }}
        >
          Update
        </Button>
      </Sheet>
    </Box>
  );
}