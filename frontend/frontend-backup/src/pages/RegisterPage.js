"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Typography, Box, TextField, Button, MenuItem, Paper, Grid } from "@mui/material"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useAuth } from "../context/AuthContext"

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    role: Yup.string().required("Role is required"),
    phoneNumber: Yup.string(),
  })

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...userData } = values
        await register(userData)
        navigate("/login", { state: { message: "Registration successful! Please log in." } })
      } catch (err) {
        setError(err.response?.data?.detail || "Registration failed. Please try again.")
      }
    },
  })

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create an Account
        </Typography>

        {error && (
          <Box sx={{ mb: 2, color: "error.main" }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="role"
                name="role"
                select
                label="Role"
                value={formik.values.role}
                onChange={formik.handleChange}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
              >
                <MenuItem value="Buyer">Buyer</MenuItem>
                <MenuItem value="Seller">Seller</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number (Optional)"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            Register
          </Button>

          <Button fullWidth variant="text" onClick={() => navigate("/login")}>
            Already have an account? Sign in
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegisterPage

