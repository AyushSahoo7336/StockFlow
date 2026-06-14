import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { api } from '../config/api';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Link,
  Chip,
  InputAdornment
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { loginContext } = useAuth();
  
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      return setError('All fields are required');
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/signup', formData);
      
      if (response.data.success) {
        loginContext(response.data.user);
        navigate('/dashboard');
      } 
      else {
        setError(response.data.message || 'Registration failed. Please try a different email.');
      }

    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Registration failed. Please try again.');
      } 
      else if (err.request) {
        setError('Server is currently offline. Please try again in a few moments.');
      } 
      else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, rgba(243, 244, 246, 0.6) 0%, rgba(255, 255, 255, 1) 100%)',
      overflow: 'hidden',
      m: 0,
      p: 2
    }}>

      <Box sx={{ position: 'absolute', width: 500, height: 400, bgcolor: 'primary.light', opacity: 0.12, filter: 'blur(80px)', borderRadius: '50%', left: '-10%', top: '20%', zIndex: 1 }} />
      <Box sx={{ position: 'absolute', width: 400, height: 400, bgcolor: 'primary.main', opacity: 0.08, filter: 'blur(90px)', borderRadius: '50%', right: '-5%', bottom: '15%', zIndex: 1 }} />

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, sm: 4 }, 
          width: '100%', 
          maxWidth: 420, 
          borderRadius: '24px', 
          border: '1px solid rgba(241, 245, 249, 0.8)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.035), 0 0 1px 1px rgba(0, 0, 0, 0.015)',
          bgcolor: '#ffffff',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Chip 
          icon={<ShieldOutlinedIcon sx={{ fontSize: '1.1rem !important', color: '#3b82f6' }} />} 
          label="Secure Investor Portal" 
          variant="outlined"
          sx={{ 
            mb: 2.5, 
            px: 1.5, 
            py: 2, 
            borderRadius: 10, 
            borderColor: '#e0f2fe', 
            bgcolor: '#f0f9ff', 
            color: '#0284c7', 
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />

        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', letterSpacing: '-1px', mb: 1 }}>
          Create your Account
        </Typography>
        
        <Typography variant="body2" align="center" sx={{ color: '#64748b', mb: 3 }}>
          Join StockFlow to manage your trades
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: '12px' }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <TextField
            required
            fullWidth
            id="username"
            placeholder="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#fafafa',
                '& fieldset': { borderColor: '#f1f5f9' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main', strokeWidth: 1 }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            required
            fullWidth
            id="email"
            placeholder="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#fafafa',
                '& fieldset': { borderColor: '#f1f5f9' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main', strokeWidth: 1 }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlinedIcon sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            required
            fullWidth
            name="password"
            placeholder="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#fafafa',
                '& fieldset': { borderColor: '#f1f5f9' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main', strokeWidth: 1 }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: '1.25rem' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ 
              mb: 2.5, 
              py: 1.5, 
              fontSize: '1rem',
              fontWeight: 'bold', 
              borderRadius: 8, 
              textTransform: 'none', 
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                boxShadow: '0 6px 20px 0 rgba(0,118,255,0.45)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                sx={{ 
                  color: 'primary.main', 
                  textDecoration: 'none', 
                  fontWeight: '700',
                  '&:hover': { textDecoration: 'underline' } 
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}