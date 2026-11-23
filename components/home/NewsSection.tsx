"use client";

// Home page: the latest public posts (loaded section by section, see Deferred).
import { Reveal } from "@/components/home/motion";
import React from "react";
import Link from "next/link";
import { Box, Button, Container } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import NewsCard from "@/components/news/NewsCard";
import { SectionTitle } from "@/components/home/parts";
import type { PublicPostDto } from "@/types/api";

export default function NewsSection({ title, news }: { title: string; news: PublicPostDto[] }) {
  return (
    <Box id="news" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <Reveal>
          <SectionTitle center title={title} />
        </Reveal>
        <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" } }}>
          {news.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.06}>
              <NewsCard post={post} />
            </Reveal>
          ))}
        </Box>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button component={Link} href="/news" variant="outlined" endIcon={<ArrowForwardRounded />}>
            All news
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
