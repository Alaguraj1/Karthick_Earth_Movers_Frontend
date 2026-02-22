import DayBook from '@/components/stone-mine/reports/day-book';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Day Book - Stone Mine Reports',
};

const DayBookPage = () => {
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
                    <span>Day Book</span>
                </li>
            </ul>
            <DayBook />
        </div>
    );
};

export default DayBookPage;
