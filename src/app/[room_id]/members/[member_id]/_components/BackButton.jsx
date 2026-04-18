import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/joy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = () => {
    const router = useRouter();

    return (
        <Button
            variant="outlined"
            onClick={() => router.back()}
            startIcon={<ArrowBackIcon />}
        >
            Back
        </Button>
    );
};

export default BackButton;
