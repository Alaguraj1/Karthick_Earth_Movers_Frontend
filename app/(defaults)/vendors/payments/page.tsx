import VendorPaymentManagement from '@/components/stone-mine/vendor/vendor-payment-management';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Vendor Payment History',
};

const VendorPaymentsPage = () => {
    return <VendorPaymentManagement />;
};

export default VendorPaymentsPage;
