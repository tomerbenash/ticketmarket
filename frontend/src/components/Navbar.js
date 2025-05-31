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
          טיקטמרקט
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/marketplace">
            מרקטפלייס
          </Button>
                        {/* Add this button after the Marketplace button */}
<Button color="inherit" component={Link} to="/review/">
  ביקורות
</Button>

          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                פרופיל אישי
              </Button>
              {(user.role === "Seller" || user.role === "Both") && (
                <Button color="inherit" component={Link} to="/sell">
                  מכירת כרטיסים
                </Button>
              )}
              {(user.role === "Buyer" || user.role === "Both") && (
                <Button color="inherit" component={Link} to="/buy">
                  קניית כרטיסים
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                התנתקות
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                התחברות
              </Button>
              <Button color="inherit" component={Link} to="/register">
                הרשמה
              </Button>

              
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

