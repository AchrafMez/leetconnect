import Navbar from "@/components/Navbar";
import { Intro } from '@/components/Intro';
import { Features } from '@/components/Features';
import { Howitwork } from '@/components/Howitwork';
import { Footer } from '@/components/Footer';
    
export default function Landing(){
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar/>
            <main className="flex-1">
                <Intro/>
                <Features/>
                <Howitwork/>
            </main>
            <Footer/>
        </div>
    );
}
