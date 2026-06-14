import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';

export default function Navbar() {
  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid #f1f5f9',
        bgcolor: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(12px)',
        top: 0,
        zIndex: 1000
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 3, md: 6 } }}>
        <Toolbar disableGutters sx={{ minHeight: 76, justifyContent: 'space-between' }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: '800', 
                color: '#0f172a',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                fontSize: '1.35rem'
              }}
            >
              StockFlow
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
            <Button 
              component={RouterLink} 
              to="/login" 
              sx={{ 
                textTransform: 'none', 
                fontWeight: '700', 
                color: '#0f172a', 
                fontSize: '0.95rem',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' }
              }}
            >
              Login
            </Button>
            <Button 
              component={RouterLink} 
              to="/signup" 
              variant="contained" 
              color="primary" 
              disableElevation 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'bold', 
                borderRadius: 8, 
                px: 3.5,
                py: 1,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: '0 6px 20px 0 rgba(0,118,255,0.39)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
          
        </Toolbar>
      </Container>
    </AppBar>
  );
}