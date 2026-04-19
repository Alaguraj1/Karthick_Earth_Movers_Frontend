import QuarryLeaseExpenses from '@/components/stone-mine/quarry-lease/QuarryLeaseExpenses';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quarry Lease Expenses | Karthick Earth Movers',
};

const QuarryLeaseExpensesPage = () => {
    return <QuarryLeaseExpenses />;
};

export default QuarryLeaseExpensesPage;
