import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, Tabs, Tab, TextField, MenuItem, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getSellListings, getBuyRequests } from '../services/api';

const MarketplacePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sellListings, setSellListings] = useState([]);
  const [buyRequests, setBuyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all sell listings
        const sellResponse = await getSellListings();
        setSellListings(sellResponse.data);
        
        // Fetch all buy requests
        const buyResponse = await getBuyRequests();
        setBuyRequests(buyResponse.data);
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  // Filter listings based on search term and category
  const filteredSellListings = sellListings.filter(listing => {
    const matchesSearch = listing.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || listing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBuyRequests = buyRequests.filter(request => {
    const matchesSearch = request.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || request.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ticket Marketplace
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search events..."
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
              <TextField
                select
                fullWidth
                label="Category"
                value={categoryFilter}
                onChange={handleCategoryChange}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Concert">Concert</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Theater">Theater</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Tickets For Sale" />
            <Tab label="Buy Requests" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                {filteredSellListings.length > 0 ? (
                  filteredSellListings.map((listing) => (
                    <Grid item xs={12} md={6} lg={4} key={listing.sell_id}>
                      <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>{listing.event_name}</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" color="text.secondary">Category: {listing.category}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(listing.event_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Price: ${listing.price}</Typography>
                          <Typography variant="body2" color="text.secondary">Quantity: {listing.quantity}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                          Listed on: {new Date(listing.created_date).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>No tickets for sale match your criteria.</Typography>
                )}
              </Grid>
            )}
            
            {tabValue === 1 && (
              <Grid container spacing={2}>
                {filteredBuyRequests.length > 0 ? (
                  filteredBuyRequests.map((request) => (
                    <Grid item xs={12} md={6} lg={4} key={request.request_id}>
                      <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" gutterBottom>{request.event_name}</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" color="text.secondary">Category: {request.category}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(request.event_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Max Price: ${request.max_price}</Typography>
                          <Typography variant="body2" color="text.secondary">Quantity: {request.quantity}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                          Requested on: {new Date(request.created_date).toLocaleDateString()}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))
                ) : (
                  <Typography>No buy requests match your criteria.</Typography>
                )}
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MarketplacePage;