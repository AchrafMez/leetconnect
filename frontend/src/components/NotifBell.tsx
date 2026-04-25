import { useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotifProvider';
import NotifCenter from './NotifCenter';

export default function NotifBell() {
    const context = useNotifications();
    const [open, setOpen] = useState(false);
    const wrapper_ref = useRef<HTMLDivElement>(null);

    if (!context)
        return null;

    const {unread} = context;

    return (
        <div ref={wrapper_ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-6 h-4 px-1
                                     rounded-full bg-primary hover:bg-primary text-foreground
                                     text-[10px] font-semibold leading-none
                                     flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
            {open && <NotifCenter onClose={() => setOpen(false)} wrapperRef={wrapper_ref} />}
        </div>
    );
}
