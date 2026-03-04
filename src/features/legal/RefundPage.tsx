import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "../../layouts/Footer";

export const RefundPage = () => {
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
                <h1 className="font-serif text-4xl font-bold mb-3">Refund Policy</h1>
                <p className="text-sm text-text-3 mb-12">Last updated: March 2026</p>

                <div className="prose prose-sm max-w-none space-y-10 text-text-2 leading-relaxed">

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">Our Policy</h2>
                        <p>We want you to be satisfied with WealthVue. If you are not happy with your subscription, we offer a <strong className="text-text-1">14-day money-back guarantee</strong> from the date of your first payment.</p>
                        <p>To request a refund within this period, contact us at <a href="mailto:luke@lukeberetta.com" className="text-accent hover:underline">luke@lukeberetta.com</a> with your account email and reason for the request. We will process your refund within 5–10 business days.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">After the Refund Window</h2>
                        <p>Refunds are not available for subscription charges after the 14-day window has passed. You may cancel your subscription at any time to prevent future charges — your access will continue until the end of the current billing period.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">Cancellations</h2>
                        <p>You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing cycle and you will not be charged again.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">Payment Processing</h2>
                        <p>All payments are processed by Paddle, our merchant of record. Refunds are returned to the original payment method. Processing times may vary depending on your bank or card provider.</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="font-serif text-xl font-semibold text-text-1">Contact</h2>
                        <p>For refund requests or billing questions, email <a href="mailto:luke@lukeberetta.com" className="text-accent hover:underline">luke@lukeberetta.com</a>.</p>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
};
