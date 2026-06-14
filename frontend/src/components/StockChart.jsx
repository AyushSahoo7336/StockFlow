import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

export default function StockChart({ data }) {
  if (!data || data.length === 0) {
    return <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No chart data available.</Typography>
            </Box>;
  }

  const startPrice = data[0].price;
  const endPrice = data[data.length - 1].price;
  const isPositive = endPrice >= startPrice;
  
  const strokeColor = isPositive ? '#10b981' : '#ef4444'; 

  return (
    <Box sx={{ width: '100%', height: 250, mt: 3, mb: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis domain={['dataMin', 'auto']} hide />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            itemStyle={{ fontWeight: '900', color: '#0f172a', fontSize: '1.1rem' }}
            formatter={(value) => [`₹${value.toFixed(2)}`, 'Closing Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor} 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}