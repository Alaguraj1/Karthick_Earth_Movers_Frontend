import SummaryReports from '@/components/stone-mine/reports/summary-reports';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Monthly/Yearly Summary - Stone Mine Reports',
};

const SummaryPage = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <a href="/" className="text-primary hover:underline">
                        Dashboard
                    </a>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Accounts & Reports</span>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Summary</span>
                </li>
            </ul>
            <SummaryReports />
        </div>
    );
};

export default SummaryPage;
