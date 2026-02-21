'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import axios from 'axios';
import Link from 'next/link';

const AssetRegistry = () => {
    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`);
            if (data.success) setAssets(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    return (
        <div className="space-y-6">
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><Link href="/" className="text-primary hover:underline font-bold">Dashboard</Link></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Machine & Vehicle</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2 font-bold text-white-dark uppercase tracking-widest text-[10px]"><span>Registry</span></li>
            </ul>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h5 className="text-2xl font-black text-black dark:text-white-light uppercase tracking-tight">Asset Inventory Registry</h5>
                    <p className="text-white-dark text-sm font-bold mt-1">Manage JCBs, Crushers, Driller, and Lorry Fleet</p>
                </div>
                <Link href="/masters" className="btn btn-primary shadow-[0_10px_20px_rgba(67,97,238,0.3)] rounded-xl py-3 px-8 font-black uppercase tracking-widest text-xs">
                    <IconPlus className="mr-2" /> Configure Assets
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="panel h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
                    ))
                ) : assets.length === 0 ? (
                    <div className="col-span-full panel py-20 text-center uppercase font-black tracking-[0.2em] opacity-20 text-xl">No Assets Registered</div>
                ) : (
                    assets.map((asset) => (
                        <div key={asset._id} className="relative group">
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${asset.type === 'Machine' ? 'from-warning to-orange-600' : 'from-info to-blue-600'} rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-500`}></div>
                            <div className="relative panel p-6 rounded-2xl bg-white dark:bg-black border-none shadow-xl transform group-hover:-translate-y-1 transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${asset.type === 'Machine' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'}`}>
                                        <span className="font-black text-[10px] uppercase tracking-widest">{asset.type}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <Link href="/masters" className="p-1.5 bg-gray-100 dark:bg-dark-light/10 rounded-lg hover:text-primary transition-colors">
                                            <IconEdit className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                <h6 className="text-xl font-black text-black dark:text-white-light mb-1 line-clamp-1">{asset.name}</h6>
                                <p className="text-xs font-bold text-white-dark uppercase tracking-widest mb-4">
                                    {asset.registrationNumber || asset.vehicleNumber || 'No Plate'}
                                </p>

                                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white-light/5">
                                    {asset.type === 'Machine' ? (
                                        <>
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-white-dark">Operator</span>
                                                <span className="text-black dark:text-white-light">{asset.operatorName || 'Not Assigned'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-white-dark">Condition</span>
                                                <span className={`${asset.currentCondition === 'Excellent' ? 'text-success' : 'text-warning'}`}>{asset.currentCondition || 'Unknown'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-white-dark">Driver</span>
                                                <span className="text-black dark:text-white-light">{asset.driverName || 'Not Assigned'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-white-dark">Owner</span>
                                                <span className="text-black dark:text-white-light">{asset.ownerName || '-'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AssetRegistry;
