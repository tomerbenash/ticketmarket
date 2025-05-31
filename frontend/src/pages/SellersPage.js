"use client"

import { useState, useEffect } from "react"
import { Container, Typography, Box, Grid, Paper, TextField, InputAdornment, CircularProgress } from "@mui/material"
import { Search as SearchIcon } from "@mui/icons-material"
import { getSellerReviews } from "../services/api"
import SellerCard from "../components/SellerCard"

const SellersPage = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sellerRatings, setSellerRatings] = useState({})

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true)
        setError(null)

        // In a real app, you would fetch the sellers from the API
        // For now, we'll just use placeholder data
        const mockSellers = [
          { user_id: 1, username: "TicketMaster", role: "Seller" },
          { user_id: 2, username: "EventPro", role: "Seller" },
          { user_id: 3, username: "SportsTix", role: "Seller" },
          { user_id: 4, username: "ConcertDeals", role: "Seller" },
          { user_id: 5, username: "TheaterFan", role: "Seller" },
        ]

        setSellers(mockSellers)

        // Fetch ratings for each seller
        const ratingsPromises = mockSellers.map(async (seller) => {
          try {
            const response = await getSellerReviews(seller.user_id)
            const reviews = response.data

            if (reviews.length > 0) {
              const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              return {
                sellerId: seller.user_id,
                averageRating: avgRating,
                reviewCount: reviews.length,
              }
            }

            return { sellerId: seller.user_id, averageRating: 0, reviewCount: 0 }
          } catch (error) {
            console.error(`Error fetching reviews for seller ${seller.user_id}:`, error)
            return { sellerId: seller.user_id, averageRating: 0, reviewCount: 0 }
          }
        })

        const ratingsResults = await Promise.all(ratingsPromises)

        // Convert array of results to an object keyed by seller ID
        const ratingsObj = ratingsResults.reduce((acc, curr) => {
          acc[curr.sellerId] = {
            averageRating: curr.averageRating,
            reviewCount: curr.reviewCount,
          }
          return acc
        }, {})

        setSellerRatings(ratingsObj)
      } catch (error) {
        console.error("Error fetching sellers:", error)
        setError("Failed to load sellers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchSellers()
  }, [])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  // Filter sellers based on search term
  const filteredSellers = sellers.filter((seller) => seller.username.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3, bgcolor: "error.light" }}>
            <Typography color="error.dark">{error}</Typography>
          </Paper>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ticket Sellers
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search sellers..."
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
        </Box>

        <Grid container spacing={2}>
          {filteredSellers.length > 0 ? (
            filteredSellers.map((seller) => (
              <Grid item xs={12} md={6} lg={4} key={seller.user_id}>
                <SellerCard
                  seller={seller}
                  averageRating={sellerRatings[seller.user_id]?.averageRating || 0}
                  reviewCount={sellerRatings[seller.user_id]?.reviewCount || 0}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography>No sellers match your search criteria.</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  )
}

export default SellersPage

