import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "../../layouts/Footer";

export const PrivacyPage = () => {
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
                <h1 className="font-serif text-4xl font-bold mb-3">Privacy Policy</h1>
                <p className="text-sm text-text-3 mb-12">Last updated: March 2026</p>

                <div className="prose prose-sm max-w-none space-y-10 text-text-2 leading-relaxed">

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">1. Overview</h2>
                        <p>WealthVue ("we", "us", "our") respects your privacy. This policy explains what data we collect, how we use it, and your rights regarding that data.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">2. Data We Collect</h2>
                        <p><strong className="text-text-1">Account information:</strong> When you sign in with Google, we receive your name, email address, and profile photo from your Google account.</p>
                        <p><strong className="text-text-1">Portfolio data:</strong> Asset names, values, quantities, types, and any descriptions you enter. This data is stored in your private account and is never shared with other users.</p>
                        <p><strong className="text-text-1">Usage data:</strong> We collect basic analytics (page views, feature usage) via Firebase Analytics to help us improve the Service. This data is aggregated and not linked to your identity.</p>
                        <p><strong className="text-text-1">Payment data:</strong> Billing and payment information is handled entirely by Paddle. We do not store your credit card details.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">3. How We Use Your Data</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>To provide and personalise the Service</li>
                            <li>To process subscription payments via Paddle</li>
                            <li>To generate AI-assisted asset valuations (data sent to Google Gemini API)</li>
                            <li>To display your portfolio and net worth history</li>
                            <li>To communicate with you about your account or the Service</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">4. Third-Party Services</h2>
                        <p>We use the following third-party services to operate WealthVue:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong className="text-text-1">Firebase (Google)</strong> — authentication, database, and hosting</li>
                            <li><strong className="text-text-1">Google Gemini AI</strong> — AI-assisted asset parsing and valuation estimates</li>
                            <li><strong className="text-text-1">Paddle</strong> — subscription billing and payment processing</li>
                            <li><strong className="text-text-1">Frankfurter API</strong> — foreign exchange rate data (no personal data sent)</li>
                        </ul>
                        <p>Each of these services operates under their own privacy policies.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">5. Data Storage and Security</h2>
                        <p>Your data is stored in Google Firestore with security rules that restrict access strictly to your own account. We do not sell or share your personal data with third parties for marketing purposes.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">6. Data Retention and Deletion</h2>
                        <p>Your data is retained for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us at <a href="mailto:luke@lukeberetta.com" className="text-accent hover:underline">luke@lukeberetta.com</a>. We will process deletion requests within 30 days.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">7. Your Rights</h2>
                        <p>Depending on your location, you may have rights under GDPR, CCPA, or other applicable laws, including the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:luke@lukeberetta.com" className="text-accent hover:underline">luke@lukeberetta.com</a>.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">8. Changes to This Policy</h2>
                        <p>We may update this policy periodically. We will notify users of material changes. Continued use of the Service constitutes acceptance of the updated policy.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">9. Contact</h2>
                        <p>Questions about this Privacy Policy? Email us at <a href="mailto:luke@lukeberetta.com" className="text-accent hover:underline">luke@lukeberetta.com</a>.</p>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
};
