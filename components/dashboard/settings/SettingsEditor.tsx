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
  FormGroup,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import Link from "next/link";
import ListEditor from "@/components/dashboard/settings/ListEditor";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader } from "@/components/dashboard/ui";
import ImageUploadButton from "@/components/dashboard/settings/ImageUploadButton";
import GatewaySettingsCard from "@/components/dashboard/settings/GatewaySettingsCard";
import EditorSection, { EditorSections } from "@/components/dashboard/settings/EditorSection";
import { apiGet, apiPatch, errorMessage } from "@/lib/api";
import {
  DEFAULT_SITE_SETTINGS,
  HOME_BLOCKS,
  HOME_PLACEHOLDERS,
  type FaqItem,
  type GalleryItem,
  type HeroSlide,
  type HeroStyle,
  type SiteSettings,
  type StatItem,
  type TitledItem,
} from "@/lib/shared/settings";
import type { SettingsResponse, SettingsUpdatedResponse } from "@/types/api";

type Toast = { open: boolean; msg: string; sev: "success" | "error" };

const TABS = ["Organisation", "Payment", "Registration"] as const;

/** "site": organisation, payment, registration (tabs). "landing": everything on the public home & join pages. */
export type SettingsMode = "site" | "landing";

const placeholderHelp = `Placeholders you can use: ${HOME_PLACEHOLDERS.join(" ")}. Wrap words in *asterisks* to highlight them; start a new line for a second paragraph (for example the Bangla line).`;

