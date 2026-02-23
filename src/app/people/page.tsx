
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPopularPeople, searchPeople } from '@/lib/tmdb.client';
import type { Person } from '@/lib/tmdb';
import { PersonCard } from '@/components/person-card';
import { Loader2, Search, Users, UserCheck, Filter, Mic, MicOff, Award, Globe, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-20 py-12 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
                <UserCheck className="size-6" />
                <span className="text-sm font-black uppercase tracking-[0.4em]">Verified Talent Archive</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none">
              {debouncedSearchQuery ? 'Talent' : 'Popular'} <span className="text-primary">Icons</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-2xl max-w-3xl font-medium leading-relaxed opacity-80">
              Personnel files of the visionary architects—from legendary actors to global production leads.
            </p>
          </div>

          <div className="relative w-full lg:w-[500px] group flex items-center gap-4">
            <div className="relative flex-1">
                <Search className={cn(
                    "absolute left-6 top-1/2 -translate-y-1/2 size-6 transition-all duration-500",
                    searchQuery ? "text-primary scale-110" : "text-muted-foreground group-focus-within:text-primary"
                )} />
                <Input
                placeholder="Locate by name..."
                className="pl-16 pr-16 h-20 bg-secondary/40 border-white/5 rounded-[2rem] text-xl font-black uppercase tracking-tighter focus:ring-primary/20 transition-all border-2 backdrop-blur-3xl shadow-2xl placeholder:text-muted-foreground/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    onClick={toggleVoiceSearch}
                    className={cn(
                        "absolute right-5 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all duration-500 active:scale-90",
                        isListening ? "bg-primary text-white animate-pulse shadow-[0_0_30px_rgba(225,29,72,0.6)]" : "text-muted-foreground hover:text-primary hover:bg-white/10"
                    )}
                >
                    {isListening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                </button>
            </div>
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-6 bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem] animate-in slide-in-from-top-4 duration-700 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            <div className="size-14 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(225,29,72,0.5)] relative z-10">
              <Mic className="size-7 text-white" />
            </div>
            <div className="space-y-1 relative z-10">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-primary block">Signal Recognition Active</span>
                <p className="text-lg md:text-xl text-white font-black uppercase tracking-tighter">"Locate Christopher Nolan"</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 p-2 bg-secondary/10 border border-white/5 rounded-2xl w-fit">
            <div className="flex items-center gap-2 px-4 border-r border-white/10">
                <Globe className="size-3 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Registry</span>
            </div>
            <div className="flex items-center gap-2 px-4">
                <ShieldCheck className="size-3 text-green-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Identity Sync Verified</span>
            </div>
        </div>
      </header>

      <main className="min-h-[600px] relative">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[500px] gap-6">
            <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground animate-pulse font-black tracking-[0.4em] uppercase text-[10px]">Accessing Personnel Files...</p>
          </div>
        ) : people.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10 animate-in fade-in duration-1000">
            {people.map(person => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[4rem] border-2 border-dashed border-white/5 group hover:border-primary/20 transition-all duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl" />
            <Users className="h-24 w-24 text-muted-foreground/5 group-hover:text-primary/10 transition-all duration-700 mb-8" />
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase">No Registry Match</h3>
            <p className="text-muted-foreground mt-4 text-xl font-medium text-center max-w-md px-10 leading-relaxed opacity-60">
              We couldn't locate any personnel records matching "{searchQuery}". Ensure name parity or try indexing by primary department.
            </p>
          </div>
        )}
      </main>

      <footer className="pt-20 border-t border-white/5 flex flex-col items-center gap-6 opacity-40">
          <div className="flex items-center gap-4">
              <Award className="size-5 text-primary" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Certified Production Architects Index</p>
          </div>
      </footer>
    </div>
  );
}
