'use client';
import ExplosiveCostManagement from '@/components/stone-mine/explosive-cost-management';
import React from 'react';

const ExplosiveExpensePage = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline font-bold text-xs uppercase tracking-widest">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-xs uppercase tracking-widest"><span>Expenses</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 text-xs uppercase tracking-widest text-white-dark"><span>Explosive Usage Cost</span></li>
            </ul>
            <ExplosiveCostManagement />
        </div>
    );
};

export default ExplosiveExpensePage;
