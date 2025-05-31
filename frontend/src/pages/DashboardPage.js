"use client"

import { useState, useEffect } from "react"
import { Container, Typography, Box, Grid, Paper, Tabs, Tab, Chip } from "@mui/material"
import { useAuth } from "../context/AuthContext"
import { getSellListings, getBuyRequests, getUserTickets, getTickets } from "../services/api"

const DashboardPage = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [sellListings, setSellListings] = useState([])
  const [buyRequests, setBuyRequests] = useState([])
  const [tickets, setTickets] = useState([])
  const [allTickets, setAllTickets] = useState([]) // All tickets for availability calculation
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh
  const [fulfilledRequests, setFulfilledRequests] = useState([]) // IDs of fulfilled requests

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all tickets to calculate availability
      const allTicketsResponse = await getTickets()
      setAllTickets(allTicketsResponse.data)

      // Fetch data based on user role
      if (user.role === "Seller" || user.role === "Both") {
        const sellResponse = await getSellListings()
        setSellListings(sellResponse.data.filter((listing) => listing.seller_id === user.user_id))
      }

      if (user.role === "Buyer" || user.role === "Both") {
        const buyResponse = await getBuyRequests()
        setBuyRequests(buyResponse.data.filter((request) => request.buyer_id === user.user_id))

        // Use the dedicated endpoint to get user's tickets
        try {
          console.log("Fetching tickets for user ID:", user.user_id)
          const userTicketsResponse = await getUserTickets(user.user_id)
          console.log("User tickets from API:", userTicketsResponse.data)
          setTickets(userTicketsResponse.data)
        } catch (ticketError) {
          console.error("Error fetching user tickets:", ticketError)
          setError("Failed to load purchased tickets. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, refreshKey])

  // Listen for ticket purchase events
  useEffect(() => {
    const handleTicketPurchase = (event) => {
      // If the event includes a matched request ID, add it to fulfilled requests
      if (event.detail && event.detail.matchedRequestId) {
        setFulfilledRequests((prev) => [...prev, event.detail.matchedRequestId])
      }

      // Refresh the data when a ticket is purchased
      setRefreshKey((prevKey) => prevKey + 1)
    }

    // Add event listener
    window.addEventListener("ticketPurchased", handleTicketPurchase)

    // Clean up
    return () => {
      window.removeEventListener("ticketPurchased", handleTicketPurchase)
    }
  }, [])

  // Load fulfilled requests from localStorage on component mount
  useEffect(() => {
    // Get the buy request matches from localStorage
    const buyRequestMatches = JSON.parse(localStorage.getItem("buyRequestMatches") || "[]")

    // Check if any of the user's tickets match the criteria for a buy request
    const newFulfilledRequests = []

    buyRequestMatches.forEach((matchInfo) => {
      // Only consider requests created by the current user
      const matchingRequest = buyRequests.find((req) => req.request_id === matchInfo.requestId)
      if (!matchingRequest) return

      // Check if the user has purchased any of the matching tickets
      const hasMatchingPurchase = tickets.some((ticket) =>
        matchInfo.matches.some(
          (match) =>
            ticket.event_name === match.eventName &&
            new Date(ticket.event_date).toISOString().split("T")[0] ===
              new Date(match.eventDate).toISOString().split("T")[0] &&
            Math.abs(ticket.price - match.price) < 0.01 &&
            ticket.is_sold &&
            ticket.buyer_id === user.user_id,
        ),
      )

      if (hasMatchingPurchase) {
        newFulfilledRequests.push(matchInfo.requestId)
      }
    })

    if (newFulfilledRequests.length > 0) {
      setFulfilledRequests((prev) => [...prev, ...newFulfilledRequests])
    }
  }, [buyRequests, tickets, user])

  // Calculate remaining quantity for each listing
  const getAvailableQuantity = (listing) => {
    // Find all tickets that match this listing
    const matchingTickets = allTickets.filter(
      (ticket) =>
        ticket.event_name === listing.event_name &&
        ticket.seller_id === listing.seller_id &&
        new Date(ticket.event_date).toISOString().split("T")[0] ===
          new Date(listing.event_date).toISOString().split("T")[0] &&
        Math.abs(ticket.price - listing.price) < 0.01, // Compare prices with a small tolerance
    )

    // Count unsold tickets
    const availableTickets = matchingTickets.filter((ticket) => !ticket.is_sold).length

    // Return the available count
    return availableTickets
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
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

  // Determine which tabs to show based on user role
  const showListingsTab = user && (user.role === "Seller" || user.role === "Both")
  const showRequestsTab = user && (user.role === "Buyer" || user.role === "Both")
  const showTicketsTab = user && (user.role === "Buyer" || user.role === "Both")

  // Calculate the correct tab index for each content type
  let listingsTabIndex = -1
  let requestsTabIndex = -1
  let ticketsTabIndex = -1

  let tabIndex = 0
  if (showListingsTab) {
    listingsTabIndex = tabIndex++
  }
  if (showRequestsTab) {
    requestsTabIndex = tabIndex++
  }
  if (showTicketsTab) {
    ticketsTabIndex = tabIndex++
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          איזור אישי
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          ברוך שובך, {user.username}!
        </Typography>

        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "error.light" }}>
            <Typography color="error.dark">{error}</Typography>
          </Paper>
        )}

        <Paper sx={{ mt: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            {showListingsTab && <Tab label="הפרסומים שלי" />}
            {showRequestsTab && <Tab label="הבקשות שלי" />}
            {showTicketsTab && <Tab label="הכרטיסים שלי" />}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* My Listings Tab */}
            {tabValue === listingsTabIndex && showListingsTab && (
              <Grid container spacing={2}>
                {sellListings.length > 0 ? (
                  sellListings.map((listing) => {
                    const availableQuantity = getAvailableQuantity(listing)
                    const isSoldOut = availableQuantity === 0

                    return (
                      <Grid item xs={12} md={6} key={listing.sell_id}>
                        <Paper
                          sx={{
                            p: 2,
                            position: "relative",
                            opacity: isSoldOut ? 0.8 : 1,
                          }}
                        >
                          {isSoldOut && (
                            <Chip
                              label="שלח כרטיסים למוכר"
                              color="error"
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                fontWeight: "bold",
                                transform: "rotate(5deg)",
                              }}
                            />
                          )}
                          <Typography variant="h6">{listing.event_name}</Typography>
                          <Typography variant="body2">קטגוריה: {listing.category}</Typography>
                          <Typography variant="body2">
                            תאריך: {new Date(listing.event_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">מחיר: ${listing.price}</Typography>
                          <Typography variant="body2">
                            כרטיסים זמינים: {availableQuantity} מתוך {listing.quantity}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            פורסם ב: {new Date(listing.created_date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })
                ) : (
                  <Typography>אין לך פרסומים פעילים.</Typography>
                )}
              </Grid>
            )}

            {/* My Requests Tab */}
            {tabValue === requestsTabIndex && showRequestsTab && (
              <Grid container spacing={2}>
                {buyRequests.length > 0 ? (
                  buyRequests.map((request) => {
                    const isFulfilled = fulfilledRequests.includes(request.request_id)

                    return (
                      <Grid item xs={12} md={6} key={request.request_id}>
                        <Paper
                          sx={{
                            p: 2,
                            position: "relative",
                            opacity: isFulfilled ? 0.8 : 1,
                          }}
                        >
                          {isFulfilled && (
                            <Chip
                              label="מומש"
                              color="primary"
                              sx={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                fontWeight: "bold",
                                transform: "rotate(5deg)",
                              }}
                            />
                          )}
                          <Typography variant="h6">{request.event_name}</Typography>
                          <Typography variant="body2">קטגוריה: {request.category}</Typography>
                          <Typography variant="body2">
                            תאריך: {new Date(request.event_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">מחיר מקסימלי: ₪{request.max_price}</Typography>
                          <Typography variant="body2">כמות: {request.quantity}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                            בוקש ב: {new Date(request.created_date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })
                ) : (
                  <Typography>אין לך בקשות קניה פעילות.</Typography>
                )}
              </Grid>
            )}

            {/* My Tickets Tab */}
            {tabValue === ticketsTabIndex && showTicketsTab && (
              <Grid container spacing={2}>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <Grid item xs={12} md={6} key={ticket.ticket_id}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">{ticket.event_name}</Typography>
                        <Typography variant="body2">קטגוריה: {ticket.category}</Typography>
                        <Typography variant="body2">
                          תאריך: {new Date(ticket.event_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">מחיר: ₪{ticket.price}</Typography>
                        <Typography variant="body2">Tמזהה כרטיס: {ticket.ticket_id}</Typography>
                        <Typography variant="body2" color="success.main">
                          סטטוס: נקנה
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                          נרכש ב: {new Date(ticket.purchase_date || ticket.created_date).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>טרם רכשת כרטיסים.</Typography>
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
