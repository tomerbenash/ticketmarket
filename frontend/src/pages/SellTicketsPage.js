"use client"

import { useState } from "react"
import { Container, Typography, Box, TextField, Button, MenuItem, Paper, Grid, Alert } from "@mui/material"
import { useFormik } from "formik"
import * as Yup from "yup"
import { createSellListing } from "../services/api"
import { useAuth } from "../context/AuthContext"

const SellTicketsPage = () => {
  const { user } = useAuth()
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const validationSchema = Yup.object({
    event_name: Yup.string().required("Event name is required"),
    category: Yup.string().required("Category is required"),
    event_date: Yup.date().required("Event date is required"),
    price: Yup.number().positive("Price must be positive").required("Price is required"),
    quantity: Yup.number()
      .integer("Quantity must be an integer")
      .positive("Quantity must be positive")
      .required("Quantity is required"),
  })

  const formik = useFormik({
    initialValues: {
      event_name: "",
      category: "",
      event_date: "",
      price: "",
      quantity: 1,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Format the date to YYYY-MM-DD
        const formattedValues = {
          ...values,
          event_date: new Date(values.event_date).toISOString().split("T")[0],
          price: Number(values.price),
          quantity: Number(values.quantity),
        }

        await createSellListing(formattedValues)
        setSuccess("Listing created successfully!")
        setError("")
        resetForm()

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess("")
        }, 5000)
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to create listing. Please try again.")
        setSuccess("")
      }
    },
  })

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sell Tickets
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="event_name"
                  name="event_name"
                  label="Event Name"
                  value={formik.values.event_name}
                  onChange={formik.handleChange}
                  error={formik.touched.event_name && Boolean(formik.errors.event_name)}
                  helperText={formik.touched.event_name && formik.errors.event_name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="category"
                  name="category"
                  select
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                >
                  <MenuItem value="Concert">Concert</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                  <MenuItem value="Theater">Theater</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="event_date"
                  name="event_date"
                  label="Event Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.event_date}
                  onChange={formik.handleChange}
                  error={formik.touched.event_date && Boolean(formik.errors.event_date)}
                  helperText={formik.touched.event_date && formik.errors.event_date}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Price ($)"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="quantity"
                  name="quantity"
                  label="Quantity"
                  type="number"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={formik.isSubmitting}
            >
              Create Listing
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default SellTicketsPage

