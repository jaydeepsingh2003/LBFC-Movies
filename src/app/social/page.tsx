'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/auth-client';
import { collection, getDocs } from 'firebase/firestore';
import { Loader2, UserPlus, UserCheck, Users, Search, Globe, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/firebase/firestore/social';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export default function SocialPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const followingQuery = useMemo(() => 
    firestore && currentUser ? collection(firestore, `users/${currentUser.uid}/following`) : null,
  [firestore, currentUser]);
  const [followingSnapshot] = useCollection(followingQuery);
  const following = useMemo(() => new Set(followingSnapshot?.docs.map(doc => doc.id)), [followingSnapshot]);

  useEffect(() => {
    async function fetchUsers() {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const usersCollection = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const usersList = userSnapshot.docs
          .map(doc => doc.data() as UserProfile)
          .filter(user => user.uid !== currentUser?.uid);
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (currentUser) {
        fetchUsers();
    }
  }, [firestore, currentUser]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
        u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUser || !firestore) return;
    const isFollowing = following.has(targetUserId);
    try {
        if (isFollowing) {
            await unfollowUser(firestore, currentUser.uid, targetUserId);
            toast({ title: "Secure Link Severed", description: "You are no longer following this architect." });
        } else {
            await followUser(firestore, currentUser.uid, targetUserId);
            toast({ title: "Connection Established", description: "Now tracking this architect's vault." });
        }
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <div className="space-y-12 py-8 px-4 md:px-8 lg:px-12 max-w-[2000px] mx-auto min-h-screen">
      <header className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
                <Globe className="size-5" />
                <span className="text-sm font-bold uppercase tracking-[0.3em]">Architect Network</span>
            </div>
            <h1 className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white">
              Discover <span className="text-primary">Architects</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
              Connect with visionary curators and explore the cinematic vaults of the global CINEVEXIA community.
            </p>
          </div>

          <div className="relative w-full lg:w-[450px] group">
            <Search className={cn(
                "absolute left-5 top-1/2 -translate-y-1/2 size-5 transition-colors",
                searchQuery ? "text-primary" : "text-muted-foreground group-focus-within:text-primary"
            )} />
            <Input
              placeholder="Locate by name or email..."
              className="pl-14 h-16 bg-secondary/40 border-white/5 rounded-2xl text-lg font-medium focus:ring-primary/20 focus:border-primary/50 transition-all glass-panel"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[500px] gap-6">
            <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
            </div>
            <p className="text-muted-foreground animate-pulse font-black tracking-[0.4em] uppercase text-[10px]">Scanning Local Nodes...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredUsers.map(user => (
              <Card key={user.uid} className="glass-panel border-white/5 overflow-hidden group hover:border-primary/20 transition-all duration-500 rounded-[2rem] shadow-2xl">
                <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                    <Link href={`/profile/${user.uid}`} className="relative group/avatar">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity animate-pulse" />
                        <Avatar className="h-28 w-28 border-4 border-white/5 group-hover/avatar:border-primary/50 transition-all relative z-10 shadow-2xl">
                            <AvatarImage src={user.photoURL} alt={user.displayName} className="object-cover" />
                            <AvatarFallback className="bg-secondary text-primary font-black text-2xl">{user.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 z-20 bg-primary p-1.5 rounded-full shadow-lg border-2 border-black">
                            <ShieldCheck className="size-3 text-white" />
                        </div>
                    </Link>
                  
                  <div className="space-y-1 w-full px-4">
                    <Link href={`/profile/${user.uid}`}>
                        <p className="text-xl font-black text-white group-hover:text-primary transition-colors truncate uppercase tracking-tighter">{user.displayName || 'Architect'}</p>
                    </Link>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">{user.email}</p>
                  </div>

                  <div className="flex flex-col w-full gap-3">
                      <Button
                        variant={following.has(user.uid) ? 'secondary' : 'default'}
                        onClick={() => handleFollowToggle(user.uid)}
                        className={cn(
                            "w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                            following.has(user.uid) ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        )}
                      >
                        {following.has(user.uid) ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {following.has(user.uid) ? 'Following' : 'Establish Link'}
                      </Button>
                      <Button asChild variant="outline" className="w-full h-12 border-white/5 bg-secondary/20 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                          <Link href={`/profile/${user.uid}`}>Access Vault</Link>
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-white/5">
            <Users className="h-20 w-20 text-muted-foreground/10 mb-6" />
            <h3 className="text-3xl font-bold text-white tracking-tight uppercase">Signal Lost</h3>
            <p className="text-muted-foreground mt-3 text-lg font-medium text-center max-w-md px-6">
              We couldn't locate any architects matching "{searchQuery}". Try a wider search parameter.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
