"use client"

import { useState, useEffect } from "react"
import { Container, Typography, Box, Grid, Paper, Tabs, Tab, Button } from "@mui/material"
import { useAuth } from "../context/AuthContext"
import { getSellListings, getBuyRequests, getTickets } from "../services/api"

const DashboardPage = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [sellListings, setSellListings] = useState([])
  const [buyRequests, setBuyRequests] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  // Function to fetch data - moved outside useEffect for reusability
  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch data based on user role
      if (user.role === "Seller" || user.role === "Both") {
        const sellResponse = await getSellListings()
        setSellListings(sellResponse.data.filter((listing) => listing.seller_id === user.user_id))
      }

      if (user.role === "Buyer" || user.role === "Both") {
        const buyResponse = await getBuyRequests()
        setBuyRequests(buyResponse.data.filter((request) => request.buyer_id === user.user_id))

        const ticketsResponse = await getTickets()
        console.log("All tickets:", ticketsResponse.data);
        console.log("User ID:", user.user_id);
        
        // Log each ticket to see its properties
        ticketsResponse.data.forEach(ticket => {
          console.log(`Ticket ${ticket.ticket_id}:`, {
            buyer_id: ticket.buyer_id,
            is_sold: ticket.is_sold,
            event_name: ticket.event_name,
            matches_user: ticket.buyer_id === user.user_id,
            is_sold_type: typeof ticket.is_sold
          });
        });
        
        // Filter tickets where the buyer_id matches the current user's ID
        // Note: We're not checking is_sold here to see if that's the issue
        const userTickets = ticketsResponse.data.filter((ticket) => 
          ticket.buyer_id === user.user_id
        );
        console.log("User tickets (only checking buyer_id):", userTickets);
        
        setTickets(userTickets)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Function to refresh data
  const handleRefresh = () => {
    fetchData()
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Welcome back, {user.username}!
            </Typography>
          </div>
          <Button variant="outlined" onClick={handleRefresh}>
            Refresh Data
          </Button>
        </Box>

        <Paper sx={{ mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            {(user.role === "Seller" || user.role === "Both") && <Tab label="My Listings" />}
            {(user.role === "Buyer" || user.role === "Both") && <Tab label="My Requests" />}
            {(user.role === "Buyer" || user.role === "Both") && <Tab label="My Tickets" />}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (user.role === "Seller" || user.role === "Both") && (
              <Grid container spacing={2}>
                {sellListings.length > 0 ? (
                  sellListings.map((listing) => (
                    <Grid item xs={12} md={6} key={listing.sell_id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">{listing.event_name}</Typography>
                        <Typography variant="body2">Category: {listing.category}</Typography>
                        <Typography variant="body2">
                          Date: {new Date(listing.event_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">Price: ${listing.price}</Typography>
                        <Typography variant="body2">Quantity: {listing.quantity}</Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>You don't have any active listings.</Typography>
                )}
              </Grid>
            )}

            {tabValue === (user.role === "Buyer" ? 0 : 1) && (user.role === "Buyer" || user.role === "Both") && (
              <Grid container spacing={2}>
                {buyRequests.length > 0 ? (
                  buyRequests.map((request) => (
                    <Grid item xs={12} md={6} key={request.request_id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">{request.event_name}</Typography>
                        <Typography variant="body2">Category: {request.category}</Typography>
                        <Typography variant="body2">
                          Date: {new Date(request.event_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">Max Price: ${request.max_price}</Typography>
                        <Typography variant="body2">Quantity: {request.quantity}</Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>You don't have any active buy requests.</Typography>
                )}
              </Grid>
            )}

            {tabValue === (user.role === "Buyer" ? 1 : 2) && (user.role === "Buyer" || user.role === "Both") && (
              <Grid container spacing={2}>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <Grid item xs={12} md={6} key={ticket.ticket_id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">{ticket.event_name}</Typography>
                        <Typography variant="body2">Category: {ticket.category}</Typography>
                        <Typography variant="body2">
                          Date: {new Date(ticket.event_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">Price: ${ticket.price}</Typography>
                        <Typography variant="body2">Seller ID: {ticket.seller_id}</Typography>
                        <Typography variant="body2" color="success.main">Status: {ticket.is_sold ? "Purchased" : "Available"}</Typography>
                        <Typography variant="body2">Ticket ID: {ticket.ticket_id}</Typography>
                        <Typography variant="body2">Buyer ID: {ticket.buyer_id}</Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>You haven't purchased any tickets yet.</Typography>
                )}
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default DashboardPage