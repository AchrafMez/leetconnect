import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { NotifProvider } from '../context/NotifProvider';

export default function Layout() {
    return (
        <NotifProvider>
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto max-w-5xl px-6 pt-20 pb-10">
                    <Outlet />
                </main>
            </div>
        </NotifProvider>
    );
}
