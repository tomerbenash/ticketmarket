"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Typography, Box, Paper, Rating, TextField, Button, Grid, Divider, Alert } from "@mui/material"
import { useFormik } from "formik"
import * as Yup from "yup"
import { createReview, getSellerReviews } from "../services/api"
import { useAuth } from "../context/AuthContext"

const ReviewSellerPage = () => {
  const { sellerId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await getSellerReviews(sellerId)
        setReviews(response.data)
      } catch (error) {
        console.error("Error fetching reviews:", error)
        setMessage({ type: "error", text: "Failed to load reviews. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [sellerId])

  const validationSchema = Yup.object({
    rating: Yup.number()
      .min(1, "Rating is required")
      .max(5, "Rating must be between 1 and 5")
      .required("Rating is required"),
    review_text: Yup.string(),
  })

  const formik = useFormik({
    initialValues: {
      rating: 0,
      review_text: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const reviewData = {
          seller_id: Number(sellerId),
          rating: values.rating,
          review_text: values.review_text,
        }

        await createReview(reviewData)
        setMessage({ type: "success", text: "Review submitted successfully!" })

        // Refresh reviews
        const response = await getSellerReviews(sellerId)
        setReviews(response.data)

        resetForm()

        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" })
        }, 5000)
      } catch (error) {
        console.error("Error submitting review:", error)
        setMessage({ type: "error", text: "Failed to submit review. Please try again." })
      }
    },
  })

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

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
        <Typography variant="h4" component="h1" gutterBottom>
          Review Seller
        </Typography>

        {message.text && (
          <Alert severity={message.type === "success" ? "success" : "error"} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Seller Rating
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Rating value={averageRating} precision={0.5} readOnly />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Write a Review
          </Typography>

          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Your Rating</Typography>
              <Rating
                name="rating"
                value={formik.values.rating}
                onChange={(event, newValue) => {
                  formik.setFieldValue("rating", newValue)
                }}
              />
              {formik.touched.rating && formik.errors.rating && (
                <Typography color="error" variant="caption">
                  {formik.errors.rating}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              id="review_text"
              name="review_text"
              label="Your Review (Optional)"
              multiline
              rows={4}
              value={formik.values.review_text}
              onChange={formik.handleChange}
              error={formik.touched.review_text && Boolean(formik.errors.review_text)}
              helperText={formik.touched.review_text && formik.errors.review_text}
              sx={{ mb: 2 }}
            />

            <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting}>
              Submit Review
            </Button>
          </Box>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Reviews
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

export default ReviewSellerPage