export default function SettingsEditor({ mode }: { mode: SettingsMode }) {
  const landing = mode === "landing";
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
      // Only send this screen's sections, so editing one screen never overwrites the other.
      const body = landing ? { home: form.home } : { site: form.site, payment: form.payment, registration: form.registration };
      const res = await apiPatch<SettingsUpdatedResponse>("/api/admin/settings", body);
      await mutate({ settings: res.settings }, { revalidate: false });
      setToast({ open: true, msg: "Settings saved", sev: "success" });
    } catch (err) {
      showError(errorMessage(err, "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageGate title={landing ? "Landing page" : "Site settings"} permission="settings.manage">
      <PageHeader
        eyebrow={landing ? "Content" : "Administration"}
        title={landing ? "Landing page" : "Site settings"}
        subtitle={
          landing
            ? "Every text, photo and section on the public home page and the How to join page."
            : "Organisation details, membership fees and registration. Home page content is under Landing page."
        }
        actions={
          <Stack direction="row" spacing={1}>
            {landing && (
              <Button variant="outlined" endIcon={<OpenInNewRounded />} component="a" href="/" target="_blank" rel="noreferrer">
                View site
              </Button>
            )}
            <Button variant="contained" startIcon={<SaveIcon />} disabled={saving || isLoading} onClick={onSave}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </Stack>
        }
      />

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
          {!landing && (
            <>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" allowScrollButtonsMobile>
                {TABS.map(label => (
                  <Tab key={label} label={label} />
                ))}
              </Tabs>
              <Alert severity="info" sx={{ mb: 2 }}>
                Home page text, photos and sections are edited under <Link href="/dashboard/landing">Landing page</Link>.
              </Alert>
            </>
          )}

          {!landing && tab === 0 && (
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

          {!landing && tab === 1 && (
            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardHeader title="Membership fees" subheader="One-time fee per membership type, paid online. Shown on the home page and the registration form." />
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="General membership (BDT)" type="number" value={form.payment.feeBkash} onChange={number("payment", "feeBkash")} required fullWidth helperText="Plot owner" />
                    <TextField label="Associate membership (BDT)" type="number" value={form.payment.feeBkashAssociate} onChange={number("payment", "feeBkashAssociate")} required fullWidth helperText="Family member of a plot owner" />
                  </Stack>
                </CardContent>
              </Card>
              <GatewaySettingsCard onSaved={msg => setToast({ open: true, msg, sev: "success" })} onError={showError} />
            </Stack>
          )}

          {!landing && tab === 2 && (
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

          {landing && (
            <EditorSections>
            <Stack spacing={2}>
              <Alert severity="info">{placeholderHelp}</Alert>

              <EditorSection title="Sections on the home page" subheader="Switch a block off to hide it. A block with no content is hidden anyway." defaultOpen>
                  <FormGroup row>
                    {HOME_BLOCKS.map(b => (
                      <FormControlLabel
                        key={b.key}
                        label={b.label}
                        control={
                          <Switch
                            checked={form.home.show[b.key]}
                            onChange={e => update("home", "show")({ ...form.home.show, [b.key]: e.target.checked })}
                          />
                        }
                        sx={{ minWidth: 260 }}
                      />
                    ))}
                  </FormGroup>
                </EditorSection>

              <EditorSection title="Hero" subheader="The full-width banner at the top of the home page">
                  <Stack spacing={2}>
                    <TextField
                      label="Headline"
                      value={form.home.heroTitle}
                      onChange={text("home", "heroTitle")}
                      required
                      fullWidth
                      helperText="The last word is highlighted unless you mark words with *asterisks*."
                    />
                    <TextField label="Sub-headline" value={form.home.heroSubtitle} onChange={text("home", "heroSubtitle")} fullWidth multiline minRows={2} />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField label="Main button" value={form.home.heroPrimaryLabel} onChange={text("home", "heroPrimaryLabel")} fullWidth helperText="Opens the application form (hidden while registration is closed)" />
                      <TextField label="Second button" value={form.home.heroSecondaryLabel} onChange={text("home", "heroSecondaryLabel")} fullWidth helperText="Opens member login" />
                    </Stack>
                    <TextField
                      select
                      label="Hero background"
                      value={form.home.heroStyle}
                      onChange={e => update("home", "heroStyle")(e.target.value as HeroStyle)}
                      fullWidth
                      helperText={
                        form.home.heroStyle === "photos"
                          ? "The photo slides below fade one into the next."
                          : "Twenty animated scenes of life in the township. The photo slides below are kept for later."
                      }
                    >
                      <MenuItem value="scenes">Animated neighbourhood scenes</MenuItem>
                      <MenuItem value="photos">Photo slides</MenuItem>
                    </TextField>
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
                </EditorSection>

              <EditorSection title="Figures under the hero" subheader="Up to six highlights, e.g. 30 · Planned sectors · in Purbachal New Town (hidden when the list is empty)">
                  <ListEditor<StatItem>
                    title="Figures"
                    items={form.home.stats}
                    onChange={update("home", "stats")}
                    empty={{ value: "", label: "", note: "" }}
                    addLabel="Add figure"
                    max={6}
                    helper="Placeholders work here too, e.g. ৳{fee} shows the current bKash fee."
                    fields={[
                      { key: "value", label: "Figure" },
                      { key: "label", label: "Label" },
                      { key: "note", label: "Small print" },
                    ]}
                  />
                </EditorSection>

              <EditorSection title="About section">
                  <Stack spacing={2}>
                    <TextField label="Section title" value={form.home.aboutTitle} onChange={text("home", "aboutTitle")} fullWidth />
                    <TextField
                      label="Photo (optional)"
                      value={form.home.aboutImage}
                      onChange={text("home", "aboutImage")}
                      fullWidth
                      helperText="Leave empty to show the township illustration."
                      InputProps={{ endAdornment: <ImageUploadButton onUploaded={update("home", "aboutImage")} onError={showError} /> }}
                    />
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
                </EditorSection>

              <EditorSection title="Why join" subheader="Benefit cards. Keep each to one short line.">
                  <Stack spacing={2}>
                    <TextField label="Section title" value={form.home.benefitsTitle} onChange={text("home", "benefitsTitle")} fullWidth />
                    <ListEditor<TitledItem>
                      title="Benefits"
                      items={form.home.benefits}
                      onChange={update("home", "benefits")}
                      empty={{ title: "", body: "" }}
                      addLabel="Add benefit"
                      max={20}
                      fields={[
                        { key: "title", label: "Title" },
                        { key: "body", label: "Text", multiline: true },
                      ]}
                    />
                  </Stack>
                </EditorSection>

              <EditorSection title="Gallery" subheader="Photos of the township and society events, shown after Why join (hidden while empty). Up to 30; the first one is shown large.">
                  <Stack spacing={2}>
                    <TextField label="Section title" value={form.home.galleryTitle} onChange={text("home", "galleryTitle")} fullWidth />
                    <ListEditor<GalleryItem>
                      title="Photos"
                      items={form.home.gallery}
                      onChange={update("home", "gallery")}
                      empty={{ src: "", caption: "" }}
                      addLabel="Add photo"
                      max={30}
                      helper="Upload a photo from your computer (or paste an https:// link) and add a short caption."
                      fields={[
                        {
                          key: "src",
                          label: "Photo",
                          adornment: (_item, set) => <ImageUploadButton onUploaded={set} onError={showError} />,
                        },
                        { key: "caption", label: "Caption (optional)" },
                      ]}
                    />
                  </Stack>
                </EditorSection>

              <EditorSection title="How to join" subheader="Steps are numbered automatically. Keep each step to one short line.">
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
                </EditorSection>

              <EditorSection title="Fees" subheader="Amounts and account details come from Site settings → Payment.">
                  <Stack spacing={2}>
                    <TextField label="Title" value={form.home.feesTitle} onChange={text("home", "feesTitle")} fullWidth />
                  </Stack>
                </EditorSection>

              <EditorSection title="FAQ" subheader="Answers stay folded until a visitor opens them">
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
                </EditorSection>

              <EditorSection title="Latest news" subheader="The three newest public posts (write them under Posts)">
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField label="Title" value={form.home.newsTitle} onChange={text("home", "newsTitle")} fullWidth />
                  </Stack>
                </EditorSection>

              <EditorSection title="Final call to action">
                  <Stack spacing={2}>
                    <TextField label="Title" value={form.home.ctaTitle} onChange={text("home", "ctaTitle")} fullWidth />
                    <TextField label="Text" value={form.home.ctaBody} onChange={text("home", "ctaBody")} fullWidth multiline minRows={2} />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField label="Main button" value={form.home.ctaPrimaryLabel} onChange={text("home", "ctaPrimaryLabel")} fullWidth helperText="Opens the application form" />
                      <TextField label="Second button" value={form.home.ctaSecondaryLabel} onChange={text("home", "ctaSecondaryLabel")} fullWidth helperText="Opens Track your application" />
                    </Stack>
                  </Stack>
                </EditorSection>
            </Stack>
            </EditorSections>
          )}

          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={saving}>
              {saving ? "Saving…" : landing ? "Save landing page" : "Save settings"}
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
    </PageGate>
  );
}
