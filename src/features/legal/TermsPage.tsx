import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "../../layouts/Footer";

export const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg text-text-1 flex flex-col">
            <header className="border-b border-border">
                <div className="max-w-[760px] mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-sm text-text-3 hover:text-text-1 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to WealthVue
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-[760px] mx-auto px-6 py-16 w-full">
                <h1 className="font-serif text-4xl font-bold mb-3">Terms of Service</h1>
                <p className="text-sm text-text-3 mb-12">Last updated: March 2026</p>

                <div className="prose prose-sm max-w-none space-y-10 text-text-2 leading-relaxed">

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">1. Acceptance of Terms</h2>
                        <p>By accessing or using WealthVue ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">2. Description of Service</h2>
                        <p>WealthVue is a personal net worth tracking application that allows users to record and monitor their financial assets, including stocks, cryptocurrency, property, vehicles, and cash holdings. The Service provides AI-assisted asset entry and valuation estimates for informational purposes only.</p>
                        <p><strong className="text-text-1">WealthVue is not a financial advisor.</strong> Nothing on this platform constitutes financial, investment, tax, or legal advice. You are solely responsible for your financial decisions.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">3. Accounts</h2>
                        <p>You must sign in using a valid Google account. You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it. You must be at least 18 years old to use the Service.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">4. Subscription and Billing</h2>
                        <p>WealthVue offers paid subscription plans. Payments are processed securely by Paddle, our authorised merchant of record. By subscribing, you agree to Paddle's terms and conditions in addition to these Terms.</p>
                        <p>Subscriptions automatically renew until cancelled. You may cancel at any time through your account settings. Please review our <a href="/refund" className="text-accent hover:underline">Refund Policy</a> for details on refunds.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">5. Acceptable Use</h2>
                        <p>You agree not to misuse the Service. Prohibited activities include, but are not limited to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Attempting to gain unauthorised access to any part of the Service</li>
                            <li>Using the Service for any unlawful purpose</li>
                            <li>Submitting false, misleading, or harmful content</li>
                            <li>Reverse engineering or attempting to extract source code</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">6. Data and Privacy</h2>
                        <p>Your use of the Service is also governed by our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">7. Disclaimer of Warranties</h2>
                        <p>The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that asset valuations or AI-generated estimates are accurate or up to date. Market data and AI outputs may be delayed, incomplete, or incorrect.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">8. Limitation of Liability</h2>
                        <p>To the fullest extent permitted by law, WealthVue and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including any financial losses you may incur.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">9. Changes to Terms</h2>
                        <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms. We will endeavour to notify users of material changes.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">10. Contact</h2>
                        <p>For questions about these Terms, please contact us at <a href="mailto:hello@lukeberetta.com" className="text-accent hover:underline">hello@lukeberetta.com</a>.</p>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
};
