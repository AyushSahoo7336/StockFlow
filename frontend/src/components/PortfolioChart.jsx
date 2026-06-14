import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const shortenCompanyName = (name) => {
  if (!name) return '';

  const replacements = {
    'RELIANCE INDUSTRIES LTD': 'RELIANCE',
    'TATA CONSULTANCY SERV LT': 'TCS',
    'INFOSYS LIMITED': 'INFOSYS',
    'APPLE INC.': 'APPLE'
  };
  if (replacements[name.toUpperCase()]) return replacements[name.toUpperCase()];
  const firstWord = name.split(' ')[0];
  return firstWord.length <= 15 ? firstWord : firstWord.slice(0, 12) + '…';
};

export default function PortfolioChart({ holdings }) {
  if (!holdings || holdings.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" fontWeight="500">No data to chart</Typography>
      </Box>
    );
  }
  const backgroundColors = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1',
    '#06b6d4', '#22c55e', '#a855f7', '#0ea5e9', '#2563eb',
    '#15803d', '#b91c1c', '#ea580c'
  ];

  const totalValue = holdings.reduce((sum, stock) => sum + (stock.qty * (stock.price || stock.current || 0)), 0);

  const processedData = holdings.map((stock, index) => {
    const stockValue = stock.qty * (stock.price || stock.current || 0);
    const percentage = totalValue > 0 ? ((stockValue / totalValue) * 100).toFixed(1) : '0.0';

    const shortName = shortenCompanyName(stock.name);
    return {
      originalName: stock.name,
      name: shortName,
      value: stockValue,
      percentage: `${percentage}%`,
      color: backgroundColors[index % backgroundColors.length]
    };
  });

  const data = {
    labels: processedData.map(item => item.name),
    datasets: [{
      data: processedData.map(item => item.value),
      backgroundColor: processedData.map(item => item.color),
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
    cutout: '75%'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
      
      <Box sx={{ width: 220, height: 220, flexShrink: 0, position: 'relative' }}>
        <Doughnut data={data} options={options} />
      </Box>
      
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            columnGap: 2.5,
            rowGap: 1.5 
          }}
        >
          {processedData.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                <Typography 
                  variant="caption" 
                  fontWeight="600" 
                  sx={{ 
                    color: '#475569',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {item.name}
                </Typography>
              </Box>
              <Typography variant="caption" fontWeight="800" sx={{ color: '#0f172a', flexShrink: 0 }}>
                {item.percentage}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}