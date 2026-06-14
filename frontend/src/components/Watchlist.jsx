import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Divider, 
  Button,
  Paper
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TradeModal from './TradeModal';

const watchlistData = [
  { name: 'RELIANCE', price: 2112.40, change: 1.44, isUp: true },
  { name: 'TCS', price: 3194.80, change: -0.25, isUp: false },
  { name: 'INFY', price: 1555.45, change: -1.60, isUp: false },
  { name: 'HDFCBANK', price: 1522.35, change: 0.11, isUp: true },
  { name: 'ITC', price: 207.90, change: 0.80, isUp: true },
  { name: 'SBIN', price: 430.20, change: -0.34, isUp: false },
];

export default function Watchlist() {
  const [hoveredStock, setHoveredStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const openTradeModal = (stock) => {
    setSelectedStock(stock);
    setTradeModalOpen(true);
  };

  return (
    <Paper elevation={0} sx={{ height: '100%', borderRight: '1px solid #e0e0e0', borderRadius: 0 }}>
      
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Market Watchlist
        </Typography>
      </Box>

      <List disablePadding>
        {watchlistData.map((stock, index) => (
          <React.Fragment key={stock.name}>
            <ListItem 
              onMouseEnter={() => setHoveredStock(stock.name)}
              onMouseLeave={() => setHoveredStock(null)}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                py: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <Typography fontWeight="medium">{stock.name}</Typography>
              
              {hoveredStock === stock.name ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    sx={{ minWidth: 30, px: 1, py: 0.5 }}
                    onClick={() => openTradeModal(stock)}
                  >
                    B
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="error"
                    sx={{ minWidth: 30, px: 1, py: 0.5 }}
                    onClick={() => openTradeModal(stock)}
                  >
                    S
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    color={stock.isUp ? 'success.main' : 'error.main'}
                  >
                    {stock.change > 0 ? '+' : ''}{stock.change}%
                  </Typography>
                  <Typography fontWeight="medium">
                    {stock.price.toFixed(2)}
                  </Typography>
                  {stock.isUp ? 
                    <KeyboardArrowUpIcon color="success" fontSize="small" /> : 
                    <KeyboardArrowDownIcon color="error" fontSize="small" />
                  }
                </Box>
              )}
            </ListItem>
            {index < watchlistData.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <TradeModal 
        open={tradeModalOpen} 
        onClose={() => setTradeModalOpen(false)} 
        stock={selectedStock} 
      />
    </Paper>
  );
}