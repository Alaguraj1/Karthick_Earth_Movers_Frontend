import DieselTripManagement from '@/components/stone-mine/transport/diesel-trip-management';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Diesel per Trip',
};

const DieselTripPage = () => {
    return <DieselTripManagement />;
};

export default DieselTripPage;
