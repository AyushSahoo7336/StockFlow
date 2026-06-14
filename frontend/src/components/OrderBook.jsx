import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

const OrderBook = ({ orderBook, currentPrice }) => {
  if (!orderBook || (!orderBook.bids.length && !orderBook.asks.length)) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle2" color="text.secondary">Order Book is currently empty.</Typography>
      </Paper>
    );
  }

  const displayAsks = [...(orderBook.asks || [])].reverse();
  const displayBids = orderBook.bids || [];

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #1e293b', borderRadius: '12px', bgcolor: '#0f172a', color: 'white' }}>
      <Typography variant="subtitle2" sx={{ mb: 2, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
        Live Order Book
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={1} px={1}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>Qty</Typography>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold' }}>Price (₹)</Typography>
      </Box>

      <Box mb={1} px={1}>
        {displayAsks.map((ask, idx) => (
          <Box key={`ask-${idx}`} display="flex" justifyContent="space-between" py={0.5}>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>{ask.qty}</Typography>
            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>{ask.price.toFixed(2)}</Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ borderColor: '#334155', my: 1 }} />
      <Box display="flex" justifyContent="center" py={1.5}>
         <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: '900' }}>
           ₹{currentPrice?.toFixed(2) || '0.00'}
         </Typography>
      </Box>
      <Divider sx={{ borderColor: '#334155', my: 1 }} />

      <Box mt={1} px={1}>
        {displayBids.map((bid, idx) => (
          <Box key={`bid-${idx}`} display="flex" justifyContent="space-between" py={0.5}>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>{bid.qty}</Typography>
            <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 'bold' }}>{bid.price.toFixed(2)}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default OrderBook;