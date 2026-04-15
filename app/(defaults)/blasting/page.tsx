'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import BlastingCalculation from '@/components/stone-mine/blasting/blasting-calculation';
import BlastingAdvanceManagement from '@/components/stone-mine/blasting/blasting-advance-management';
import BlastingExplosiveShop from '@/components/stone-mine/blasting/blasting-explosive-shop';

const BlastingPage = () => {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'blasting');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const tabs = [
        { key: 'blasting', label: '💣 Blasting Records', color: 'primary' },
        { key: 'advance', label: '💰 Advance', color: 'warning' },
        { key: 'explosive-shop', label: '🏪 Explosive Shop', color: 'danger' },
    ];


    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h5 className="font-semibold text-lg dark:text-white-light">Blasting Management</h5>
                    <p className="text-white-dark text-xs mt-1">Calculate blasting income based on tonnage and track all deductions</p>
                </div>
            </div>

            <div className="panel mb-5 p-0 overflow-hidden">
                <div className="flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`p-5 py-3 hover:text-primary transition-all font-semibold outline-none flex items-center gap-2 ${activeTab === tab.key ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-white-dark'}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {activeTab === 'blasting' && <BlastingCalculation />}
                    {activeTab === 'advance' && <BlastingAdvanceManagement />}
                    {activeTab === 'explosive-shop' && <BlastingExplosiveShop />}
                </div>

            </div>
        </div>
    );
};

export default BlastingPage;
