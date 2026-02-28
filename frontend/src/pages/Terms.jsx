import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Terms(){
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar/>
            <main className="flex-1 container mx-auto px-6 py-32 max-w-[800px]">
                <h1 className="font-['Inter'] text-4xl sm:text-5xl font-semibold mb-12 tracking-tight text-foreground">
                    Terms of Service
                </h1>

                <div className="font-['Inter'] text-muted-foreground text-[15px] leading-relaxed space-y-8">
                    <p className="mb-12">
                        Last updated: February 2026
                    </p>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using LeetConnect, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">2. Use License</h2>
                        <p>
                            <span className="underline decoration-muted-foreground/50 underline-offset-4">Permission is granted.</span> Permission is granted to temporarily use LeetConnect for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">3. User Conduct</h2>
                        <p>
                            You agree not to use the service to post or transmit any material which is or may be infringing on intellectual property rights of others, harassing, threatening, false, or misleading.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">4. Payment Obligations</h2>
                        <p className="mb-4">
                            <span className="underline decoration-muted-foreground/50 underline-offset-4">4.1. Fees.</span> Customer will pay for access to and use of the Service as set forth on the applicable Order ("Fees"). All Fees will be paid in the currency stated in the applicable Order or, if no currency is specified, U.S. dollars. Payment obligations are non-cancelable and, except as expressly stated in this Agreement, non-refundable. LeetConnect may modify its Fees or introduce new fees in its sole discretion.
                        </p>
                        <p className="mb-4">
                            <span className="underline decoration-muted-foreground/50 underline-offset-4">4.2. Payment.</span> LeetConnect, either directly or through its third-party payment processor ("Payment Processor") will charge Customer for the Fees via credit card or ACH payment. LeetConnect will have the right to charge Customer's credit card or ACH payment method for any services provided to Customer.
                        </p>
                        <p>
                            <span className="underline decoration-muted-foreground/50 underline-offset-4">4.3. Taxes.</span> Fees do not include any taxes, levies, duties or similar governmental assessments of any nature, including, for example, value-added, sales, use or withholding taxes. Customer is responsible for paying all Taxes associated with its purchases hereunder.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-foreground tracking-tight">5. Modifications</h2>
                        <p>
                            LeetConnect may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                        </p>
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
