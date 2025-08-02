'use client'
import React, { useEffect, useState } from 'react';
import { Box, Button, Select, MenuItem, Typography, Sheet } from '@mui/joy';
import { format, subMonths } from 'date-fns'; 

export default function Month() {

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM yyyy'));

  const handleUpdate = () => {
    console.log(`Month-Year selected: ${selectedMonth}`);
  };

  const months = Array.from({ length: 12 }).map((_, index) => {
    const date = subMonths(new Date(), index); // Get the previous months
    const monthYear = format(date, 'MMMM yyyy'); // Full month name and year (e.g., "August 2025")
    return monthYear;
  });

  useEffect(() => {
    console.log('Component mounted');
    console.log(`Initial selectedMonth: ${selectedMonth}`);
  }, []);  

  useEffect(() => {
    console.log(`Selected month updated: ${selectedMonth}`);
  }, [selectedMonth]); // This hook will run when selectedMonth changes

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
        <Select
          value={selectedMonth}  
          onChange={(e) => { 
            setSelectedMonth(e?.target?.value);
          }} 
          sx={{
            color: 'black',
            width: '100%',
            marginBottom: 2,
            fontSize: '1rem',
          }}
        >
          {months.map((monthYear) => (
            <MenuItem key={monthYear} value={monthYear}>
              {monthYear} 
            </MenuItem>
          ))}
        </Select>

        <Button
          onClick={handleUpdate}
          variant="contained"
          sx={{ width: '100%', backgroundColor: "blue" }}
        >
          Update
        </Button>
      </Sheet>
    </Box>
  );
}
