import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/Layout";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
  LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

export default function AddPreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canSubmit = useMemo(() => Boolean(file) && !loading, [file, loading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please choose a PDF to upload." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file, file.name);

    try {
      const res = await fetch("/api/dashboard/previews", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err?.error || "Upload failed");
      }
      setMessage({ type: "success", text: "Preview saved successfully." });
      setFile(null);
    } catch (error) {
      setMessage({ type: "error", text: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
        Simple Registration Form
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload the completed membership PDF so it’s stored alongside the other
        application documents.
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {message && (
                <Alert severity={message.type} onClose={() => setMessage(null)}>
                  {message.text}
                </Alert>
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
              >
                Select PDF
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  hidden
                  onChange={e => {
                    const selected = e.target.files?.[0] || null;
                    setFile(selected);
                  }}
                />
              </Button>
              {file && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {file.name}
                </Typography>
              )}
              {!file && (
                <Typography variant="body2" color="text.secondary">
                  Please choose a PDF before saving.
                </Typography>
              )}
              {loading && <LinearProgress />}
              <Box>
                <Button type="submit" variant="contained" disabled={!canSubmit}>
                  Save Preview
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
