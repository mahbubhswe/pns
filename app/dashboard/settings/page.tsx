"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ListEditor from "@/components/dashboard/settings/ListEditor";
import ImageUploadButton from "@/components/dashboard/settings/ImageUploadButton";
import { apiGet, apiPatch, errorMessage } from "@/lib/api";
import {
  DEFAULT_SITE_SETTINGS,
  HOME_PLACEHOLDERS,
  type FaqItem,
  type HeroSlide,
  type SiteSettings,
  type TitledItem,
} from "@/lib/shared/settings";
import type { SettingsResponse, SettingsUpdatedResponse } from "@/types/api";

type Toast = { open: boolean; msg: string; sev: "success" | "error" };

const TABS = ["Organisation", "Payment", "Registration", "Landing page"] as const;

const placeholderHelp = `Placeholders you can use: ${HOME_PLACEHOLDERS.join(" ")}`;

export default function SettingsPage() {
  const { data, error, isLoading, mutate } = useSWR<SettingsResponse>("/api/admin/settings", apiGet);
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>({ open: false, msg: "", sev: "success" });

  // Load server values into the form once they arrive.
  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const update =
    <S extends keyof SiteSettings, K extends keyof SiteSettings[S]>(section: S, key: K) =>
    (value: SiteSettings[S][K]) =>
      setForm(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const text =
    <S extends keyof SiteSettings, K extends keyof SiteSettings[S]>(section: S, key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update(section, key)(e.target.value as SiteSettings[S][K]);

  const number =
    <S extends keyof SiteSettings, K extends keyof SiteSettings[S]>(section: S, key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update(section, key)(Number(e.target.value || 0) as SiteSettings[S][K]);

  const showError = (msg: string) => setToast({ open: true, msg, sev: "error" });

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiPatch<SettingsUpdatedResponse>("/api/admin/settings", form);
      await mutate({ settings: res.settings }, { revalidate: false });
      setToast({ open: true, msg: "Settings saved", sev: "success" });
    } catch (err) {
      showError(errorMessage(err, "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Site Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving || isLoading}
          onClick={onSave}
        >
          {saving ? "Saving…" : "Save all"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage(error, "Failed to load settings")}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={onSave}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" allowScrollButtonsMobile>
            {TABS.map(label => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>

          {tab === 0 && (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardHeader title="Organisation" subheader="Shown on the public site and in emails" />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Site name" value={form.site.name} onChange={text("site", "name")} required fullWidth />
                    <TextField label="Short name" value={form.site.shortName} onChange={text("site", "shortName")} required sx={{ minWidth: 160 }} />
                  </Stack>
                  <TextField label="Tagline" value={form.site.tagline} onChange={text("site", "tagline")} fullWidth />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Contact email" type="email" value={form.site.contactEmail} onChange={text("site", "contactEmail")} fullWidth />
                    <TextField label="Contact phone" value={form.site.contactPhone} onChange={text("site", "contactPhone")} fullWidth />
                  </Stack>
                  <TextField label="Address" value={form.site.address} onChange={text("site", "address")} fullWidth multiline minRows={2} />
                </Stack>
              </CardContent>
            </Card>
          )}

          {tab === 1 && (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardHeader title="Membership fees & payment" subheader="Used on the home page, registration form and the fee stored with each application" />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Fee via bKash (BDT)" type="number" value={form.payment.feeBkash} onChange={number("payment", "feeBkash")} required fullWidth />
                    <TextField label="Fee via bank (BDT)" type="number" value={form.payment.feeBank} onChange={number("payment", "feeBank")} required fullWidth />
                  </Stack>
                  <TextField label="bKash number (Send Money)" value={form.payment.bkashNumber} onChange={text("payment", "bkashNumber")} fullWidth />
                  <TextField label="Bank name & branch" value={form.payment.bankName} onChange={text("payment", "bankName")} fullWidth />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Account name" value={form.payment.bankAccountName} onChange={text("payment", "bankAccountName")} fullWidth />
                    <TextField label="Account number" value={form.payment.bankAccountNumber} onChange={text("payment", "bankAccountNumber")} fullWidth />
                    <TextField label="Routing number" value={form.payment.bankRoutingNumber} onChange={text("payment", "bankRoutingNumber")} fullWidth />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {tab === 2 && (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardHeader title="Registration" subheader="Open or close new membership applications" />
              <CardContent>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={form.registration.open} onChange={e => update("registration", "open")(e.target.checked)} />}
                    label={form.registration.open ? "Registration is open" : "Registration is closed"}
                  />
                  <TextField
                    label="Message shown when closed"
                    value={form.registration.closedMessage}
                    onChange={text("registration", "closedMessage")}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {tab === 3 && (
            <Stack spacing={3}>
              <Alert severity="info">{placeholderHelp}</Alert>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader title="Hero" subheader="The full-width banner at the top of the home page" />
                <CardContent>
                  <Stack spacing={2}>
                    <TextField label="Headline" value={form.home.heroTitle} onChange={text("home", "heroTitle")} required fullWidth />
                    <TextField label="Sub-headline" value={form.home.heroSubtitle} onChange={text("home", "heroSubtitle")} fullWidth multiline minRows={2} />
                    <Divider />
                    <ListEditor<HeroSlide>
                      title="Background slides"
                      items={form.home.slides}
                      onChange={update("home", "slides")}
                      empty={{ src: "", alt: "" }}
                      addLabel="Add slide"
                      max={10}
                      helper="Use an https:// image URL, or upload a file from your computer."
                      fields={[
                        {
                          key: "src",
                          label: "Image URL",
                          adornment: (_item, set) => <ImageUploadButton onUploaded={set} onError={showError} />,
                        },
                        { key: "alt", label: "Description (alt text)" },
                      ]}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader title="About section" />
                <CardContent>
                  <Stack spacing={2}>
                    <TextField label="Section title" value={form.home.aboutTitle} onChange={text("home", "aboutTitle")} fullWidth />
                    <TextField label="Intro paragraph" value={form.home.aboutIntro} onChange={text("home", "aboutIntro")} fullWidth multiline minRows={2} />
                    <ListEditor<TitledItem>
                      title="Highlights"
                      items={form.home.aboutPoints}
                      onChange={update("home", "aboutPoints")}
                      empty={{ title: "", body: "" }}
                      addLabel="Add highlight"
                      max={20}
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "body", label: "Text", multiline: true },
                      ]}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader title="How to join" subheader="Registration buttons are shown under the last step" />
                <CardContent>
                  <Stack spacing={2}>
                    <TextField label="Section title" value={form.home.stepsTitle} onChange={text("home", "stepsTitle")} fullWidth />
                    <ListEditor<TitledItem>
                      title="Steps"
                      items={form.home.steps}
                      onChange={update("home", "steps")}
                      empty={{ title: "", body: "" }}
                      addLabel="Add step"
                      max={20}
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "body", label: "Text", multiline: true },
                      ]}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader title="FAQ" />
                <CardContent>
                  <Stack spacing={2}>
                    <TextField label="Section title" value={form.home.faqTitle} onChange={text("home", "faqTitle")} fullWidth />
                    <ListEditor<FaqItem>
                      title="Questions"
                      items={form.home.faqs}
                      onChange={update("home", "faqs")}
                      empty={{ question: "", answer: "" }}
                      addLabel="Add question"
                      max={50}
                      fields={[
                        { key: "question", label: "Question" },
                        { key: "answer", label: "Answer", multiline: true },
                      ]}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader title="Final call to action" />
                <CardContent>
                  <Stack spacing={2}>
                    <TextField label="Title" value={form.home.ctaTitle} onChange={text("home", "ctaTitle")} fullWidth />
                    <TextField label="Text" value={form.home.ctaBody} onChange={text("home", "ctaBody")} fullWidth multiline minRows={2} />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}

          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.sev} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
