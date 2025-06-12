"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Typography, Box, Paper, Rating, TextField, Button, Grid, Divider, Alert } from "@mui/material"
import {getReviews} from '../services/api'


import { useAuth } from "../context/AuthContext";
import { createReview } from "../services/api";




const ReviewsPage = () => {  
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })



  const { user, token } = useAuth();

  const [newReview, setNewReview] = useState({
    seller_id: "",
    rating: 0,
    review_text: "",
  });





  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await getReviews()
        setReviews(response.data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        setMessage({ type: "error", text: "Failed to load reviews. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

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
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" gutterBottom>
          ביקורות
        </Typography>


        {reviews.length > 0 ? (
          <Grid container spacing={2}>
            {reviews.map((review) => (
              
              <Grid item xs={12} key={review.review_id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(review.review_date).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {review.review_text && <Typography variant="body1">{review.review_text}</Typography>}
                  {review.buyer_id && <Typography variant="body1">{review.buyer_id} :מזהה קונה</Typography>}
                  {review.seller_id && <Typography variant="body1">{review.seller_id} :מזהה מוכר</Typography>}

                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography>No reviews yet.</Typography>
        )}
      </Box>
    </Container>
  )
}

export default ReviewsPage

