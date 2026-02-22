import DriverPaymentManagement from '@/components/stone-mine/transport/driver-payment-management';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Driver Payments',
};

const DriverPaymentsPage = () => {
    return <DriverPaymentManagement />;
};

export default DriverPaymentsPage;
