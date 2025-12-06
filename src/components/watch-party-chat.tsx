
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/auth/auth-client';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { sendChatMessage, type ChatMessageData } from '@/firebase/firestore/watch-parties';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface WatchPartyChatProps {
    partyId: string;
}

interface ChatMessage extends ChatMessageData {
    id: string;
    createdAt: Timestamp;
}

export function WatchPartyChat({ partyId }: WatchPartyChatProps) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const messagesRef = useMemo(() => firestore ? collection(firestore, `watch-parties/${partyId}/messages`) : null, [firestore, partyId]);
    const messagesQuery = useMemo(() => messagesRef ? query(messagesRef, orderBy('createdAt', 'asc')) : null, [messagesRef]);
    const [messagesSnapshot, messagesLoading, messagesError] = useCollection(messagesQuery);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messagesSnapshot]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !message.trim()) return;

        setIsSending(true);
        try {
            await sendChatMessage(firestore, partyId, {
                userId: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL,
                text: message,
            });
            setMessage('');
        } catch (error) {
            console.error('Send chat error', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
                     {messagesLoading && <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>}
                     {messagesError && <p className="text-destructive text-center">Error loading messages.</p>}
                     {!messagesLoading && messagesSnapshot?.empty && <p className="text-muted-foreground text-center pt-16">No messages yet. Start the conversation!</p>}
                     
                     <div className="space-y-4">
                        {messagesSnapshot?.docs.map(doc => {
                            const msg = { id: doc.id, ...doc.data() } as ChatMessage;
                            const isCurrentUser = user?.uid === msg.userId;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                                    {!isCurrentUser && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.photoURL || undefined} />
                                            <AvatarFallback>{msg.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className="flex flex-col">
                                        <div className={`rounded-lg px-3 py-2 max-w-sm ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                            {!isCurrentUser && <p className="text-xs font-bold mb-1">{msg.displayName}</p>}
                                            <p className="text-sm">{msg.text}</p>
                                        </div>
                                        <p className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                                           {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : '...'}
                                        </p>
                                    </div>
                                    {isCurrentUser && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={msg.photoURL || undefined} />
                                            <AvatarFallback>{msg.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })}
                     </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
                {user ? (
                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                        <Input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={isSending}
                        />
                        <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                ) : (
                    <p className="text-sm text-muted-foreground text-center w-full">You must be logged in to chat.</p>
                )}
            </CardFooter>
        </Card>
    );
}

