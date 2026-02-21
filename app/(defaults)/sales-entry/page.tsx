import SalesForm from '@/components/stone-mine/sales-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Sales Entry - Stone Mine',
};

const SalesEntry = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <a href="/" className="text-primary hover:underline">
                        Dashboard
                    </a>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Sales Entry</span>
                </li>
            </ul>

            <div className="grid grid-cols-1 gap-6">
                <SalesForm />
            </div>
        </div>
    );
};

export default SalesEntry;
