import LabourForm from '@/components/stone-mine/labour-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Labour Management - Stone Mine',
};

const LabourPage = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <a href="/" className="text-primary hover:underline">
                        Dashboard
                    </a>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Labour</span>
                </li>
            </ul>

            <div className="grid grid-cols-1 gap-6">
                <LabourForm />
            </div>
        </div>
    );
};

export default LabourPage;
