"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useVideoPlayer } from "@/context/video-provider";

export function VideoPlayer() {
  const { videoId, setVideoId } = useVideoPlayer();

  return (
    <Dialog open={!!videoId} onOpenChange={(open) => !open && setVideoId(null)}>
      <DialogContent className="max-w-4xl p-0 border-none bg-transparent">
        <div className="aspect-video">
          {videoId && (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
