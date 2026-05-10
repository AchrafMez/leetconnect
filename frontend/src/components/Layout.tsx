import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { NotifProvider } from '../context/NotifProvider';
import { PresenceProvider } from '../context/PresenceProvider';
import FreelancerSetupModal from './market/FreelancerSetupModal';

export default function Layout() {
    return (
        <PresenceProvider>
            <NotifProvider>
                <div className="min-h-screen bg-background">
                    <Navbar />
                    <div className="flex justify-center w-full">
                        <main className="container mx-auto w-full max-w-7xl px-6 pt-24 pb-10">
                            <Outlet />
                        </main>
                    </div>
                    <FreelancerSetupModal />
                </div>
            </NotifProvider>
        </PresenceProvider>
    );
}
