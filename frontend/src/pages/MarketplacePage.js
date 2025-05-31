"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  Button,
} from "@mui/material"
import { Search as SearchIcon, Refresh as RefreshIcon } from "@mui/icons-material"
import { getSellListings, getBuyRequests, getTickets } from "../services/api"
import { useAuth } from "../context/AuthContext"

const MarketplacePage = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [sellListings, setSellListings] = useState([])
  const [buyRequests, setBuyRequests] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [refreshKey, setRefreshKey] = useState(0) // Used to force refresh
  const [fulfilledRequests, setFulfilledRequests] = useState([]) // IDs of fulfilled requests

  console.log(fulfilledRequests)

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all sell listings
      const sellResponse = await getSellListings()
      setSellListings(sellResponse.data)

      // Fetch all buy requests
      const buyResponse = await getBuyRequests()
      setBuyRequests(buyResponse.data)

      // Fetch all tickets to calculate availability
      const ticketsResponse = await getTickets()
      setTickets(ticketsResponse.data)

      // Check for fulfilled requests after fetching all data
      checkFulfilledRequests(buyResponse.data, ticketsResponse.data)
    } catch (error) {
      console.error("Error fetching marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to check which requests are fulfilled
  const checkFulfilledRequests = (requests, allTickets) => {
    try {
      // Get the buy request matches from localStorage
      const buyRequestMatchesStr = localStorage.getItem("buyRequestMatches")
      if (!buyRequestMatchesStr) return

      const buyRequestMatches = JSON.parse(buyRequestMatchesStr)
      if (!Array.isArray(buyRequestMatches) || buyRequestMatches.length === 0) return

      // Check for fulfilled requests
      const newFulfilledRequests = []

      buyRequestMatches.forEach((matchInfo) => {
        // Find the corresponding request
        const matchingRequest = requests.find((req) => req.request_id === matchInfo.requestId)
        if (!matchingRequest) return

        // Check if the buyer has purchased any matching tickets
        const hasMatchingPurchase = allTickets.some((ticket) =>
          matchInfo.matches.some(
            (match) =>
              ticket.event_name === match.eventName &&
              new Date(ticket.event_date).toISOString().split("T")[0] ===
                new Date(match.eventDate).toISOString().split("T")[0] &&
                ticket.price <= match.price &&
              ticket.is_sold &&
              ticket.buyer_id === matchingRequest.buyer_id,
          ),
        )

        console.log("Checking match for request:", matchingRequest)

const matchedTickets = allTickets.filter((ticket) =>
  matchInfo.matches.some(
    (match) =>
      ticket.event_name === match.eventName &&
      new Date(ticket.event_date).toISOString().split("T")[0] ===
        new Date(match.eventDate).toISOString().split("T")[0] &&
      ticket.price <= match.price &&
      ticket.is_sold &&
      ticket.buyer_id === matchingRequest.buyer_id
  )
)

console.log("Matched Tickets:", matchedTickets)



        if (hasMatchingPurchase) {
          newFulfilledRequests.push(matchInfo.requestId)
        }
      })

      if (newFulfilledRequests.length > 0) {
        setFulfilledRequests((prev) => {
          // Combine and remove duplicates
          const combined = [...prev, ...newFulfilledRequests]
          return [...new Set(combined)]
        })
      }
    } catch (error) {
      console.error("Error checking fulfilled requests:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshKey]) // Refetch when refreshKey changes

  // Listen for ticket purchase events
  useEffect(() => {
    const handleTicketPurchase = (event) => {
      console.log("🎟️ Ticket purchase event received in MarketplacePage:", event.detail)
    
      const matchedRequestId = event.detail?.matchedRequestId
      if (matchedRequestId) {
        setFulfilledRequests((prev) => [...new Set([...prev, matchedRequestId])])
    
        // Optional: update localStorage for future reference
        const storedMatches = JSON.parse(localStorage.getItem("buyRequestMatches") || "[]")
        const updatedMatches = storedMatches.map((match) =>
          match.requestId === matchedRequestId ? { ...match, fulfilled: true } : match
        )
        localStorage.setItem("buyRequestMatches", JSON.stringify(updatedMatches))
      }
    
      // ✅ Add delay to allow backend to commit changes
      setTimeout(() => {
        setRefreshKey((prev) => prev + 1)
      }, 300)  // Delay fetch by 300ms to ensure ticket is marked as sold in DB
    }
    // Add event listener
    window.addEventListener("ticketPurchased", handleTicketPurchase)

    // Clean up
    return () => {
      window.removeEventListener("ticketPurchased", handleTicketPurchase)
    }
  }, [])

  const handleRefresh = () => {
    setRefreshKey((oldKey) => oldKey + 1) // Increment to trigger useEffect
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value)
  }

  // Calculate remaining quantity for each listing
  const getAvailableQuantity = (listing) => {
    // Find all tickets that match this listing
    const matchingTickets = tickets.filter(
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

  // Filter listings based on search term and category
  const filteredSellListings = sellListings.filter((listing) => {
    const matchesSearch = listing.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || listing.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredBuyRequests = buyRequests.filter((request) => {
    const matchesSearch = request.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || request.category === categoryFilter
    return matchesSearch && matchesCategory
  })

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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={handleRefresh}>
            רענן
          </Button>
          <Typography variant="h4" component="h1">
            טיקטמרקט מרקטפלייס
          </Typography>
          
        </Box>

        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="חפש אירועים"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="קטגוריה" value={categoryFilter} onChange={handleCategoryChange}>
                <MenuItem value="All">כל הקטגוריות</MenuItem>
                <MenuItem value="Concert">הופעות</MenuItem>
                <MenuItem value="Sports">ספורט</MenuItem>
                <MenuItem value="Theater">הצגות</MenuItem>
                <MenuItem value="Other">אחר</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        <Paper sx={{ mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            <Tab label="כרטיסים למכירה" />
            <Tab label="בקשות לאירועים" />
            <Tab label="אירועים קרובים (שבועיים קרובים)" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {filteredSellListings.length > 0 ? (
                  filteredSellListings.map((listing) => {
                    const availableQuantity = getAvailableQuantity(listing)
                    const isSoldOut = availableQuantity === 0

                    return (
                      <Grid item xs={12} md={6} lg={4} key={listing.sell_id}>
                        <Paper
                          sx={{
                            p: 2,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            opacity: isSoldOut ? 0.8 : 1,
                          }}
                        >
                          {isSoldOut && (
                            <Chip
                              label="נמכר "
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
                          <Typography variant="h6" gutterBottom>
                            {listing.event_name}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              קטגוריה: {listing.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              תאריך: {new Date(listing.event_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              מחיר: ₪{listing.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              כרטיסים זמינים: {availableQuantity} מתוך {listing.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                            פורסם ב: {new Date(listing.created_date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })
                ) : (
                  <Typography>טרם פורסמו כרטיסים למכירה</Typography>
                )}
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                {filteredBuyRequests.length > 0 ? (
                  filteredBuyRequests.map((request) => {
                    const isFulfilled = request.fulfilled

                    return (
                      <Grid item xs={12} md={6} lg={4} key={request.request_id}>
                        <Paper
                          sx={{
                            p: 2,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
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
                          <Typography variant="h6" gutterBottom>
                            {request.event_name}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              קטגוריה: {request.category}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              תאריך: {new Date(request.event_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              מחיר מקסימלי: ₪{request.max_price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              כמות: {request.quantity}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                            בוקש ב: {new Date(request.created_date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    )
                  })
                ) : (
                  <Typography>טרם פורסמו בקשות קניה</Typography>
                )}
              </Grid>
            )}
            {tabValue === 2 && (
  <Grid container spacing={2}>
    {filteredSellListings.length > 0 ? (
      filteredSellListings
        .filter((listing) => {
          const today = new Date()
          const eventDate = new Date(listing.event_date)
          const daysDiff = (eventDate - today) / (1000 * 60 * 60 * 24)
          return daysDiff >= 0 && daysDiff <= 14
        })
        .map((listing) => {
          const availableQuantity = getAvailableQuantity(listing)
          const isSoldOut = availableQuantity === 0

          return (
            <Grid item xs={12} md={6} lg={4} key={listing.sell_id}>
              <Paper
                sx={{
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  opacity: isSoldOut ? 0.8 : 1,
                }}
              >
                {isSoldOut && (
                  <Chip
                    label="SOLD OUT"
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
                <Typography variant="h6" gutterBottom>
                  {listing.event_name}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Category: {listing.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(listing.event_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${listing.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available: {availableQuantity} of {listing.quantity}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                  Listed on: {new Date(listing.created_date).toLocaleDateString()}
                </Typography>
              </Paper>
            </Grid>
          )
        })
    ) : (
      <Typography>לא נמאו כרטיסים זמינים לקטגוריה.</Typography>
    )}
  </Grid>
)}
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}


export default MarketplacePage
