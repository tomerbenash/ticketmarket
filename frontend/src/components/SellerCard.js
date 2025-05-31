"use client"

import { Box, Typography, Paper, Button, Rating } from "@mui/material"
import { useNavigate } from "react-router-dom"

const SellerCard = ({ seller, averageRating, reviewCount }) => {
  const navigate = useNavigate()

  const handleViewProfile = () => {
    navigate(`/sellers/${seller.user_id}/reviews`)
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">{seller.username}</Typography>

      <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
        <Rating value={averageRating || 0} precision={0.1} readOnly size="small" />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {averageRating ? `${averageRating.toFixed(1)} (${reviewCount} reviews)` : "No reviews yet"}
        </Typography>
      </Box>

      <Button variant="outlined" size="small" onClick={handleViewProfile} sx={{ mt: 1 }}>
        View Profile & Reviews
      </Button>
    </Paper>
  )
}

export default SellerCard

