import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const newsItems = [
  {
    id: 1,
    title: "Upcoming Sci-Fi Epic 'Nebula's End' Wraps Production",
    source: "Variety",
    author: "Jane Smith",
    authorAvatarId: "avatar-2",
    date: "2 hours ago",
    imageId: "news-1",
    excerpt: "The highly anticipated space opera from director Anya Sharma has officially finished filming, with a release date rumored for this holiday season."
  },
  {
    id: 2,
    title: "Indie Darling 'Cobblestone Heart' Wins Big at Sundance",
    source: "IndieWire",
    author: "Mike Johnson",
    authorAvatarId: "avatar-1",
    date: "1 day ago",
    imageId: "news-2",
    excerpt: "The quiet drama about a Parisian baker has captured the hearts of critics and audiences alike, taking home the Grand Jury Prize."
  },
  {
    id: 3,
    title: "Legendary Composer Hans Zimmer to Score New Historical Drama",
    source: "The Hollywood Reporter",
    author: "Emily White",
    authorAvatarId: "avatar-2",
    date: "3 days ago",
    imageId: "news-3",
    excerpt: "The Oscar-winning composer is set to create the soundscape for a new film about the life of Cleopatra, starring Zendaya."
  }
];

export default function NewsFeedSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-headline text-2xl font-bold tracking-tight">Film News Feed</h2>
        <p className="text-muted-foreground">The latest headlines from the world of cinema.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map(item => {
          const image = PlaceHolderImages.find(p => p.id === item.imageId);
          const avatar = PlaceHolderImages.find(p => p.id === item.authorAvatarId);
          return (
            <Card key={item.id} className="flex flex-col overflow-hidden group">
              {image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={image.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-lg">{item.title}</CardTitle>
                <CardDescription>{item.excerpt}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                <Avatar className="h-6 w-6">
                  {avatar && <AvatarImage src={avatar.imageUrl} alt={item.author} />}
                  <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{item.author} on {item.source} &bull; {item.date}</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
