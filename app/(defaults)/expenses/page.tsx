import ExpenseForm from '@/components/stone-mine/expense-form';
import ExpenseList from '@/components/stone-mine/expense-list';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Expense Management - Stone Mine',
};

const ExpenseManagement = () => {
    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <a href="/" className="text-primary hover:underline">
                        Dashboard
                    </a>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Expenses</span>
                </li>
            </ul>

            <div className="grid grid-cols-1 gap-6">
                <ExpenseForm />
                <ExpenseList />
            </div>
        </div>
    );
};

export default ExpenseManagement;
