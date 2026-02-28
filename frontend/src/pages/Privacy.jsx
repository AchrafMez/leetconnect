import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Privacy(){
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar/>
            <main className="flex-1 container mx-auto px-6 py-32 max-w-[800px]">
                <h1 className="font-['Inter'] text-4xl sm:text-5xl font-semibold mb-12 tracking-tight text-foreground">
                    Privacy Policy
                </h1>

                <div className="font-['Inter'] text-muted-foreground text-[15px] leading-relaxed space-y-8">
                    <p className="mb-12">
                        Last updated: February 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when you create an account, update your profile, use our interactive features, or communicate with us. The types of information we may collect include your name, email address, postal address, phone number, and any other information you choose to provide.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, develop new ones, and protect LeetConnect and our users. We may also use the information to communicate with you, such as sending you updates, security alerts, and support messages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">3. Information Sharing</h2>
                        <p>
                            We do not share your personal information with companies, organizations, or individuals outside of LeetConnect except in the following cases: with your consent, for external processing, or for legal reasons.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">4. Data Security</h2>
                        <p>
                            We work hard to protect LeetConnect and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We use industry-standard security measures to protect your data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@leetconnect.com.
                        </p>
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
