import ExplosiveSupplierManagement from '@/components/stone-mine/vendor/explosive-supplier-management';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Explosive Suppliers',
};

const ExplosiveSuppliersPage = () => {
    return <ExplosiveSupplierManagement />;
};

export default ExplosiveSuppliersPage;
