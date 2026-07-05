"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookFormModal } from "@/components/admin/resources/BookFormModal";
import { BooksTab } from "@/components/admin/resources/BooksTab";
import { LibraryItemFormModal } from "@/components/admin/resources/LibraryItemFormModal";
import { LibraryItemsTab } from "@/components/admin/resources/LibraryItemsTab";
import {
  getAddLabel,
  parseResourceTab,
  ResourceTabBar,
} from "@/components/admin/resources/ResourceTabBar";
import { VideoFormModal } from "@/components/admin/resources/VideoFormModal";
import { VideosTab } from "@/components/admin/resources/VideosTab";
import type {
  AdminBook,
  AdminLibraryItem,
  AdminVideo,
  ResourceApiType,
  ResourceTab,
  ResourcesCatalog,
} from "@/lib/admin/resources/types";

type ResourcesViewProps = {
  initialCatalog: ResourcesCatalog;
};

type PendingDelete = {
  type: ResourceApiType;
  id: string;
  label: string;
};

type LibrarySaveType = "walled-garden" | "research-papers";

export function ResourcesView({ initialCatalog }: ResourcesViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseResourceTab(searchParams.get("tab"));

  const [catalog, setCatalog] = useState(initialCatalog);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [librarySaveType, setLibrarySaveType] =
    useState<LibrarySaveType>("walled-garden");
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingLibraryItem, setEditingLibraryItem] =
    useState<AdminLibraryItem | null>(null);
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null);
  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refreshCatalog = useCallback(async () => {
    const response = await fetch("/api/admin/resources");
    if (!response.ok) return;
    const next = (await response.json()) as ResourcesCatalog;
    setCatalog(next);
    router.refresh();
  }, [router]);

  const setTab = (tab: ResourceTab) => {
    router.replace(`/admin/resources?tab=${tab}`, { scroll: false });
  };

  const patchResource = async (
    type: ResourceApiType,
    id: string,
    patch: Record<string, unknown>,
  ) => {
    const response = await fetch("/api/admin/resources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, patch }),
    });
    if (!response.ok) return;
    const next = (await response.json()) as ResourcesCatalog;
    setCatalog(next);
  };

  const requestDelete = (type: ResourceApiType, id: string, label: string) => {
    setPendingDelete({ type, id, label });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/resources?type=${pendingDelete.type}&id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) return;
      const next = (await response.json()) as ResourcesCatalog;
      setCatalog(next);
      setPendingDelete(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const openLibraryModal = (
    saveType: LibrarySaveType,
    item: AdminLibraryItem | null,
  ) => {
    setLibrarySaveType(saveType);
    setEditingLibraryItem(item);
    setLibraryModalOpen(true);
  };

  const handleAdd = () => {
    if (activeTab === "walled-garden") {
      openLibraryModal("walled-garden", null);
      return;
    }
    if (activeTab === "research-papers") {
      openLibraryModal("research-papers", null);
      return;
    }
    if (activeTab === "books") {
      setEditingBook(null);
      setBookModalOpen(true);
      return;
    }
    if (activeTab === "videos") {
      setEditingVideo(null);
      setVideoModalOpen(true);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Resources"
          description="Manage books, Walled Garden articles, research papers, and videos."
        />
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-full border border-gold-500 bg-gold-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c26d05]"
        >
          <Plus className="size-3.5" />
          {getAddLabel(activeTab)}
        </button>
      </div>

      <ResourceTabBar active={activeTab} onChange={setTab} />

      {activeTab === "walled-garden" ? (
        <LibraryItemsTab
          items={catalog.walledGarden}
          emptyMessage="No Walled Garden articles yet."
          searchPlaceholder="Search Walled Garden articles…"
          onEdit={(item) => openLibraryModal("walled-garden", item)}
          onDelete={(item) =>
            void requestDelete("walled-garden", item.id, item.title)
          }
          onToggleVisible={(item, visible) =>
            void patchResource("walled-garden", item.id, { visible })
          }
        />
      ) : null}

      {activeTab === "research-papers" ? (
        <LibraryItemsTab
          items={catalog.researchPapers}
          emptyMessage="No research papers yet."
          searchPlaceholder="Search research papers…"
          onEdit={(item) => openLibraryModal("research-papers", item)}
          onDelete={(item) =>
            void requestDelete("research-papers", item.id, item.title)
          }
          onToggleVisible={(item, visible) =>
            void patchResource("research-papers", item.id, { visible })
          }
        />
      ) : null}

      {activeTab === "books" ? (
        <BooksTab
          items={catalog.books}
          onAdd={() => {
            setEditingBook(null);
            setBookModalOpen(true);
          }}
          onEdit={(item) => {
            setEditingBook(item);
            setBookModalOpen(true);
          }}
          onDelete={(item) => void requestDelete("books", item.id, item.title)}
          onToggleVisible={(item, visible) =>
            void patchResource("books", item.id, { visible })
          }
        />
      ) : null}

      {activeTab === "videos" ? (
        <VideosTab
          items={catalog.videos}
          onEdit={(item) => {
            setEditingVideo(item);
            setVideoModalOpen(true);
          }}
          onDelete={(item) => void requestDelete("videos", item.id, item.title)}
          onToggleVisible={(item, visible) =>
            void patchResource("videos", item.id, { visible })
          }
        />
      ) : null}

      <LibraryItemFormModal
        open={libraryModalOpen}
        onClose={() => {
          setLibraryModalOpen(false);
          setEditingLibraryItem(null);
        }}
        initial={editingLibraryItem}
        saveType={librarySaveType}
        onSaved={refreshCatalog}
      />

      <BookFormModal
        open={bookModalOpen}
        onClose={() => {
          setBookModalOpen(false);
          setEditingBook(null);
        }}
        initial={editingBook}
        onSaved={refreshCatalog}
      />

      <VideoFormModal
        open={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setEditingVideo(null);
        }}
        initial={editingVideo}
        onSaved={refreshCatalog}
      />

      <AdminConfirmDeleteModal
        open={pendingDelete !== null}
        itemName={pendingDelete?.label ?? ""}
        confirming={deleting}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
