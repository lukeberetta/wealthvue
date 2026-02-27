import React from "react";
import { X, CreditCard, Trash2, LogOut } from "lucide-react";
import { User } from "../../types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface SettingsViewProps {
    user: User | null;
    onSignOut: () => void;
    onBack: () => void;
}

export const SettingsView = ({ user, onSignOut, onBack }: SettingsViewProps) => {
    return (
        <div className="max-w-3xl mx-auto w-full py-8 space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-nav rounded-lg transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-3xl font-medium">Settings</h2>
            </div>

            <section className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Profile</h3>
                <Card className="space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={user?.photoURL} className="w-16 h-16 rounded-full border border-border" alt="Avatar" />
                        <div>
                            <p className="text-lg font-medium">{user?.displayName}</p>
                            <p className="text-text-secondary">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-text-secondary">Display Name</label>
                            <input className="w-full bg-nav border border-border rounded p-2 text-sm" defaultValue={user?.displayName} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-text-secondary">Default Currency</label>
                            <select className="w-full bg-nav border border-border rounded p-2 text-sm" defaultValue={user?.defaultCurrency}>
                                <option value="USD">USD - US Dollar</option>
                                <option value="ZAR">ZAR - SA Rand</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Plan & Billing</h3>
                <Card className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <p className="font-medium capitalize">{user?.plan} Plan</p>
                            <p className="text-xs text-text-secondary">Your trial ends in 18 days.</p>
                        </div>
                    </div>
                    <Button variant="secondary">Upgrade to Pro</Button>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Danger Zone</h3>
                <Card className="border-negative/20 bg-negative/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-negative">Delete Account</p>
                            <p className="text-xs text-text-secondary">Permanently remove all your data and assets.</p>
                        </div>
                        <Button variant="ghost" className="text-negative hover:bg-negative/10 flex items-center gap-2">
                            <Trash2 size={18} />
                            Delete
                        </Button>
                    </div>
                </Card>
            </section>

            <div className="pt-8 flex justify-center">
                <Button variant="ghost" onClick={onSignOut} className="text-text-secondary flex items-center gap-2">
                    <LogOut size={18} />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};
