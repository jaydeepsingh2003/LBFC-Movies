"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, MessageSquareText, User, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { aiChatbot } from "@/ai/flows/ai-chatbot";
import type { AIChatbotOutput } from "@/ai/flows/ai-chatbot";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export function AiChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setIsLoading(true);
        setTimeout(() => {
            setMessages([
                { id: "1", role: "bot", text: "Hello! I'm CINEVEXIA's AI assistant. How can I help you find a movie today?" }
            ]);
            setIsLoading(false);
        }, 1000);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        const result: AIChatbotOutput = await aiChatbot({ query: input });
        const botMessage: Message = { id: (Date.now() + 1).toString(), role: "bot", text: result.response };
        setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
        console.error("AI chatbot error:", error);
        const errorMessage: Message = { id: (Date.now() + 1).toString(), role: "bot", text: "Sorry, I'm having trouble connecting. Please try again later." };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (!isClient) {
    return null;
  }
  
  return (
    <>
      <Button
        className={cn(
          "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90",
          isMobile && "bottom-20"
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chatbot"
      >
        <MessageSquareText className="h-8 w-8 text-primary-foreground" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col p-0" side="right">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2 font-headline">
              <Bot className="text-primary" />
              AI Assistant
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'bot' && (
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        <p className="text-sm">{message.text}</p>
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && messages.length > 0 && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 bg-primary/20 text-primary">
                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-secondary flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a movie..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-accent hover:bg-accent/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
