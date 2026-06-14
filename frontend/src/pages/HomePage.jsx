import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import SecurityIcon from "@mui/icons-material/Security";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SpeedIcon from "@mui/icons-material/Speed";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DevicesIcon from "@mui/icons-material/Devices";

const BLUE = "#1565C0";
const BLUE_LIGHT = "#1976D2";
const BLUE_PALE = "#E3F0FF";
const WHITE = "#FFFFFF";
const DARK = "#0A1929";
const GRAY = "#64748B";
const GRAY_LIGHT = "#F0F4FA";

const features = [
  {
    icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
    title: "Real-Time Data",
    desc: "Live price feeds with sub-second latency across global exchanges and asset classes.",
    color: "#1976D2",
  },
  {
    icon: <PieChartIcon sx={{ fontSize: 32 }} />,
    title: "Portfolio Tracking",
    desc: "Monitor all your holdings in one unified dashboard with P&L breakdown and allocation.",
    color: "#0288D1",
  },
  {
    icon: <ShowChartIcon sx={{ fontSize: 32 }} />,
    title: "Advanced Analytics",
    desc: "Professional-grade technical indicators, screeners, and backtesting tools.",
    color: "#0097A7",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
    title: "Secure Trading",
    desc: "Encrypted JWT-based authorization to keep your trading account safe.",
    color: "#1565C0",
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 32 }} />,
    title: "Market Insights",
    desc: "Smart AI analysis and detailed stock performance tracking",
    color: "#0277BD",
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 32 }} />,
    title: "Fast Execution",
    desc: "Orders executed in under 10ms with guaranteed best-price routing.",
    color: "#01579B",
  },
];

function MiniChart({ color = "#1976D2", up = true }) {
  const points = up
    ? "10,60 30,50 50,55 70,35 90,40 110,25 130,30 150,15 170,20 190,8"
    : "10,15 30,25 50,18 70,35 90,28 110,45 130,38 150,52 170,48 190,60";
  return (
    <svg width="100%" height="70" viewBox="0 0 200 70" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${up}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`10,70 ${points.replace(/(\d+),\d+/g, (_, x) => `${x},70`).split(" ").join(" ")} 190,70`}
        fill={`url(#grad-${up})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIllustration() {
  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: 520, mx: "auto" }}>
      <Paper
        elevation={24}
        sx={{
          borderRadius: 4,
          p: 3,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(25,118,210,0.12)",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="caption" sx={{ color: GRAY, letterSpacing: 1, fontWeight: 600 }}>
              PORTFOLIO VALUE
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: DARK, lineHeight: 1 }}>
              ₹12,84,320
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
              <TrendingUpIcon sx={{ color: "#16A34A", fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 700 }}>
                +₹1,24,210 (10.7%) today
              </Typography>
            </Stack>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1976D2, #0097A7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUpIcon sx={{ color: WHITE, fontSize: 22 }} />
          </Box>
        </Stack>

        <Box sx={{ mx: -3, mb: 2 }}>
          <MiniChart color="#1976D2" up={true} />
        </Box>

        <Typography variant="caption" sx={{ color: GRAY, fontWeight: 700, letterSpacing: 1 }}>
          TOP HOLDINGS
        </Typography>
        {[
          { name: "RELIANCE", qty: "50 shares", val: "₹1,42,500", chg: "+1.8%", up: true },
          { name: "INFY", qty: "120 shares", val: "₹2,04,000", chg: "+2.4%", up: true },
          { name: "HDFC BANK", qty: "80 shares", val: "₹1,28,000", chg: "-0.6%", up: false },
        ].map((s) => (
          <Stack
            key={s.name}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 1, borderBottom: "1px solid #F0F4FA" }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  background: BLUE_PALE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShowChartIcon sx={{ color: BLUE_LIGHT, fontSize: 16 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: DARK }}>
                  {s.name}
                </Typography>
                <Typography variant="caption" sx={{ color: GRAY }}>
                  {s.qty}
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: DARK }}>
                {s.val}
              </Typography>
              <Typography variant="caption" sx={{ color: s.up ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                {s.chg}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Paper>

      <Paper
        elevation={8}
        sx={{
          position: "absolute",
          bottom: -24,
          left: -24,
          borderRadius: 3,
          p: 1.5,
          background: WHITE,
          minWidth: 180,
          border: "1px solid rgba(25,118,210,0.10)",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #16A34A20, #16A34A10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NotificationsActiveIcon sx={{ color: "#16A34A", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: DARK, display: "block" }}>
              Daily Milestone
            </Typography>
            <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 600 }}>
              Portfolio hit new high ↑
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={8}
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          borderRadius: 3,
          px: 1.5,
          py: 1,
          background: "linear-gradient(135deg, #1976D2, #0288D1)",
          minWidth: 130,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <DevicesIcon sx={{ color: WHITE, fontSize: 18 }} />
          <Typography variant="caption" sx={{ color: WHITE, fontWeight: 700 }}>
            Trade anywhere
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function Home() {
  return (
    <Box sx={{ fontFamily: "'Inter', 'Roboto', sans-serif", bgcolor: WHITE }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(160deg, #EBF4FF 0%, #F8FBFF 50%, #FFFFFF 100%)",
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 6, md: 4 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: 99,
                  bgcolor: BLUE_PALE,
                  border: "1px solid rgba(25,118,210,0.2)",
                  mb: 3,
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#16A34A" }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: BLUE_LIGHT, letterSpacing: 0.5 }}>
                  Markets are live
                </Typography>
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", sm: "3.2rem", md: "3.8rem" },
                  lineHeight: 1.05,
                  color: DARK,
                  letterSpacing: -1.5,
                  mb: 2.5,
                }}
              >
                Invest Smarter.{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(90deg, #1976D2, #0097A7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Grow Faster.
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: GRAY,
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  lineHeight: 1.75,
                  maxWidth: 480,
                  mb: 4,
                }}
              >
                StockFlow gives you professional-grade tools, real-time data, and zero-commission trading — everything you need to
                build lasting wealth, from your very first rupee.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #1976D2, #0288D1)",
                    fontWeight: 700,
                    borderRadius: 3,
                    px: 4,
                    py: 1.75,
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(25,118,210,0.35)",
                    "&:hover": { transform: "translateY(-2px)" },
                    transition: "all 0.25s",
                  }}
                >
                  Get Started — Free
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <DashboardIllustration />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: GRAY_LIGHT, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 7 }}>
            <Typography
              variant="overline"
              sx={{ color: BLUE_LIGHT, fontWeight: 700, letterSpacing: 2, fontSize: "0.75rem" }}
            >
              PLATFORM FEATURES
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: DARK,
                mt: 1,
                fontSize: { xs: "1.9rem", md: "2.5rem" },
                letterSpacing: -0.5,
              }}
            >
              Everything you need to trade confidently
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: GRAY, mt: 2, maxWidth: 520, mx: "auto", lineHeight: 1.75 }}
            >
              From your first stock trade to comprehensive portfolio management — one platform, built for every stage of your investing journey.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: "1.5px solid #EAF0FA",
                    height: "100%",
                    bgcolor: WHITE,
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 48px rgba(25,118,210,0.10)",
                      "& .feature-icon-box": {
                        background: `linear-gradient(135deg, ${f.color}, ${f.color}CC)`,
                        "& svg": { color: WHITE },
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      className="feature-icon-box"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${f.color}18, ${f.color}10)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2.5,
                        color: f.color,
                        transition: "all 0.3s",
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: DARK, mb: 1 }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: GRAY, lineHeight: 1.7 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}