'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPopularPeople, searchPeople } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { PersonCard } from '@/components/person-card';
import { Loader2, Search, Users, UserCheck, Filter, Mic, MicOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const fetchPeople = useCallback(async () => {
    setIsLoading(true);
    try {
      let results;
      if (debouncedSearchQuery) {
        results = await searchPeople(debouncedSearchQuery);
      } else {
        results = await getPopularPeople();
      }
      setPeople(results);
    } catch (error) {
      console.error("Failed to fetch people:", error);
      setPeople([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const toggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not Supported", description: "Voice search is not supported in your browser." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    recognition.start();
  };

  return (
    <div className="space-y-12 py-8 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <UserCheck className="size-5" />
                <span className="text-sm font-bold uppercase tracking-[0.3em]">Verified Talent Archive</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white">
              {debouncedSearchQuery ? 'Discovery' : 'Popular'} <span className="text-primary">People</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
              Explore the architects of cinema—from iconic actors to visionary directors trending globally.
            </p>
          </div>

          <div className="relative w-full lg:w-[450px] group">
            <Search className={cn(
                "absolute left-5 top-1/2 -translate-y-1/2 size-5 transition-colors",
                searchQuery ? "text-primary" : "text-muted-foreground group-focus-within:text-primary"
            )} />
            <Input
              placeholder="Search for icons..."
              className="pl-14 pr-14 h-16 bg-secondary/40 border-white/5 rounded-2xl text-lg font-medium focus:ring-primary/20 focus:border-primary/50 transition-all glass-panel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
                onClick={toggleVoiceSearch}
                className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-300",
                    isListening ? "bg-primary text-white animate-pulse" : "text-muted-foreground hover:text-primary hover:bg-white/10"
                )}
            >
                {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
            <div className="size-8 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
              <Mic className="size-4 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Listening for talent names...</span>
          </div>
        )}
      </header>

      <main className="min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[400px] gap-6">
            <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Personnel Files...</p>
          </div>
        ) : people.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6 md:gap-8">
            {people.map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5 group hover:border-primary/20 transition-colors">
            <Users className="h-20 w-20 text-muted-foreground/10 group-hover:text-primary/20 transition-colors mb-6" />
            <h3 className="text-3xl font-bold text-white tracking-tight">No Match in Archive</h3>
            <p className="text-muted-foreground mt-3 text-lg font-medium text-center max-w-md px-6">
              We couldn't find any profiles for "{searchQuery}". Try searching for a director or different cast member.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
