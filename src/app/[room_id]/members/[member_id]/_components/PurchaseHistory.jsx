'use client';

import { Typography, Card, CardContent, Stack, Box } from '@mui/joy';

export default function PurchaseHistory({ purchases }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <Box sx={{ flex: 1 }}>
            <Typography level="title-lg" sx={{ mb: 2 }}>Purchase History</Typography>
            {purchases.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography>No purchases found</Typography>
                    </CardContent>
                </Card>
            ) : (
                <Stack spacing={2}>
                    {purchases.map((purchase) => (
                        <Card key={purchase.id} variant="outlined">
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography level="title-sm">{purchase.material}</Typography>
                                        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                                            {formatDate(purchase.created_at)}
                                        </Typography>
                                    </Box>
                                    <Typography level="title-md" sx={{ color: 'success.500' }}>
                                        {formatCurrency(purchase.money)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}