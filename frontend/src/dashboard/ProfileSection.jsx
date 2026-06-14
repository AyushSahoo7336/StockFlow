import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, Avatar, CircularProgress, Button
} from '@mui/material';
import { api } from '../config/api';

export default function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/user/profile');
        if (response.data.success && response.data.user) {
          setName(response.data.user.name || '');
          setEmail(response.data.user.email || '');
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (fullName) => {
    if (!fullName) return 'T';
    const parts = fullName.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      window.location.href = "/login"; 
    } catch (error) {
      alert("Failed to sign out cleanly.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '700px', mx: 'auto', mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 900,
            fontFamily: "'Poppins', 'Inter', sans-serif'",
            background: 'linear-gradient(45deg, #0f172a 30%, #3b82f6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            mb: 0.5
          }}>
            My Profile
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>
            View your personal account details securely.
          </Typography>
        </Box>
      <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Avatar 
          sx={{ width: 80, height: 80, bgcolor: '#1a73e8', fontSize: '2rem', fontWeight: 'bold' }}
        >
          {getInitials(name)}
        </Avatar>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h5" fontWeight="bold" color="#0f172a">
              {name || 'Trader'}
            </Typography>
            <Typography variant="caption" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', px: 1, py: 0.5, borderRadius: '4px', fontWeight: 'bold' }}>
              Pro Member
            </Typography>
          </Box>
          <Typography variant="body1" color="#64748b">
            {email || 'No email attached'}
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleLogout}
          sx={{ fontWeight: 'bold', borderRadius: '8px', px: 4, py: 1.2, textTransform: 'none', borderWidth: '2px', '&:hover': { borderWidth: '2px', bgcolor: '#fef2f2' } }}
        >
          Logout
        </Button>
      </Box>

    </Box>
  );
}