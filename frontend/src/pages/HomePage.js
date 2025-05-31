import { Container, Typography, Box, Button, Grid, Paper } from "@mui/material"
import { Link } from "react-router-dom"

const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h2" component="h1" gutterBottom>
          ברוכים הבאים לטיקטמרקט
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          קניה ומכירה של כרטיסים בקלות
        </Typography>
        <Box sx={{ mt: 4 }}>
        <Button component={Link} to="/login" variant="outlined" color="primary" size="large" sx={{ mr: 2 }}>
            התחבר
          </Button>
          <Button component={Link} to="/register" variant="contained" color="primary" size="large" sx={{ mr: 2 }}>
            הירשם
          </Button>

        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5" gutterBottom>
              קניית כרטיסים
            </Typography>
            <Typography variant="body1">
              מיצאו כרטיסים לאירועים האהובים עליכם - ספורט, הופעות, הצגות ועוד.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5" gutterBottom>
              מכירת כרטיסים
            </Typography>
            <Typography variant="body1">
             מיכרו כרטיסים בקלות בצורה הנוחה והאמינה ביותר.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h5" gutterBottom>
              בקשו כרטיסים
            </Typography>
            <Typography variant="body1">
              מחפש כרטיס להופעה? מחפש מה לעשות בימים הקרובים? - זה המקום ליצור בקשת חיפוש לכרטיסים בצורה הטובה ביותר.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default HomePage

