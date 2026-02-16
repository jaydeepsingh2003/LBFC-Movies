'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/auth-client';
import { collection, getDocs } from 'firebase/firestore';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/firebase/firestore/social';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from 'react-firebase-hooks/firestore';

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

  const handleFollowToggle = async (targetUserId: string) => {
    if (!currentUser || !firestore) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to follow users."
        });
        return;
    }

    const isFollowing = following.has(targetUserId);

    try {
        if (isFollowing) {
            await unfollowUser(firestore, currentUser.uid, targetUserId);
            toast({ title: "Unfollowed" });
        } else {
            await followUser(firestore, currentUser.uid, targetUserId);
            toast({ title: "Followed" });
        }
    } catch (error) {
        console.error("Failed to toggle follow state", error);
        toast({
            variant: "destructive",
            title: "Something went wrong",
            description: "Could not update your follow status. Please try again."
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <header className="space-y-2 mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">Discover Users</h1>
        <p className="text-muted-foreground">See who else is using the platform and check out their movie collection.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {users.map(user => (
          <Card key={user.uid} className="transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center gap-4">
                <Link href={`/profile/${user.uid}`} passHref>
                    <Avatar className="h-20 w-20 cursor-pointer">
                        <AvatarImage src={user.photoURL} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Link>
              <div className="overflow-hidden">
                <Link href={`/profile/${user.uid}`} passHref>
                    <p className="font-semibold truncate cursor-pointer hover:underline">{user.displayName}</p>
                </Link>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button
                variant={following.has(user.uid) ? 'secondary' : 'default'}
                onClick={() => handleFollowToggle(user.uid)}
                className="w-full"
              >
                {following.has(user.uid) ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                {following.has(user.uid) ? 'Following' : 'Follow'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
