import React from 'react';
import {
    Coins, Car, Home, Wallet, MoreHorizontal,
    Apple,
    Facebook,
    Twitter,
    Youtube,
    Github,
    Linkedin,
    Slack,
    Trello,
    ShoppingCart,
    Monitor,
    Plane,
    Building,
    Flame,
    Zap,
    HeartPulse,
    Activity,
    Utensils,
    Coffee,
    Pizza,
    Gamepad,
    Music,
    Film,
    Tv,
    Search,
    Globe,
    Cloud,
    Terminal,
    Cpu,
    Smartphone,
    Laptop,
    Banknote,
    Landmark,
    TrendingUp,
    LineChart,
    PieChart,
    BarChart,
    Sailboat,
    Bitcoin,
    Hexagon,
    Package,
    Store,
    Tag,
    Factory,
    Wrench,
    Cross
} from "lucide-react";
import { Asset } from "../../../types";

export const getAssetIcon = (asset: Partial<Asset>, size: number = 20): React.ReactNode => {
    const name = (asset.name || '').toLowerCase();
    const ticker = (asset.ticker || '').toUpperCase();
    const type = asset.assetType;

    // Tech / Big Tech
    if (name.includes('apple') || ticker === 'AAPL') return <Apple size={size} />;
    if (name.includes('tesla') || ticker === 'TSLA') return <Car size={size} />;
    if (name.includes('amazon') || ticker === 'AMZN') return <ShoppingCart size={size} />;
    if (name.includes('microsoft') || ticker === 'MSFT') return <Monitor size={size} />;
    if (name.includes('meta') || name.includes('facebook') || ticker === 'META') return <Facebook size={size} />;
    if (name.includes('alphabet') || name.includes('google') || ticker === 'GOOGL' || ticker === 'GOOG') return <Search size={size} />;
    if (name.includes('netflix') || ticker === 'NFLX') return <Film size={size} />;
    if (name.includes('nvidia') || ticker === 'NVDA') return <Cpu size={size} />;
    if (name.includes('salesforce') || ticker === 'CRM') return <Cloud size={size} />;
    if (name.includes('adobe') || ticker === 'ADBE') return <Monitor size={size} />;
    if (name.includes('cisco') || ticker === 'CSCO') return <Globe size={size} />;
    if (name.includes('github')) return <Github size={size} />;
    if (name.includes('linkedin')) return <Linkedin size={size} />;
    if (name.includes('slack')) return <Slack size={size} />;
    if (name.includes('twitter') || name.includes('x corp')) return <Twitter size={size} />;

    // Banks & Finance
    if (name.includes('jpmorgan') || name.includes('chase') || ticker === 'JPM') return <Landmark size={size} />;
    if (name.includes('bank of america') || ticker === 'BAC' || name.includes('bank') || name.includes('citigroup') || ticker === 'C') return <Landmark size={size} />;
    if (name.includes('vanguard')) return <Sailboat size={size} />;
    if (name.includes('fidelity')) return <TrendingUp size={size} />;
    if (name.includes('sp500') || name.includes('s&p') || name.includes('index') || ticker === 'SPY' || ticker === 'VOO') return <LineChart size={size} />;
    if (name.includes('schwab') || ticker === 'SCHW') return <PieChart size={size} />;
    if (name.includes('visa') || ticker === 'V' || name.includes('mastercard') || ticker === 'MA') return <Banknote size={size} />;

    // Crypto
    if (name.includes('bitcoin') || ticker === 'BTC') return <Bitcoin size={size} />;
    if (name.includes('ethereum') || ticker === 'ETH') return <Hexagon size={size} />;

    // Retail & Consumer
    if (name.includes('walmart') || ticker === 'WMT' || name.includes('target') || ticker === 'TGT' || name.includes('costco') || ticker === 'COST') return <Store size={size} />;
    if (name.includes('nike') || ticker === 'NKE') return <Tag size={size} />;
    if (name.includes('coca-cola') || ticker === 'KO' || name.includes('pepsi') || ticker === 'PEP') return <Coffee size={size} />;
    if (name.includes('mcdonald') || ticker === 'MCD' || name.includes('starbucks') || ticker === 'SBUX') return <Utensils size={size} />;
    if (name.includes('disney') || ticker === 'DIS') return <Tv size={size} />;

    // Health
    if (name.includes('pfizer') || ticker === 'PFE' || name.includes('johnson') || ticker === 'JNJ' || name.includes('health') || name.includes('pharma') || name.includes('medical') || ticker === 'UNH') return <Activity size={size} />;

    // Energy / Industrial
    if (name.includes('exxon') || ticker === 'XOM' || name.includes('chevron') || ticker === 'CVX' || name.includes('energy') || name.includes('oil')) return <Flame size={size} />;
    if (name.includes('industrial') || name.includes('factory') || ticker === 'CAT' || name.includes('caterpillar')) return <Factory size={size} />;

    // Airlines / Travel
    if (name.includes('airlines') || name.includes('delta') || ticker === 'DAL' || ticker === 'BA' || name.includes('boeing') || name.includes('airbus') || ticker === 'UAL') return <Plane size={size} />;

    // Real Estate
    if (name.includes('realty') || ticker === 'O' || name.includes('property') || name.includes('real estate') || name.includes('housing')) return <Building size={size} />;

    // Default by type fallback
    switch (type) {
        case 'stock': return <LineChart size={size} />;
        case 'crypto': return <Coins size={size} />;
        case 'vehicle': return <Car size={size} />;
        case 'property': return <Home size={size} />;
        case 'cash': return <Wallet size={size} />;
        default: return <MoreHorizontal size={size} />;
    }
};

export const AssetIcon = ({ asset, size = 20 }: { asset: Partial<Asset>, size?: number }) => {
    return <>{getAssetIcon(asset, size)}</>;
};
