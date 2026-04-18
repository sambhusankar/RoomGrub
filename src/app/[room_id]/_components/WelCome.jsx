import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';

export default function WelCome({ firstName }) {
  return (
    <Box sx={{ pt: 3, pb: 1, px: 1 }}>
      <Typography level="h3" fontWeight="lg">
        Hi {firstName} 👋
      </Typography>
      <Typography level="body-sm" color="neutral">
        Welcome Back
      </Typography>
    </Box>
  );
}
