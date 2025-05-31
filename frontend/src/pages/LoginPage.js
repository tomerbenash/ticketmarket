"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Container, Typography, Box, TextField, Button, Paper, Alert } from "@mui/material"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useAuth } from "../context/AuthContext"

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState("")
  const message = location.state?.message || ""

  const validationSchema = Yup.object({
    email: Yup.string().email("אימייל לא תקין").required("שדה חובה"),
    password: Yup.string().required("שדה חובה"),
  })

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await login(values)
        navigate("/dashboard")
      } catch (err) {
        setError(err.response?.data?.detail || "התחברות נכשלה. בדקו את הפרטים.")
      }
    },
  })

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          התחברות
        </Typography>

        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <TextField
            margin="normal"
            fullWidth
            id="email"
            name="email"
            label="כתובת אימייל"
            autoComplete="email"
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            margin="normal"
            fullWidth
            id="password"
            name="password"
            label="סיסמה"
            type="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
          >
            התחבר
          </Button>

          <Button fullWidth variant="text" onClick={() => navigate("/register")}>
            אין לך עדיין משתמש? הירשם עכשיו!
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export default LoginPage

