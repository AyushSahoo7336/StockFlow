import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress 
} from '@mui/material';
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { api } from '../config/api';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const res = await api.get('/api/portfolio/pending');
      if (res.data.success) {
        setOrders(res.data.pendingOrders);
      }
    } catch (error) {
      console.error("Failed to fetch pending orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      const res = await api.delete(`/api/portfolio/pending/${orderId}`);
      
      if (res.data.success) {
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      }
    } catch (error) {
      alert("Failed to cancel the order. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', bgcolor: '#f8fafc' }}>
        <Typography variant="h6" color="text.secondary" fontWeight="bold">No Pending Orders</Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          You do not have any active limit orders in the queue.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 900,
            fontFamily: "'Poppins', 'Inter', sans-serif'",
            background: 'linear-gradient(45deg, #0f172a 30%, #3b82f6 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            mb: 0.5
          }}>
            Active Limit Orders
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>
            These orders are currently waiting in the execution queue.
          </Typography>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Asset</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Current Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>Target Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#64748b', textAlign: 'right' }}>Manage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} hover>
                <TableCell>
                  <Typography fontWeight="bold" color="#0f172a">{order.symbol}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.action} 
                    size="small" 
                    sx={{ 
                      fontWeight: 'bold', 
                      bgcolor: order.action === 'BUY' ? '#dcfce7' : '#fee2e2',
                      color: order.action === 'BUY' ? '#16a34a' : '#dc2626'
                    }} 
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">{order.qty}</Typography>
                </TableCell>

                <TableCell>
                  {order.currentPrice ? (
                    <Typography variant="body2" fontWeight="bold" color="#64748b">
                      ₹{order.currentPrice.toFixed(2)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Loading...</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="#1976d2">
                    ₹{order.targetPrice.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={cancellingId === order._id ? <CircularProgress size={14} color="inherit" /> : <DeleteOutlinedIcon />}
                    onClick={() => handleCancelOrder(order._id)}
                    disabled={cancellingId === order._id}
                    sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}
                  >
                    {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PendingOrders;