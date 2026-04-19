import QuarryLeaseManagement from '@/components/stone-mine/quarry-lease/QuarryLeaseManagement';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quarry Lease Settlement | Karthick Earth Movers',
};

const QuarryLeaseSettlementPage = () => {
    return <QuarryLeaseManagement />;
};

export default QuarryLeaseSettlementPage;
