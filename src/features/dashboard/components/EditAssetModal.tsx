import React from "react";
import { Sparkles, Trash2, ChevronDown } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Asset, AssetType } from "../../../types";

interface EditAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedAsset: Asset;
    onUpdateAsset: (updated: Asset) => void;
    onDeleteAsset: (id: string) => void;
    onAssetChange: (asset: Asset) => void;
    isDemo: boolean;
}

export const EditAssetModal = ({
    isOpen,
    onClose,
    selectedAsset,
    onUpdateAsset,
    onDeleteAsset,
    onAssetChange,
    isDemo
}: EditAssetModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Asset">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Asset Name</label>
                        <input
                            className="w-full bg-surface-2 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            value={selectedAsset.name}
                            onChange={(e) => onAssetChange({ ...selectedAsset, name: e.target.value })}
                            disabled={isDemo}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Type</label>
                        <div className="relative">
                            <select
                                className="appearance-none w-full bg-surface-2 border border-border rounded-xl p-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                                value={selectedAsset.assetType}
                                onChange={(e) => onAssetChange({ ...selectedAsset, assetType: e.target.value as AssetType })}
                                disabled={isDemo}
                            >
                                <option value="stock">Stock</option>
                                <option value="crypto">Crypto</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="property">Property</option>
                                <option value="cash">Cash</option>
                                <option value="other">Other</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-3" size={16} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Quantity</label>
                        <input
                            type="number"
                            className="w-full bg-surface-2 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            value={selectedAsset.quantity}
                            onChange={(e) => {
                                const q = parseFloat(e.target.value);
                                onAssetChange({ ...selectedAsset, quantity: q, totalValue: q * selectedAsset.unitPrice });
                            }}
                            disabled={isDemo}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Unit Price ({selectedAsset.unitPriceCurrency})</label>
                        <input
                            type="number"
                            className="w-full bg-surface-2 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            value={selectedAsset.unitPrice}
                            onChange={(e) => {
                                const p = parseFloat(e.target.value);
                                onAssetChange({ ...selectedAsset, unitPrice: p, totalValue: selectedAsset.quantity * p });
                            }}
                            disabled={isDemo}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Source (e.g. Robinhood, Binance)</label>
                    <input
                        className="w-full bg-surface-2 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                        value={selectedAsset.source || ""}
                        onChange={(e) => onAssetChange({ ...selectedAsset, source: e.target.value })}
                        placeholder="Where is this asset held?"
                        disabled={isDemo}
                    />
                </div>

                {selectedAsset.aiRationale && (
                    <div className="bg-accent-light/30 p-4 rounded-xl border border-accent/10 flex gap-3">
                        <Sparkles className="text-accent shrink-0" size={16} />
                        <p className="text-xs text-text-2 leading-relaxed">{selectedAsset.aiRationale}</p>
                    </div>
                )}

                {!isDemo ? (
                    <div className="pt-4 flex gap-3">
                        <Button variant="ghost" className="text-negative hover:bg-negative/5 px-4 py-2 rounded-xl" onClick={() => onDeleteAsset(selectedAsset.id)}>
                            <Trash2 size={18} />
                        </Button>
                        <Button variant="secondary" className="flex-1 py-3 rounded-xl" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className="flex-[2] py-3 rounded-xl" onClick={() => onUpdateAsset(selectedAsset)}>
                            Save Changes
                        </Button>
                    </div>
                ) : (
                    <p className="text-center text-sm text-text-3">Sign in to edit this asset.</p>
                )}
            </div>
        </Modal>
    );
};
