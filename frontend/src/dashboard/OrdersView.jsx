import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { api } from '../config/api';
import PendingOrders from '../components/PendingOrders';

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/portfolio/orders');
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to load trade history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 2 }}>
      <Box sx={{ mb: 6 }}>
        <PendingOrders />
      </Box>

      <Box sx={{ mb: 3 }}>
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
            Trade History
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>
            A complete ledger of your executed orders.
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Asset</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Action</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>Quantity</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>Execution Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>Total Value</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                  No trade history found. Go to the Market to place your first order!
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  
                  <TableCell sx={{ color: '#0f172a' }}>
                    {formatDate(order.createdAt)}
                  </TableCell>
                  
                  <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {order.name}
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={order.mode} 
                      size="small"
                      sx={{ 
                        fontWeight: 'bold', borderRadius: '6px',
                        bgcolor: order.mode === 'BUY' ? '#dcfce7' : '#fee2e2',
                        color: order.mode === 'BUY' ? '#16a34a' : '#dc2626'
                      }} 
                    />
                  </TableCell>
                  
                  <TableCell align="right" sx={{ color: '#0f172a' }}>
                    {order.qty}
                  </TableCell>
                  
                  <TableCell align="right" sx={{ color: '#0f172a' }}>
                    ₹{order.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    ₹{(order.price * order.qty).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
    </Box>
  );
}