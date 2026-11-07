"use client";

import Link from "next/link";
import { Box, Button, Container, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 12, textAlign: "center" }}>
        <Typography variant="h2" fontWeight={800} gutterBottom>
          404
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you are looking for does not exist.
        </Typography>
        <Button component={Link} href="/" variant="contained">
          Go home
        </Button>
      </Box>
    </Container>
  );
}
