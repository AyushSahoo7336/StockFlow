import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { api } from '../config/api';

import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, 
  ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Button, Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

const drawerWidth = 260;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/user/profile');
        if (res.data.success) {
          setUserData(res.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    fetchProfile();
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Portfolio', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
    { text: 'Market', icon: <ShowChartOutlinedIcon />, path: '/dashboard/market' },
    { text: 'History', icon: <ReceiptLongOutlinedIcon />, path: '/dashboard/orders' },
    { text: 'Profile', icon: <PersonOutlinedIcon />, path: '/dashboard/profile' }
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      <Toolbar sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color: '#2563EB', display: 'flex' }}>
            <ShowChartIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.5px',
              fontSize: '1.35rem'
            }}
          >
            StockFlow
          </Typography>
        </Box>
      </Toolbar>

      <List sx={{ px: 2, mt: 1, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1.25,
                  px: 2,
                  bgcolor: isActive ? '#EFF6FF' : 'transparent',
                  color: isActive ? '#2563EB' : '#4B5563',
                  '&:hover': { bgcolor: isActive ? '#EFF6FF' : '#F3F4F6' },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#2563EB' : '#6B7280' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  disableTypography
                  primary={
                    <Typography sx={{ fontWeight: isActive ? 600 : 500, fontSize: '0.95rem' }}>
                      {item.text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const displayName = userData?.name ? userData.name.split(' ')[0] : 'Trader';
  const displayAvatar = userData?.name ? userData.name.charAt(0).toUpperCase() : 'T';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#F9FAFB',
          color: '#111827',
          pt: 2
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h4" sx={{ 
                        fontWeight: 600,
                        fontFamily: "'Poppins', 'Inter', sans-serif'",
                        background: 'linear-gradient(45deg, #0f172a 30%, #3b82f6 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                        mb: 0.5
                      }}>
                        Welcome back, {displayName}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Here's an overview of your virtual portfolio
                      </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              bgcolor: '#ffffff', 
              px: 2.5, 
              py: 1, 
              borderRadius: '8px', 
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              <Box sx={{ color: '#4B5563', display: 'flex' }}>
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, lineHeight: 1 }}>
                  Virtual Funds:
                </Typography>
                <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#2563EB', lineHeight: 1.2, mt: 0.5 }}>
                  ₹{userData?.virtualFunds ? userData.virtualFunds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '...'}
                </Typography>
              </Box>
            </Box>
            
            <Box 
              onClick={() => navigate('/dashboard/profile')} 
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              <Avatar sx={{ 
                width: 44, 
                height: 44, 
                bgcolor: '#2563EB', 
                fontSize: '1.25rem', 
                fontWeight: '700' 
              }}>
                {displayAvatar}
              </Avatar>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #E5E7EB' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: 10 }}>
        <Outlet />
      </Box>
    </Box>
  );
}