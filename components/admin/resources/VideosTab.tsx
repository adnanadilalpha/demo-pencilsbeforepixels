"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { ToggleField } from "@/components/admin/content/ToggleField";
import { UploadedVideoPoster } from "@/components/sections/UploadedVideoPoster";
import type { AdminVideo } from "@/lib/admin/resources/types";
import { stripRichTextToPlain } from "@/lib/cms/rich-text";
type VideosTabProps = {
  items: AdminVideo[];
  onEdit: (item: AdminVideo) => void;
  onDelete: (item: AdminVideo) => void;
  onToggleVisible: (item: AdminVideo, visible: boolean) => void;
};

function VideoPreview({ video }: { video: AdminVideo }) {
  if (video.thumbnailUrl) {
    return (
      <Image
        src={video.thumbnailUrl}
        alt=""
        fill
        className="object-cover"
        unoptimized
      />
    );
  }

  if (video.youtubeId) {
    return (
      <Image
        src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
        alt=""
        fill
        className="object-cover"
        unoptimized
      />
    );
  }

  if (video.videoUrl) {
    return <UploadedVideoPoster src={video.videoUrl} />;
  }

  return (
    <div className="flex size-full items-center justify-center text-sm text-body-muted">
      No thumbnail
    </div>
  );
}

export function VideosTab({
  items,
  onEdit,
  onDelete,
  onToggleVisible,
}: VideosTabProps) {
  if (!items.length) {
    return <p className="pt-6 text-sm text-body-muted">No videos yet.</p>;
  }

  return (
    <div className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((video) => (
          <article
            key={video.id}
            className="overflow-hidden rounded-[14px] border border-navy-800/8 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => onEdit(video)}
              className="relative block h-36 w-full bg-[#18263a]"
            >
              <VideoPreview video={video} />
              {video.duration ? (
                <span className="absolute bottom-2 right-2 rounded bg-navy-800/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {video.duration}
                </span>
              ) : null}
            </button>

            <div className="space-y-3 p-4">
              <button
                type="button"
                onClick={() => onEdit(video)}
                className="text-left text-sm font-semibold leading-snug text-navy-800"
              >
                {stripRichTextToPlain(video.title)}
              </button>

              <div className="flex items-center gap-2 border-t border-navy-800/6 pt-3">
                <button
                  type="button"
                  onClick={() => onEdit(video)}
                  className="text-xs font-medium text-navy-800/70 transition-colors hover:text-navy-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(video)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600/80 transition-colors hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>

              <ToggleField
                label="Visible on site"
                checked={video.visible}
                onChange={(visible) => onToggleVisible(video, visible)}
              />
            </div>
          </article>
      ))}
    </div>
  );
}
