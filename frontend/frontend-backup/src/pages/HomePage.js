import { Container, Typography, Box, Button, Grid, Paper } from "@mui/material"
import { Link } from "react-router-dom"

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to TicketMarket
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Buy and sell concert tickets with ease
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button component={Link} to="/register" variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
            Get Started
          </Button>
          <Button component={Link} to="/login" variant="outlined" color="primary" size="large">
            Sign In
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5" gutterBottom>
              Buy Tickets
            </Typography>
            <Typography variant="body1">
              Find tickets for your favorite concerts, sports events, and theater shows.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5" gutterBottom>
              Sell Tickets
            </Typography>
            <Typography variant="body1">
              Easily list your tickets for sale and reach thousands of potential buyers.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5" gutterBottom>
              Request Tickets
            </Typography>
            <Typography variant="body1">
              Can't find what you're looking for? Create a buy request and get notified when matching tickets are
              available.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default HomePage

