"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import PageGate from "@/components/dashboard/PageGate";
import { PageHeader } from "@/components/dashboard/ui";
import { useAdmin } from "@/lib/useAdmin";
import { Box, Button, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { apiDelete, errorMessage, getJSON } from "@/lib/api";
import dayjs from "dayjs";
import type { PostDto as Post, PostsListResponse as PostsResp } from "@/types/api";

export default function PostsPage() {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<PostsResp>("/api/admin/posts", getJSON);
  const rows = useMemo(() => data?.posts || [], [data]);
  const { can } = useAdmin();
  const manage = can("posts.manage");

  async function confirmAndDelete(id: number, title?: string) {
    const Swal = (await import("sweetalert2")).default;
    const result = await Swal.fire({
      title: "Delete post?",
      text: title ? `This will remove "${title}".` : "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await apiDelete(`/api/admin/posts/${id}`);
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Failed", text: errorMessage(e) });
      return;
    }
    await mutate();
    await Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
  }

  const columns: GridColDef<Post>[] = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 220 },
    { field: "published", headerName: "Status", minWidth: 120, renderCell: p => <Chip label={p.value ? "Published" : "Draft"} color={p.value ? "success" : "default"} size="small" /> },
    { field: "created", headerName: "Created", minWidth: 160, renderCell: p => dayjs(p.value).isValid() ? dayjs(p.value).format("D, MMM YYYY") : "" },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: params => !manage ? [] : [
        <GridActionsCellItem key="edit" icon={<EditIcon fontSize="small" />} label="Edit" onClick={() => router.push(`/dashboard/posts/${params.id}`)} showInMenu={false} />,
        <GridActionsCellItem key="delete" icon={<DeleteIcon fontSize="small" />} label="Delete" onClick={() => confirmAndDelete(Number(params.id), params.row.title)} showInMenu={false} />,
      ],
    },
  ];

  return (
    <PageGate title="Posts" permission={["posts.view", "posts.manage"]}>
      <PageHeader
        eyebrow="Community"
        title="Posts"
        subtitle="News, notices and updates for members."
        actions={manage && <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push("/dashboard/posts/new")}>Write a post</Button>}
      />
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          pageSizeOptions={[5, 10, 25, 50]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
        />
      </Box>
    </PageGate>
  );
}

