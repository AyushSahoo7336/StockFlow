import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Button, Autocomplete, TextField, IconButton, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Stack,
  Snackbar, Alert 
} from '@mui/material';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import PortfolioChart from '../components/PortfolioChart';
import TradeModal from '../components/TradeModal';

export default function PortfolioView() {

  const [holdings, setHoldings] = useState([]);
  const [marketStocks, setMarketStocks] = useState([]); 
  const [watchlist, setWatchlist] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [preSelectedStock, setPreSelectedStock] = useState(null); 
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const holdingsRes = await api.get('/api/portfolio/my-holdings').catch(() => ({ data: [] }));
        const stocksRes = await api.get('/api/market/all-stocks').catch(() => ({ data: [] }));
        const watchlistRes = await api.get('/api/watchlist').catch(() => ({ data: [] }));
        
        setHoldings(holdingsRes.data);
        setMarketStocks(stocksRes.data);
        setWatchlist(watchlistRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/market/search/${searchQuery}`);
        if (res.data.success) {
          setSearchOptions(res.data.data);
        }
      } catch (err) {
        console.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLiveHoldings = async () => {
      try {
        const res = await api.get('/api/portfolio/my-holdings');
        setHoldings(res.data);
      } catch (err) {
        console.log("Live update failed");
      }
    };
    const intervalId = setInterval(fetchLiveHoldings, 60000); 
    return () => clearInterval(intervalId);
  }, []);

  const handleAddToWatchlist = async (stock) => {
    if (!stock) return;
    try {
      const res = await api.post('/api/watchlist', { symbol: stock.symbol, name: stock.name });
      if (res.data.success) {
        setWatchlist([...watchlist, res.data.item]);
        setToast({ open: true, message: "Added to watchlist!", severity: 'success' });
        setSearchQuery(''); 
      }
    } catch (err) {
      setToast({ open: true, message: "Already in watchlist", severity: 'warning' });
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await api.delete(`/api/watchlist/${symbol}`);
      setWatchlist(watchlist.filter(item => item.symbol !== symbol));
      setToast({ open: true, message: "Removed from watchlist", severity: 'info' });
    } catch (err) {
      setToast({ open: true, message: "Failed to remove", severity: 'error' });
    }
  };

  const handleExecuteTrade = async (trade) => {
    try {
      const response = await api.post('/api/portfolio/trade', trade);
      if (response.data.success) {
        const updatedHoldings = await api.get('/api/portfolio/my-holdings');
        setHoldings(updatedHoldings.data);
        setIsTradeModalOpen(false);
        setPreSelectedStock(null);
        
        setToast({ open: true, message: response.data.message || "Trade executed successfully!", severity: 'success' });
      }
    } catch (error) {
      setToast({ open: true, message: error.response?.data?.message || "Trade failed", severity: 'error' });
    }
  };

  const openTradeModalForStock = (symbol, name, price) => {
    setPreSelectedStock({ 
      symbol: symbol, 
      name: name || symbol, 
      price: price 
    });
    setIsTradeModalOpen(true);
  };

  const calculateTotals = () => {
    let totalInvested = 0; let currentValue = 0;
    holdings.forEach((stock) => {
      totalInvested += stock.qty * stock.avg;
      currentValue += stock.qty * stock.price;
    });
    const totalPnL = currentValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    return { totalInvested, currentValue, totalPnL, pnlPercentage };
  };
  
  const { totalInvested, currentValue, totalPnL, pnlPercentage } = calculateTotals();
  const isProfit = totalPnL >= 0;
  
  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

  const cardStyle = {
    p: 3, 
    borderRadius: '16px', 
    bgcolor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.02)',
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden'       
  };

  const stylishHeading = {
    fontWeight: 900,
    fontFamily: "'Poppins', 'Inter', sans-serif",
    background: 'linear-gradient(45deg, #0f172a 30%, #3b82f6 90%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    mb: 3
  };

  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) hash = string.charCodeAt(i) + ((hash << 5) - hash);
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, bgcolor: '#f8fafc', p: { xs: 2, md: 3 }, borderRadius: '24px' }}>
      
      <TradeModal 
        open={isTradeModalOpen} 
        onClose={() => { setIsTradeModalOpen(false); setPreSelectedStock(null); }} 
        onSubmit={handleExecuteTrade}
        availableStocks={preSelectedStock ? [preSelectedStock, ...marketStocks] : marketStocks} 
        initialStock={preSelectedStock} 
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#eff6ff', display: 'flex' }}>
                <AccountBalanceWalletIcon fontSize="small" sx={{ color: '#3b82f6' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Total Investment
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-1px' }}>
              {formatCurrency(totalInvested)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#eff6ff', display: 'flex' }}>
                <ShowChartIcon fontSize="small" sx={{ color: '#3b82f6' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Current Value
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-1px' }}>
              {formatCurrency(currentValue)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={cardStyle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: '8px', bgcolor: '#eff6ff', display: 'flex' }}>
                <TrendingUpIcon fontSize="small" sx={{ color: '#3b82f6' }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3b82f6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Overall P&L
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" fontWeight="900" sx={{ color: '#0f172a', letterSpacing: '-1px' }}>
                {isProfit ? '+' : ''}{formatCurrency(totalPnL)}
              </Typography>
              <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', bgcolor: isProfit ? '#dcfce7' : '#fee2e2', color: isProfit ? '#16a34a' : '#dc2626' }}>
                <Typography variant="caption" fontWeight="900">
                  {isProfit ? '+' : ''}{pnlPercentage.toFixed(2)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, alignItems: 'stretch' }}>
        
        <Paper elevation={0} sx={{ ...cardStyle, minHeight: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={stylishHeading}>Market Watchlist</Typography>
          </Box>
          
          <Autocomplete
            options={searchOptions}
            getOptionLabel={(option) => `${option.symbol} - ${option.name} (${option.exchange || 'Global'})`}
            filterOptions={(x) => x} 
            loading={isSearching}
            onInputChange={(e, newInputValue) => setSearchQuery(newInputValue)}
            onChange={(e, newValue) => {
              if (newValue) {
                handleAddToWatchlist(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Search global markets..." 
                size="small" 
                sx={{ bgcolor: '#f8fafc', borderRadius: 1 }} 
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps?.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
            sx={{ mb: 2 }}
          />
          
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, overflowY: 'auto', flexGrow: 1, maxHeight: '350px', pr: 1 }}>
            {watchlist.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>Your watchlist is empty.</Typography>
            ) : (
              watchlist.map((ticker, i) => {
                const liveData = marketStocks.find(s => s.symbol === ticker.symbol) || ticker;
                const currentPrice = liveData.price || 0;
                const priceChange = liveData.change || 0;
                const changePercent = liveData.changePercent || 0;
                const isPositive = priceChange >= 0;

                return (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    p: 1.25, 
                    borderRadius: '12px', 
                    border: '1px solid #f1f5f9', 
                    bgcolor: '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' } 
                  }}>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, mr: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700" noWrap sx={{ color: '#1e293b', lineHeight: 1.2 }}>
                        {ticker.symbol}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        {ticker.exchange || 'NSE'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 2, minWidth: 'max-content' }}>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a', lineHeight: 1.2 }}>
                        ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap', color: isPositive ? '#10b981' : '#ef4444' }}>
                        {isPositive ? '▴' : '▾'} {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Button 
                        size="small" 
                        variant="contained" 
                        disableElevation 
                        onClick={() => openTradeModalForStock(ticker.symbol, ticker.name, currentPrice)} 
                        sx={{ 
                          borderRadius: '8px', 
                          py: 0.5, 
                          px: 1.5,
                          bgcolor: '#eff6ff', 
                          color: '#2563eb', 
                          fontWeight: '700', 
                          textTransform: 'none', 
                          '&:hover': { bgcolor: '#dbeafe' } 
                        }}
                      >
                        Trade
                      </Button>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveFromWatchlist(ticker.symbol)} 
                        sx={{ 
                          color: '#cbd5e1', 
                          '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } 
                        }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>

        <Paper elevation={0} sx={cardStyle}>
          <Typography variant="h6" sx={stylishHeading}>Asset Allocation</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px', width: '100%' }}>
            {holdings.length > 0 ? (
              <PortfolioChart holdings={holdings} />
            ) : (
              <Typography variant="body1" sx={{ color: '#94a3b8' }}>No data to chart. Buy some stocks!</Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Paper elevation={0} sx={cardStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={stylishHeading}>
            Holdings ({holdings.length})
          </Typography>
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '800', fontSize: '0.875rem' } }}>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Avg. Price</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Current Value</TableCell>
                <TableCell align="right">P&L</TableCell>
                <TableCell align="right">P&L%</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holdings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#94a3b8', borderBottom: 'none' }}>
                    No stocks in your portfolio yet.
                  </TableCell>
                </TableRow>
              ) : (
                holdings.map((row, index) => {
                  const invested = row.qty * row.avg;
                  const current = row.qty * row.price;
                  const rowPnL = current - invested;
                  const rowPnLPercent = invested > 0 ? (rowPnL / invested) * 100 : 0;
                  const rowIsProfit = rowPnL >= 0;

                  return (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '& td': { borderBottom: '1px solid #f1f5f9', py: 2 } }}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: stringToColor(row.symbol || row.name || "A"), fontSize: '0.875rem', fontWeight: 'bold' }}>
                            {(row.symbol || row.name || "A").charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight="800" sx={{ color: '#0f172a' }}>
                            {row.symbol || row.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: '700', color: '#334155' }}>{row.qty}</TableCell>
                      <TableCell align="right" sx={{ color: '#64748b', fontWeight: '600' }}>{formatCurrency(row.avg)}</TableCell>
                      <TableCell align="right" sx={{ color: '#64748b', fontWeight: '600' }}>{formatCurrency(row.price)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '700', color: '#334155' }}>{formatCurrency(current)}</TableCell>
                      
                      <TableCell align="right" sx={{ fontWeight: '800', color: rowIsProfit ? '#16a34a' : '#dc2626' }}>
                        {rowIsProfit ? '+' : ''}{formatCurrency(rowPnL)}
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-block', px: 1, py: 0.5, borderRadius: '6px', bgcolor: rowIsProfit ? '#dcfce7' : '#fee2e2', color: rowIsProfit ? '#16a34a' : '#dc2626' }}>
                          <Typography variant="caption" fontWeight="800">
                            {rowIsProfit ? '+' : ''}{rowPnLPercent.toFixed(2)}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button 
                            variant="contained" 
                            size="small" 
                            disableElevation
                            onClick={() => openTradeModalForStock(row.symbol, row.name, row.price)}
                            sx={{ 
                              bgcolor: '#10b981', 
                              color: '#ffffff', 
                              fontWeight: '800', 
                              fontSize: '0.75rem', 
                              textTransform: 'none', 
                              borderRadius: '6px',
                              px: 1.5,
                              '&:hover': { bgcolor: '#059669' } 
                            }}
                          >
                            Buy
                          </Button>
                          <Button 
                            variant="contained" 
                            size="small" 
                            disableElevation
                            onClick={() => openTradeModalForStock(row.symbol, row.name, row.price)}
                            sx={{ 
                              bgcolor: '#ef4444', 
                              color: '#ffffff', 
                              fontWeight: '800', 
                              fontSize: '0.75rem', 
                              textTransform: 'none', 
                              borderRadius: '6px',
                              px: 1.5,
                              '&:hover': { bgcolor: '#dc2626' } 
                            }}
                          >
                            Sell
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: '8px', fontWeight: 'bold' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}