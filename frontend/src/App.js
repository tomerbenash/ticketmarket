import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material"
import { AuthProvider } from "./context/AuthContext"

// Components
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardPage from "./pages/DashboardPage"
import SellTicketsPage from "./pages/SellTicketsPage"
import BuyTicketsPage from "./pages/BuyTicketsPage"
import ReviewsPage from "./pages/ReviewsPage"
import MarketplacePage from "./pages/MarketplacePage"
import TransactionsPage from './pages/TransactionsPage';


// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
})

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/review" element={<ReviewsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />


            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sell"
              element={
                <ProtectedRoute roles={["Seller", "Both"]}>
                  <SellTicketsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/buy"
              element={
                <ProtectedRoute roles={["Buyer", "Both"]}>
                  <BuyTicketsPage />
                </ProtectedRoute>
              }
       //     />
        //      <Route
         //     path="/review/"
          //    element={
          //      <ProtectedRoute roles={["Buyer", "Both"]}>
           //       <ReviewSellerPage />
         //       </ProtectedRoute>
           //   }
            />
          

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

