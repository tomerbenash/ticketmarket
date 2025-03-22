"use client"

import { useState, useEffect } from "react"
import { Container, Typography, Box, Grid, Paper, Button, Tabs, Tab, TextField, MenuItem } from "@mui/material"
import { useFormik } from "formik"
import * as Yup from "yup"
import { getTickets, getSellListings, createBuyRequest, buyTicket } from "../services/api"
import { useAuth } from "../context/AuthContext"

const BuyTicketsPage = () => {
  const { user } = useAuth()
  const [tabValue, setTabValue] = useState(0)
  const [tickets, setTickets] = useState([])
  const [sellListings, setSellListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch available tickets
        const ticketsResponse = await getTickets()
        setTickets(ticketsResponse.data)

        // Fetch sell listings
        const listingsResponse = await getSellListings()
        setSellListings(listingsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage({ type: "error", text: "Failed to load data. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleBuyTicket = async (ticketId) => {
    try {
      await buyTicket(ticketId)

      // Update tickets list
      setTickets(
        tickets.map((ticket) =>
          ticket.ticket_id === ticketId ? { ...ticket, is_sold: true, buyer_id: user.user_id } : ticket,
        ),
      )

      setMessage({ type: "success", text: "Ticket purchased successfully!" })

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 5000)
    } catch (error) {
      console.error("Error buying ticket:", error)
      setMessage({ type: "error", text: "Failed to purchase ticket. Please try again." })
    }
  }

  // Buy request form validation
  const validationSchema = Yup.object({
    event_name: Yup.string().required("Event name is required"),
    category: Yup.string().required("Category is required"),
    event_date: Yup.date().required("Event date is required"),
    max_price: Yup.number().positive("Price must be positive").required("Max price is required"),
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
      max_price: "",
      quantity: 1,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Format the date to YYYY-MM-DD
        const formattedValues = {
          ...values,
          event_date: new Date(values.event_date).toISOString().split("T")[0],
          max_price: Number(values.max_price),
          quantity: Number(values.quantity),
        }

        await createBuyRequest(formattedValues)
        setMessage({ type: "success", text: "Buy request created successfully!" })
        resetForm()

        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" })
        }, 5000)

        // Check for matching listings
        const matches = sellListings.filter(
          (listing) =>
            listing.event_name.toLowerCase() === values.event_name.toLowerCase() &&
            listing.price <= Number(values.max_price) &&
            new Date(listing.event_date).toISOString().split("T")[0] ===
              new Date(values.event_date).toISOString().split("T")[0],
        )

        if (matches.length > 0) {
          setMessage({
            type: "info",
            text: "We found matching tickets for your request! Check the available tickets tab.",
          })
        }
      } catch (error) {
        console.error("Error creating buy request:", error)
        setMessage({ type: "error", text: "Failed to create buy request. Please try again." })
      }
    },
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
        <Typography variant="h4" component="h1" gutterBottom>
          Buy Tickets
        </Typography>

        {message.text && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor:
                message.type === "success" ? "success.light" : message.type === "error" ? "error.light" : "info.light",
            }}
          >
            <Typography
              color={
                message.type === "success" ? "success.dark" : message.type === "error" ? "error.dark" : "info.dark"
              }
            >
              {message.text}
            </Typography>
          </Paper>
        )}

        <Paper sx={{ mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            <Tab label="Available Tickets" />
            <Tab label="Create Buy Request" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {tickets.filter((ticket) => !ticket.is_sold).length > 0 ? (
                  tickets
                    .filter((ticket) => !ticket.is_sold)
                    .map((ticket) => (
                      <Grid item xs={12} md={6} key={ticket.ticket_id}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="h6">{ticket.event_name}</Typography>
                          <Typography variant="body2">Category: {ticket.category}</Typography>
                          <Typography variant="body2">
                            Date: {new Date(ticket.event_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">Price: ${ticket.price}</Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => handleBuyTicket(ticket.ticket_id)}
                          >
                            Buy Now
                          </Button>
                        </Paper>
                      </Grid>
                    ))
                ) : (
                  <Typography>No tickets available at the moment.</Typography>
                )}
              </Grid>
            )}

            {tabValue === 1 && (
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
                      id="max_price"
                      name="max_price"
                      label="Maximum Price ($)"
                      type="number"
                      value={formik.values.max_price}
                      onChange={formik.handleChange}
                      error={formik.touched.max_price && Boolean(formik.errors.max_price)}
                      helperText={formik.touched.max_price && formik.errors.max_price}
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
                  Create Buy Request
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default BuyTicketsPage

