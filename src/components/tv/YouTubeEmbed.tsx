import { Card } from "@/components/ui/card";

export function YouTubeEmbed() {
  const videoId = "jovLADhfTOo"; // Video ID

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
          title="Vídeo Institucional"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Card>
  );
}
