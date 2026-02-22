import VendorOutstandingManagement from '@/components/stone-mine/vendor/vendor-outstanding-management';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Outstanding Balances',
};

const VendorOutstandingPage = () => {
    return <VendorOutstandingManagement />;
};

export default VendorOutstandingPage;
