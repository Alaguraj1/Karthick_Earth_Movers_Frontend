import TripProfitability from '@/components/stone-mine/transport/trip-profitability';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Trip Profitability',
};

const ProfitabilityPage = () => {
    return <TripProfitability />;
};

export default ProfitabilityPage;
