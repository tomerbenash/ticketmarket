"use client"
import { Link, useNavigate } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: "none", color: "white" }}>
          TicketMarket
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>

              <Button color="inherit" component={Link} to="/marketplace">
  Marketplace
</Button>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              {(user.role === "Seller" || user.role === "Both") && (
                <Button color="inherit" component={Link} to="/sell">
                  Sell Tickets
                </Button>
              )}
              {(user.role === "Buyer" || user.role === "Both") && (
                <Button color="inherit" component={Link} to="/buy">
                  Buy Tickets
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

