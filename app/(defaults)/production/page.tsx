import ProductionForm from '@/components/stone-mine/production-form';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Production - Stone Mine',
};

const ProductionPage = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <a href="/" className="text-primary hover:underline">
                        Dashboard
                    </a>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Production</span>
                </li>
            </ul>

            <div className="grid grid-cols-1 gap-6">
                <ProductionForm />
            </div>
        </div>
    );
};

export default ProductionPage;
