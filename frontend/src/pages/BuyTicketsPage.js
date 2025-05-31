"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
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
  const [matchedRequestId, setMatchedRequestId] = useState(null) // Store the ID of the request that matched

  // New state variables for multiple ticket purchase
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)

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

  useEffect(() => {
    fetchData()
  }, [])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleBuyTicket = async (ticketId) => {
    try {
      await buyTicket(ticketId)

      // Get the ticket that was purchased
      const purchasedTicket = tickets.find((t) => t.ticket_id === ticketId)

      // Remove the purchased ticket from the list
      setTickets(tickets.filter((ticket) => ticket.ticket_id !== ticketId))

      setMessage({ type: "success", text: "הכרטיסים נרכשו בהצלחה. אימייל עם הכרטיסים ישלח אליך בהקדם" })

      // Dispatch a custom event that can be listened to by other components
      const ticketPurchaseEvent = new CustomEvent("ticketPurchased", {
        detail: {
          ticketId: ticketId,
          eventName: purchasedTicket?.event_name,
          eventDate: purchasedTicket?.event_date,
          price: purchasedTicket?.price,
          sellerId: purchasedTicket?.seller_id,
          category: purchasedTicket?.category,
          matchedRequestId: matchedRequestId, // Include the matched request ID if it exists
        },
      })
      window.dispatchEvent(ticketPurchaseEvent)

      // Refresh data to update listings
      fetchData()

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 35000)
    } catch (error) {
      console.error("Error buying ticket:", error)
      setMessage({ type: "error", text: "הקניה נכשלה. אנא נסו שנית." })
    }
  }

  // New function to handle buying multiple tickets
  const handleBuyMultipleTickets = async (groupedTicket, quantity) => {
    try {
      // Get the ticket IDs to purchase (limited by the requested quantity)
      const ticketIdsToBuy = groupedTicket.ticketIds.slice(0, quantity)

      // Purchase each ticket sequentially
      for (const ticketId of ticketIdsToBuy) {
        await buyTicket(ticketId)

        // Get the ticket that was purchased
        const purchasedTicket = tickets.find((t) => t.ticket_id === ticketId)

        // Dispatch the same event as in the single ticket purchase
        const ticketPurchaseEvent = new CustomEvent("ticketPurchased", {
          detail: {
            ticketId: ticketId,
            eventName: purchasedTicket?.event_name,
            eventDate: purchasedTicket?.event_date,
            price: purchasedTicket?.price,
            sellerId: purchasedTicket?.seller_id,
            category: purchasedTicket?.category,
            matchedRequestId: matchedRequestId,
          },
        })
        window.dispatchEvent(ticketPurchaseEvent)
      }

      // Update the tickets list
      setTickets(tickets.filter((ticket) => !ticketIdsToBuy.includes(ticket.ticket_id)))

      // Show success message
      setMessage({
        type: "success",
        text: `נקנו בהצלחה ${quantity} כרטיסים${quantity > 1 ? "s" : ""}!`,
      })

      // Refresh data to update listings
      fetchData()

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" })
      }, 5000)
    } catch (error) {
      console.error("Error buying multiple tickets:", error)
      setMessage({ type: "error", text: "קניה נכשלה. אנא נסו שנית" })
    }
  }

  // New function to handle the Buy Now button click
  const handleBuyButtonClick = (groupedTicket) => {
    if (groupedTicket.count > 1) {
      // If multiple tickets are available, open the dialog
      setSelectedTicket(groupedTicket)
      setPurchaseQuantity(1) // Reset to 1
      setPurchaseDialogOpen(true)
    } else {
      // If only one ticket is available, buy it directly
      if (window.confirm("האם אתם בטוחים שברצונכם לרכוש?")) {

      handleBuyTicket(groupedTicket.ticketIds[0])
      }
    }
  }

  // Group tickets by event, date, price, and seller
  const groupTickets = (ticketList) => {
    const groupedTickets = {}

    ticketList
      .filter((ticket) => !ticket.is_sold)
      .forEach((ticket) => {
        // Create a unique key for each group of tickets
        const key = `${ticket.event_name}-${ticket.category}-${ticket.event_date}-${ticket.price}-${ticket.seller_id}`

        if (!groupedTickets[key]) {
          groupedTickets[key] = {
            ...ticket,
            count: 1,
            ticketIds: [ticket.ticket_id],
          }
        } else {
          groupedTickets[key].count += 1
          groupedTickets[key].ticketIds.push(ticket.ticket_id)
        }
      })

    return Object.values(groupedTickets)
  }

  // Buy request form validation
  const validationSchema = Yup.object({
    event_name: Yup.string().required("שדה חובה"),
    category: Yup.string().required("שדה חובה"),
    event_date: Yup.date().required("שדה חובה"),
    max_price: Yup.number().positive("מחיר חייב להיות חיובי").required("שדה חובה"),
    quantity: Yup.number()
      .integer("כמות חייבת להיות מספר שלם")
      .positive("כמות חייבת להיות חיובית")
      .required("שדה חובה"),
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

        // Create the buy request
        const response = await createBuyRequest(formattedValues)
        const requestId = response.data.request_id

        setMessage({ type: "success", text: "הבקשה נוצרה בהצלחה" })
        resetForm()

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
            text: "נמצאה התאמה מדוייקת לבקשתך. עברו בבקשה לכרטיסים זמינים לקניה מהירה!.",
          })

          // Store the request ID that has matches
          setMatchedRequestId(requestId)

          // Switch to the Available Tickets tab
          setTabValue(0)

          // Store the match information in localStorage
          const matchInfo = {
            requestId: requestId,
            matches: matches.map((listing) => ({
              listingId: listing.sell_id,
              eventName: listing.event_name,
              eventDate: listing.event_date,
              price: listing.price,
              sellerId: listing.seller_id,
              category: listing.category,
            })),
          }

          // Get existing matches from localStorage or initialize empty array
          const existingMatches = JSON.parse(localStorage.getItem("buyRequestMatches") || "[]")
          existingMatches.push(matchInfo)
          localStorage.setItem("buyRequestMatches", JSON.stringify(existingMatches))
        }

        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage({ type: "", text: "" })
        }, 35000)
      } catch (error) {
        console.error("Error creating buy request:", error)
        setMessage({ type: "error", text: "הבקשה נכשלה. אנא נסו שנית" })
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

  // Group available tickets
  const groupedTickets = groupTickets(tickets)

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          קניית כרטיסים
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
            <Tab label="כרטיסים זמינים" />
            <Tab label="צרו בקשה לכרטיסים" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {groupedTickets.length > 0 ? (
                  groupedTickets.map((groupedTicket) => (
                    <Grid item xs={12} md={6} key={groupedTicket.ticket_id}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                          <Typography variant="h6">{groupedTicket.event_name}</Typography>
                          {groupedTicket.count > 1 && (
                            <Chip
                              label={`${groupedTicket.count} זמינים`}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: "medium" }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2">קטגוריה: {groupedTicket.category}</Typography>
                        <Typography variant="body2">
                          תאריך: {new Date(groupedTicket.event_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">מחיר: ${groupedTicket.price}</Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={() => handleBuyButtonClick(groupedTicket)}
                        >
                          קנה עכשיו
                        </Button>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>אין כרגע כרטיסים זמינים.</Typography>
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
                      label="שם אירוע"
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
                      label="קטגוריה"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      error={formik.touched.category && Boolean(formik.errors.category)}
                      helperText={formik.touched.category && formik.errors.category}
                    >
                      <MenuItem value="Concert">הופעה</MenuItem>
                      <MenuItem value="Sports">ספורט</MenuItem>
                      <MenuItem value="Theater">הצגה</MenuItem>
                      <MenuItem value="Other">אחר</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="event_date"
                      name="event_date"
                      label="תאריך"
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
                      label="מחיר מקסימלי (₪)"
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
                      label="כמות"
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
                  צור בקשה לכרטיסים
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Multiple Ticket Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)}>
        <DialogTitle>בחר כמות</DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedTicket.event_name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                קטגוריה: {selectedTicket.category}
              </Typography>
              <Typography variant="body2" gutterBottom>
                תאריך: {new Date(selectedTicket.event_date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                מחיר ליחידה: ₪{selectedTicket.price} 
              </Typography>

              <Box sx={{ my: 3 }}>
                <TextField
                  label="כמות"
                  type="number"
                  fullWidth
                  value={purchaseQuantity}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10)
                    if (!isNaN(value)) {
                      // Ensure quantity is between 1 and available tickets
                      setPurchaseQuantity(Math.min(Math.max(1, value), selectedTicket.count))
                    }
                  }}
                  inputProps={{
                    min: 1,
                    max: selectedTicket.count,
                  }}
                  helperText={`${selectedTicket.count} כרטיסים זמינים`}
                />
              </Box>

              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ${(selectedTicket.price * purchaseQuantity).toFixed(2)}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)}>ביטול</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (selectedTicket && purchaseQuantity > 0) {
                handleBuyMultipleTickets(selectedTicket, purchaseQuantity)
                setPurchaseDialogOpen(false)
              }
            }}
          >
            רכישה
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default BuyTicketsPage
