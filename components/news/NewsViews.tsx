"use client";

import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { Alert, Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import NewsCard from "@/components/news/NewsCard";
import type { HomeSection, SiteSettings } from "@/lib/shared/settings";
import type { PublicPostDto } from "@/types/api";

type Chrome = { site: SiteSettings["site"]; sections: HomeSection[]; registrationOpen: boolean };

function Shell({ site, sections, registrationOpen, children }: Chrome & { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader site={site} sections={sections} registrationOpen={registrationOpen} />
      <Box component="main" sx={{ minHeight: "60vh", py: { xs: 5, md: 8 } }}>
        {children}
      </Box>
      <PublicFooter site={site} sections={sections} />
    </>
  );
}

/** /news: public posts for everyone, plus members-only posts for a logged-in member. */
export function NewsListView({ posts, isMember, ...chrome }: Chrome & { posts: PublicPostDto[]; isMember: boolean }) {
  return (
    <Shell {...chrome}>
      <Container maxWidth="lg">
        <Typography variant="overline" color="secondary.main">
          News & notices
        </Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 42 }, mb: 1 }}>
          From {chrome.site.shortName || chrome.site.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
          {isMember
            ? "Public news and notices for members. Posts marked “Members only” are visible because you are logged in."
            : "News and notices from the society. Members see more notices after logging in."}
        </Typography>
        {posts.length === 0 ? (
          <Alert severity="info">Nothing has been posted yet. Please check back later.</Alert>
        ) : (
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
            {posts.map(p => (
              <NewsCard key={p.id} post={p} />
            ))}
          </Box>
        )}
      </Container>
    </Shell>
  );
}

/** /news/[id]: one post, or a "log in to read" prompt for members-only posts. */
export function NewsArticleView({ post, loginRequired, ...chrome }: Chrome & { post: PublicPostDto | null; loginRequired: boolean }) {
  return (
    <Shell {...chrome}>
      <Container maxWidth="md">
        <Button component={Link} href="/news" startIcon={<ArrowBackRounded />} sx={{ mb: 2 }}>
          All news
        </Button>
        {loginRequired || !post ? (
          <Alert severity="info" icon={<LockRounded />} sx={{ alignItems: "center" }}
            action={
              <Button component={Link} href="/auth/login" variant="contained" size="small">
                Log in
              </Button>
            }
          >
            This notice is for members only. Please log in with your member account to read it.
          </Alert>
        ) : (
          <article>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                {dayjs(post.created).format("D MMMM YYYY")}
              </Typography>
              {post.membersOnly && <Chip size="small" icon={<LockRounded sx={{ fontSize: 14 }} />} label="Members only" color="secondary" variant="outlined" />}
            </Stack>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 28, md: 40 }, mb: 3 }}>
              {post.title}
            </Typography>
            {post.coverUrl && (
              <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 8", borderRadius: 3, overflow: "hidden", mb: 3 }}>
                <Image src={post.coverUrl} alt="" fill sizes="(max-width: 900px) 100vw, 900px" style={{ objectFit: "cover" }} unoptimized />
              </Box>
            )}
            {/* contentHtml is sanitised on the server (features/post/sanitize.ts). */}
            <Box
              sx={{ fontSize: 17, lineHeight: 1.75, "& img": { maxWidth: "100%", height: "auto", borderRadius: 2 }, "& a": { color: "primary.main" }, "& table": { borderCollapse: "collapse" }, "& td, & th": { border: 1, borderColor: "divider", p: 1 } }}
              dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
            />
          </article>
        )}
      </Container>
    </Shell>
  );
}
