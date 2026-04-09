// @adbouras
import { useState } from "react";
import ChatBox from "./ChatBox";
import ConversPanel from "./ConversPannel";
import { MessageCircle } from "lucide-react";
import type { Message } from "./MessageLayer";
import type { Conversation } from "./ConverLayer";

// --- Fake data for testing ---

const FAKE_CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        name: "Sarah Chen",
        avatar: "https://i.pravatar.cc/100?img=5",
        last: "Nice! Can you show me a demo later?",
        timestamp: "2:35 PM",
        unread: 2,
    },
    {
        id: 2,
        name: "Julian Martinez",
        avatar: "https://i.pravatar.cc/100?img=12",
        last: "The deployment looks good to me",
        timestamp: "1:20 PM",
        unread: 0,
    },
    {
        id: 3,
        name: "Project Team",
        avatar: "",
        last: "Alex: Let's sync tomorrow morning",
        timestamp: "Yesterday",
        unread: 5,
    },
    {
        id: 4,
        name: "Lina Park",
        avatar: "https://i.pravatar.cc/100?img=23",
        last: "Thanks for the review!",
        timestamp: "Yesterday",
        unread: 0,
    },
];

const FAKE_MESSAGES: Record<number, Message[]> = {
    1: [
        {
            id: 1,
            content: "Hey! How's the project going?",
            sender_id: 42,
            sender_name: "Sarah Chen",
            sender_avatar: "https://i.pravatar.cc/100?img=5",
            created_at: new Date(Date.now() - 60000 * 5).toISOString(),
            is_mine: false,
        },
        {
            id: 2,
            content: "Pretty good, just finished the chat components",
            sender_id: 1337,
            sender_name: "You",
            created_at: new Date(Date.now() - 60000 * 3).toISOString(),
            is_mine: true,
        },
        {
            id: 3,
            content: "Nice! Can you show me a demo later?",
            sender_id: 42,
            sender_name: "Sarah Chen",
            sender_avatar: "https://i.pravatar.cc/100?img=5",
            created_at: new Date(Date.now() - 60000).toISOString(),
            is_mine: false,
        },
    ],
    2: [
        {
            id: 10,
            content: "Hey Julian, can you check the staging deploy?",
            sender_id: 1337,
            sender_name: "You",
            created_at: new Date(Date.now() - 60000 * 30).toISOString(),
            is_mine: true,
        },
        {
            id: 11,
            content: "The deployment looks good to me",
            sender_id: 55,
            sender_name: "Julian Martinez",
            sender_avatar: "https://i.pravatar.cc/100?img=12",
            created_at: new Date(Date.now() - 60000 * 20).toISOString(),
            is_mine: false,
        },
    ],
    3: [
        {
            id: 20,
            content: "Sprint review is at 3pm today",
            sender_id: 88,
            sender_name: "Alex Rivera",
            created_at: new Date(Date.now() - 60000 * 120).toISOString(),
            is_mine: false,
        },
        {
            id: 21,
            content: "I'll prepare the demo",
            sender_id: 1337,
            sender_name: "You",
            created_at: new Date(Date.now() - 60000 * 100).toISOString(),
            is_mine: true,
        },
        {
            id: 22,
            content: "Let's sync tomorrow morning",
            sender_id: 88,
            sender_name: "Alex Rivera",
            created_at: new Date(Date.now() - 60000 * 60).toISOString(),
            is_mine: false,
        },
    ],
    4: [
        {
            id: 30,
            content: "I left some comments on your PR",
            sender_id: 99,
            sender_name: "Lina Park",
            sender_avatar: "https://i.pravatar.cc/100?img=23",
            created_at: new Date(Date.now() - 60000 * 90).toISOString(),
            is_mine: false,
        },
        {
            id: 31,
            content: "Fixed them all, take another look when you can",
            sender_id: 1337,
            sender_name: "You",
            created_at: new Date(Date.now() - 60000 * 80).toISOString(),
            is_mine: true,
        },
        {
            id: 32,
            content: "Thanks for the review!",
            sender_id: 99,
            sender_name: "Lina Park",
            sender_avatar: "https://i.pravatar.cc/100?img=23",
            created_at: new Date(Date.now() - 60000 * 70).toISOString(),
            is_mine: false,
        },
    ],
};

export default function Messages() {
    const [active_id, setActiveId] = useState<number | null>(null);
    const [all_messages, setAllMessages] = useState(FAKE_MESSAGES);

    const active_convers = FAKE_CONVERSATIONS.find((c) => c.id === active_id);
    const messages = active_id ? (all_messages[active_id] ?? []) : [];

    function handleSend(content: string) {
        if (!active_id) return;

        const new_msg: Message = {
            id: Date.now(),
            content,
            sender_id: 1337,
            sender_name: "You",
            created_at: new Date().toISOString(),
            is_mine: true,
        };

        setAllMessages((prev) => ({
            ...prev,
            [active_id]: [...(prev[active_id] ?? []), new_msg],
        }));
    }

    return (
        <div className="flex fixed inset-0 top-16">
            <ConversPanel
                conversations={FAKE_CONVERSATIONS}
                active_id={active_id}
                onSelect={setActiveId}
            />

            {active_convers ? (
                <ChatBox
                    convers_name={active_convers.name}
                    convers_avatar={active_convers.avatar ?? ""}
                    messages={messages}
                    onSendMessage={handleSend}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium">select a conversation</p>
                    </div>
                </div>
            )}
        </div>
    );
}
