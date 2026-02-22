import LabourContractorManagement from '@/components/stone-mine/vendor/labour-contractor-management';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Labour Contractors',
};

const LabourContractorsPage = () => {
    return <LabourContractorManagement />;
};

export default LabourContractorsPage;
