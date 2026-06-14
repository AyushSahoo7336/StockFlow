import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Autocomplete, 
  ToggleButton, ToggleButtonGroup, Divider, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function TradeModal({ open, onClose, onSubmit, availableStocks = [], initialStock }) {
  const [tradeType, setTradeType] = useState('BUY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  const [orderType, setOrderType] = useState('MARKET'); 
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (open) {
      setTradeType('BUY');
      setOrderType('MARKET'); 
      setQuantity('');
      setManualPrice('');
      setTargetPrice(''); 
      setIsProcessing(false); 
    }
  }, [open]);

  const livePrice = selectedStock?.price || 0;
  const activePrice = livePrice > 0 ? livePrice : (Number(manualPrice) || 0);

  useEffect(() => {
    if (orderType === 'LIMIT' && !targetPrice && activePrice > 0) {
      setTargetPrice(activePrice.toFixed(2));
    }
  }, [orderType, activePrice, targetPrice]);

  const handleTypeChange = (event, newType) => {
    if (newType !== null) setTradeType(newType);
  };

  const handleOrderTypeChange = (event, newType) => {
    if (newType !== null) setOrderType(newType);
  };

  const handleSubmit = async () => {
    if (!selectedStock || !quantity || quantity <= 0 || activePrice <= 0) return;
    if (orderType === 'LIMIT' && (!targetPrice || targetPrice <= 0)) return;
    
    setIsProcessing(true); 
    
    const tradeTicket = {
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      qty: Number(quantity),
      action: tradeType,
      price: activePrice,
      orderType: orderType,
      targetPrice: orderType === 'LIMIT' ? Number(targetPrice) : null 
    };
    
    try {
      await onSubmit(tradeTicket); 
    } finally {
      setIsProcessing(false); 
    }
  };

  const executionPrice = orderType === 'MARKET' ? activePrice : (Number(targetPrice) || 0);
  const totalValue = executionPrice * (Number(quantity) || 0);
  
  const isBuy = tradeType === 'BUY';
  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
      
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box component="span" sx={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
          Execute Trade
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '16px !important' }}>
        
        <ToggleButtonGroup
          value={tradeType}
          exclusive
          onChange={handleTypeChange}
          fullWidth
          sx={{ 
            '& .MuiToggleButton-root': { fontWeight: 'bold', py: 1.5, border: '1px solid #e2e8f0' },
            '& .Mui-selected': { bgcolor: isBuy ? '#10b981 !important' : '#ef4444 !important', color: '#ffffff !important' }
          }}
        >
          <ToggleButton value="BUY">BUY</ToggleButton>
          <ToggleButton value="SELL">SELL</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            size="small"
            value={orderType}
            exclusive
            onChange={handleOrderTypeChange}
            sx={{ bgcolor: '#f8fafc' }}
          >
            <ToggleButton value="MARKET" sx={{ px: 4, fontWeight: 'bold' }}>Market Order</ToggleButton>
            <ToggleButton value="LIMIT" sx={{ px: 4, fontWeight: 'bold' }}>Limit Order</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Autocomplete
          options={availableStocks}
          getOptionLabel={(option) => {
            if (!option) return '';
            return option.name ? `${option.name} - ${option.symbol}` : (option.symbol || '');
          }}
          value={selectedStock}
          onChange={(e, newValue) => setSelectedStock(newValue)}
          renderInput={(params) => <TextField {...params} label="Select Asset" />}
          isOptionEqualToValue={(option, value) => option?.symbol === value?.symbol}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            InputProps={{ inputProps: { min: 1 } }}
          />

          <TextField
            label={livePrice > 0 ? "Live Market Price" : "Manual Price (API Offline)"}
            type="number"
            value={livePrice > 0 ? livePrice : manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
            fullWidth
            disabled={livePrice > 0} 
            sx={{ '& .Mui-disabled': { WebkitTextFillColor: '#0f172a', fontWeight: 'bold', bgcolor: '#f8fafc' } }}
          />
        </Box>

        {orderType === 'LIMIT' && (
          <TextField
            label={`Target Execution Price (₹)`}
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            fullWidth
            InputProps={{ inputProps: { min: 0 } }}
            helperText={isBuy 
              ? "Order will automatically execute when the live price drops to this amount." 
              : "Order will automatically execute when the live price rises to this amount."
            }
            sx={{ 
              '& .MuiInputBase-root': { fontWeight: 'bold', color: '#8b5cf6' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#8b5cf6' }
            }}
          />
        )}

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', bgcolor: '#f8fafc', p: 2, borderRadius: '12px' }}>
          <Typography variant="body2" fontWeight="600" sx={{ color: '#64748b' }}>
            {orderType === 'LIMIT' ? 'Target Order Value' : 'Estimated Order Value'}
          </Typography>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            {formatCurrency(totalValue)}
          </Typography>
        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          size="large" 
          onClick={handleSubmit}
          disabled={!selectedStock || quantity <= 0 || activePrice <= 0 || isProcessing || (orderType === 'LIMIT' && (!targetPrice || targetPrice <= 0))}
          sx={{ 
            bgcolor: isBuy ? '#10b981' : '#ef4444', 
            '&:hover': { bgcolor: isBuy ? '#059669' : '#dc2626' },
            py: 1.5, fontWeight: '800', fontSize: '1.1rem', borderRadius: '12px', textTransform: 'none'
          }}
        >
          {isProcessing ? 'Processing...' : (orderType === 'LIMIT' ? `Queue Limit ${tradeType}` : `Execute Market ${tradeType}`)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}