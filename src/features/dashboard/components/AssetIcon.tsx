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

export const TYPE_COLORS: Record<string, string> = {
    stock: '#C96442',
    crypto: '#4A7C59',
    vehicle: '#6B6560',
    property: '#B5534A',
    cash: '#7A6A5E',
    other: '#38312A',
};

export const getAssetIcon = (asset: Partial<Asset>, size: number = 20, color?: string): React.ReactNode => {
    const name = (asset.name || '').toLowerCase();
    const ticker = (asset.ticker || '').toUpperCase();
    const type = asset.assetType;

    // Tech / Big Tech
    if (name.includes('apple') || ticker === 'AAPL') return <Apple size={size} color={color} />;
    if (name.includes('tesla') || ticker === 'TSLA') return <Car size={size} color={color} />;
    if (name.includes('amazon') || ticker === 'AMZN') return <ShoppingCart size={size} color={color} />;
    if (name.includes('microsoft') || ticker === 'MSFT') return <Monitor size={size} color={color} />;
    if (name.includes('meta') || name.includes('facebook') || ticker === 'META') return <Facebook size={size} color={color} />;
    if (name.includes('alphabet') || name.includes('google') || ticker === 'GOOGL' || ticker === 'GOOG') return <Search size={size} color={color} />;
    if (name.includes('netflix') || ticker === 'NFLX') return <Film size={size} color={color} />;
    if (name.includes('nvidia') || ticker === 'NVDA') return <Cpu size={size} color={color} />;
    if (name.includes('salesforce') || ticker === 'CRM') return <Cloud size={size} color={color} />;
    if (name.includes('adobe') || ticker === 'ADBE') return <Monitor size={size} color={color} />;
    if (name.includes('cisco') || ticker === 'CSCO') return <Globe size={size} color={color} />;
    if (name.includes('github')) return <Github size={size} color={color} />;
    if (name.includes('linkedin')) return <Linkedin size={size} color={color} />;
    if (name.includes('slack')) return <Slack size={size} color={color} />;
    if (name.includes('twitter') || name.includes('x corp')) return <Twitter size={size} color={color} />;

    // Banks & Finance
    if (name.includes('jpmorgan') || name.includes('chase') || ticker === 'JPM') return <Landmark size={size} color={color} />;
    if (name.includes('bank of america') || ticker === 'BAC' || name.includes('bank') || name.includes('citigroup') || ticker === 'C') return <Landmark size={size} color={color} />;
    if (name.includes('vanguard')) return <Sailboat size={size} color={color} />;
    if (name.includes('fidelity')) return <TrendingUp size={size} color={color} />;
    if (name.includes('sp500') || name.includes('s&p') || name.includes('index') || ticker === 'SPY' || ticker === 'VOO') return <LineChart size={size} color={color} />;
    if (name.includes('schwab') || ticker === 'SCHW') return <PieChart size={size} color={color} />;
    if (name.includes('visa') || ticker === 'V' || name.includes('mastercard') || ticker === 'MA') return <Banknote size={size} color={color} />;

    // Crypto
    if (name.includes('bitcoin') || ticker === 'BTC') return <Bitcoin size={size} color={color} />;
    if (name.includes('ethereum') || ticker === 'ETH') return <Hexagon size={size} color={color} />;

    // Retail & Consumer
    if (name.includes('walmart') || ticker === 'WMT' || name.includes('target') || ticker === 'TGT' || name.includes('costco') || ticker === 'COST') return <Store size={size} color={color} />;
    if (name.includes('nike') || ticker === 'NKE') return <Tag size={size} color={color} />;
    if (name.includes('coca-cola') || ticker === 'KO' || name.includes('pepsi') || ticker === 'PEP') return <Coffee size={size} color={color} />;
    if (name.includes('mcdonald') || ticker === 'MCD' || name.includes('starbucks') || ticker === 'SBUX') return <Utensils size={size} color={color} />;
    if (name.includes('disney') || ticker === 'DIS') return <Tv size={size} color={color} />;

    // Health
    if (name.includes('pfizer') || ticker === 'PFE' || name.includes('johnson') || ticker === 'JNJ' || name.includes('health') || name.includes('pharma') || name.includes('medical') || ticker === 'UNH') return <Activity size={size} color={color} />;

    // Energy / Industrial
    if (name.includes('exxon') || ticker === 'XOM' || name.includes('chevron') || ticker === 'CVX' || name.includes('energy') || name.includes('oil')) return <Flame size={size} color={color} />;
    if (name.includes('industrial') || name.includes('factory') || ticker === 'CAT' || name.includes('caterpillar')) return <Factory size={size} color={color} />;

    // Airlines / Travel
    if (name.includes('airlines') || name.includes('delta') || ticker === 'DAL' || ticker === 'BA' || name.includes('boeing') || name.includes('airbus') || ticker === 'UAL') return <Plane size={size} color={color} />;

    // Real Estate
    if (name.includes('realty') || ticker === 'O' || name.includes('property') || name.includes('real estate') || name.includes('housing')) return <Building size={size} color={color} />;

    // Default by type fallback
    switch (type) {
        case 'stock': return <LineChart size={size} color={color} />;
        case 'crypto': return <Coins size={size} color={color} />;
        case 'vehicle': return <Car size={size} color={color} />;
        case 'property': return <Home size={size} color={color} />;
        case 'cash': return <Wallet size={size} color={color} />;
        default: return <MoreHorizontal size={size} color={color} />;
    }
};

export const AssetIcon = ({ asset, size = 20 }: { asset: Partial<Asset>, size?: number }) => {
    const color = asset.assetType ? TYPE_COLORS[asset.assetType] : TYPE_COLORS.other;
    return <>{getAssetIcon(asset, size, color)}</>;
};
