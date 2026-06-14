import React, { useState, useEffect, useRef } from 'react'; 
import io from 'socket.io-client';
import { api, apiUrl } from '../config/api';
import TradeModal from '../components/TradeModal';
import StockChart from '../components/StockChart';

import { 
  Box, Paper, Typography, TextField, Button, CircularProgress, Grid, Divider, Autocomplete,
  Snackbar, Alert 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';


export default function MarketView() {
  const [searchQuery, setSearchQuery] = useState(null);
  const [inputValue, setInputValue] = useState('');     
  const [options, setOptions] = useState([]);           
  const [fetchingOptions, setFetchingOptions] = useState(false);
  
  const [stockData, setStockData] = useState(null);
  const [stockHistory, setStockHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const socketRef = useRef(null);
  const currentSymbolRef = useRef(null);

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    socketRef.current = io(apiUrl(""), { withCredentials: true });
    socketRef.current.on('connect', () => {
      console.log('WebSocket Connection Established');
    });

    socketRef.current.on('marketTick', (tick) => {
      const incomingSymbol = tick.symbol?.toUpperCase().trim();
      const activeSymbol = currentSymbolRef.current?.toUpperCase().trim();

      if (activeSymbol && incomingSymbol === activeSymbol) {
        setStockData((prevData) => {
          if (!prevData) return null;

          const freshPrice = tick.price || tick.regularMarketPrice || prevData.price;
          const freshChange = tick.change || tick.regularMarketChange || prevData.change;
          
          const delta = freshPrice - freshChange;
          const freshPercent = delta !== 0 ? (freshChange / delta) * 100 : prevData.changePercent;

          return {
            ...prevData,
            price: freshPrice,
            change: freshChange,
            changePercent: isNaN(freshPercent) ? prevData.changePercent : freshPercent
          };
        });
      }
    });

    return () => {
      if (socketRef.current) {
        if (currentSymbolRef.current) {
          socketRef.current.emit('unsubscribeFromStock', currentSymbolRef.current.toUpperCase().trim());
        }
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  const handleInputChange = async (event, newInputValue) => {
    setInputValue(newInputValue);
    if (!newInputValue || newInputValue.length < 2) {
      setOptions([]);
      return;
    }
    setFetchingOptions(true);
    try {
      const res = await api.get(`/api/market/search/${newInputValue}`);
      if (res.data.success) setOptions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch search options");
    } finally {
      setFetchingOptions(false);
    }
  };

  const handleSearchExecute = async (e) => {
    e.preventDefault();
    const symbolToFetch = searchQuery?.symbol || inputValue; 
    if (!symbolToFetch.trim()) return;

    setLoading(true);
    setError('');
    
    if (socketRef.current && currentSymbolRef.current) {
      socketRef.current.emit('unsubscribeFromStock', currentSymbolRef.current);
    }

    setStockData(null);
    setStockHistory(null);
    setAiAnalysis('');

    try {
      const symbol = symbolToFetch.toUpperCase().trim();
      
      const [quoteResponse, historyResponse] = await Promise.all([
        api.get(`/api/market/quote/${symbol}`),
        api.get(`/api/market/history/${symbol}`).catch(() => ({ data: { success: false, data: [] } }))
      ]);

      if (quoteResponse.data.success) {
        const fetchedStock = quoteResponse.data.data;
        setStockData(fetchedStock);
        
        const cleanSymbol = fetchedStock.symbol.toUpperCase().trim();
        currentSymbolRef.current = cleanSymbol;
        
        if (socketRef.current) {
          socketRef.current.emit('subscribeToStock', cleanSymbol);
        }
      }
      
      if (historyResponse.data && historyResponse.data.success) {
        setStockHistory(historyResponse.data.data);
      } else {
        setStockHistory([]);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch stock data.');
      currentSymbolRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStock = async () => {
    if (!stockData?.symbol) return;
    
    setIsAiLoading(true);
    try {
      const res = await api.get(`/api/market/analyze/${stockData.symbol}`);
      if (res.data.success) {
        setAiAnalysis(res.data.analysis);
      }
    } catch (err) {
      setToast({ open: true, message: "AI Assistant failed to load.", severity: 'error' });
    } finally {
      setIsAiLoading(false);
    }
  };
  const executeTradeFromModal = async (tradeTicket) => {
    try {
      const response = await api.post("/api/portfolio/trade", tradeTicket);
      if (response.data.success) {
        setIsTradeModalOpen(false);
        setToast({ open: true, message: response.data.message || "Trade executed successfully!", severity: 'success' });
      }
    } catch (error) {
      setToast({ open: true, message: error.response?.data?.message || "Trade execution failed.", severity: 'error' });
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', mt: 2 }}>
      
      <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid #e2e8f0', borderRadius: '12px' }}>
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
            Market Search
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>
            Search for a company name or ticker symbol.
          </Typography>
        </Box>

        <form onSubmit={handleSearchExecute} style={{ display: 'flex', gap: '12px' }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={options}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.symbol}
            filterOptions={(x) => x} 
            value={searchQuery}
            onChange={(event, newValue) => setSearchQuery(newValue)}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            
            renderOption={(props, option) => (
              <li {...props} key={option.symbol} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <Box py={0.5}>
                  <Typography variant="body1" fontWeight="bold" color="#0f172a">
                    {option.symbol}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    {option.name} • <span style={{ color: '#1976d2', fontWeight: '500' }}>{option.exchange}</span>
                  </Typography>
                </Box>
              </li>
            )}

            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search companies or symbols..." 
                variant="outlined"
                disabled={loading}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {fetchingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps?.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          <Button 
            type="submit" variant="contained" disableElevation disabled={loading}
            sx={{ bgcolor: '#1976d2', fontWeight: 'bold', minWidth: '120px' }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'Fetching' : 'Search'}
          </Button>
        </form>

        {error && <Typography color="error" variant="body2" sx={{ mt: 2, fontWeight: 'medium' }}>{error}</Typography>}
      </Paper>

      {stockData && (
        <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="#0f172a">{stockData.symbol}</Typography>
              <Typography variant="body1" color="#64748b" sx={{ mt: 0.5 }}>{stockData.name}</Typography>
              
              <Typography variant="caption" sx={{ display: 'inline-block', mt: 1, px: 1.5, py: 0.5, bgcolor: '#f1f5f9', color: '#475569', borderRadius: '4px', fontWeight: 'bold' }}>
                {stockData.exchange}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight="bold" color="#0f172a">
                ₹{stockData.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5, color: stockData.change >= 0 ? '#16a34a' : '#dc2626' }}>
                {stockData.change >= 0 ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }}/> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }}/>}
                <Typography variant="body1" fontWeight="bold">
                  {stockData.change > 0 ? '+' : ''}{stockData.change?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({stockData.changePercent?.toFixed(2)}%)
                </Typography>
              </Box>

              {stockData.wasConverted && (
                 <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                   Converted to INR
                 </Typography>
              )}
            </Box>
          </Box>

          {stockHistory && (
            <Box sx={{ mt: 2 }}>
              <StockChart data={stockHistory} />
            </Box>
          )}

          <Box sx={{ mt: 4, mb: 2 }}>
            {!aiAnalysis && !isAiLoading ? (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAnalyzeStock}
                sx={{ 
                  color: '#8b5cf6', borderColor: '#8b5cf6', fontWeight: 'bold', py: 1.5,
                  '&:hover': { bgcolor: '#f3e8ff', borderColor: '#7c3aed' } 
                }}
              >
                ✨ Analyze this stock with Gemini AI
              </Button>
            ) : (
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ color: '#8b5cf6', fontWeight: 'bold', display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  ✨ Gemini Market Intelligence
                </Typography>
                
                {isAiLoading ? (
                  <Box display="flex" alignItems="center" gap={2}>
                    <CircularProgress size={20} sx={{ color: '#8b5cf6' }} />
                    <Typography variant="body2" color="text.secondary">Synthesizing live market data...</Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.6 }}>
                    {aiAnalysis}
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 2 }}>
            <Button 
              fullWidth variant="contained" 
              sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' }, fontWeight: 'bold', py: 1.5 }}
              onClick={() => setIsTradeModalOpen(true)}
            >
              TRADE {stockData.symbol}
            </Button>
          </Box>
        </Paper>
      )}

      {stockData && (
        <TradeModal 
          open={isTradeModalOpen} 
          onClose={() => setIsTradeModalOpen(false)} 
          onSubmit={executeTradeFromModal}
          availableStocks={[stockData]} 
          initialStock={stockData} 
        />
      )}

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