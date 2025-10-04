import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Bell, AlertTriangle, IndianRupee, Megaphone, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";

// --- Mock Data ---
const mockInboxMessages = [
  { id: 1, type: 'Overdue Reminder', text: "Progress report for 'Alwar Road Widening' is overdue by 5 days.", date: '1 day ago', read: false, link: '/agency/projects/PROJ008', icon: AlertTriangle, color: 'text-destructive' },
  { id: 2, type: 'Funds Disbursed', text: "₹50L has been disbursed for 'Jaipur Adarsh Gram'.", date: '3 days ago', read: false, link: '/agency/funds', icon: IndianRupee, color: 'text-green-600' },
  { id: 3, type: 'General Notice', text: 'Please note the upcoming holiday schedule for the next month.', date: '1 week ago', read: true, link: '#', icon: Megaphone, color: 'text-primary' },
  { id: 4, type: 'Progress Approved', text: "Your latest update for 'Ajmer Hostel Upgrade' has been approved.", date: '2 weeks ago', read: true, link: '/agency/projects/PROJ004', icon: Bell, color: 'text-muted-foreground' },
];

export default function AgencyInbox() {
  const navigate = useNavigate();
  const unreadCount = mockInboxMessages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex items-center gap-4">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Inbox</h1>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>

        {/* All Messages Tab */}
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-2">
                {mockInboxMessages.map((msg, index) => (
                  <MessageItem key={msg.id} message={msg} isLast={index === mockInboxMessages.length - 1} navigate={navigate} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unread Messages Tab */}
        <TabsContent value="unread">
          <Card>
            <CardContent className="p-0">
                {unreadCount > 0 ? (
                    <div className="space-y-2">
                        {mockInboxMessages.filter(m => !m.read).map((msg, index, arr) => (
                            <MessageItem key={msg.id} message={msg} isLast={index === arr.length - 1} navigate={navigate} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">No unread messages.</div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Helper component for a single message item ---
const MessageItem = ({ message, isLast, navigate }) => {
    return (
        <div>
            <div 
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(message.link)}
            >
                {!message.read && <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary"></div>}
                <message.icon className={cn("h-6 w-6 flex-shrink-0", message.read ? 'text-muted-foreground' : message.color)} />
                <div className="flex-grow">
                    <p className={cn("font-semibold text-sm", message.read && 'text-muted-foreground')}>{message.type}</p>
                    <p className={cn("text-sm", message.read ? 'text-muted-foreground' : 'text-foreground')}>{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{message.date}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
            {!isLast && <Separator />}
        </div>
    );
};