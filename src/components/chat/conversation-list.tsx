"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Plus } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  context: string;
  level: string;
  created_at: string;
  message_count: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  conversations = [],
  currentConversation,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar conversas
  const filteredConversations = conversations?.filter((conversation) =>
    conversation?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  return (
    <Card className="w-80 h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2">Conversations</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Lista de Conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? "No conversations found" : "Start a new conversation"}
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant={currentConversation?.id === conversation.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectConversation(conversation)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <div className="flex-1 text-left">
                  <div className="font-medium truncate">
                    {conversation.title || "New Conversation"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(conversation.created_at)} • {conversation.message_count} messages
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>
    </Card>
  );
} 