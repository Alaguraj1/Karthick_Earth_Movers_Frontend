'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IconSearch from '@/components/icon/icon-search';
import IconTrendingDown from '@/components/icon/icon-trending-down';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

const VendorOutstandingManagement = () => {
    const [outstanding, setOutstanding] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/vendors/outstanding`);
            if (res.data.success) {
                const balData = res.data.data;
                const [expRes, labRes, transRes] = await Promise.all([
                    axios.get(`${API}/vendors/explosive`),
                    axios.get(`${API}/vendors/labour`),
                    axios.get(`${API}/vendors/transport`)
                ]);

                const combined = balData.map((b: any) => {
                    let master: any = null;
                    if (b.vendorType === 'ExplosiveSupplier') master = expRes.data.data.find((v: any) => v._id === b.vendorId);
                    else if (b.vendorType === 'LabourContractor') master = labRes.data.data.find((v: any) => v._id === b.vendorId);
                    else if (b.vendorType === 'TransportVendor') master = transRes.data.data.find((v: any) => v._id === b.vendorId);

                    if (master) {
                        let potentialCost = 0;
                        if (b.vendorType === 'TransportVendor') {
                            potentialCost = master.vehicles?.reduce((acc: number, veh: any) => acc + (Number(veh.ratePerTrip || 0) + Number(veh.padiKasu || 0)), 0) || 0;
                        } else if (b.vendorType === 'LabourContractor') {
                            potentialCost = master.contracts?.reduce((acc: number, c: any) => acc + (Number(c.agreedRate || 0) * Number(c.labourCount || 0)), 0) || 0;
                        }

                        const netInvoice = (b.totalInvoice || 0) + potentialCost + (master.outstandingBalance || 0);
                        const netPaid = (b.totalPaid || 0) + (master.advancePaid || 0);

                        return {
                            ...b,
                            totalInvoice: netInvoice,
                            totalPaid: netPaid,
                            balance: netInvoice - netPaid
                        };
                    }
                    return b;
                });

                setOutstanding(combined);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredOutstanding = outstanding.filter((v) =>
        v.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vendorType?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPayable = filteredOutstanding.reduce((acc, curr) => acc + curr.balance, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">Outstanding Balance (பாக்கி தொகை)</h2>
                    <p className="text-white-dark text-sm">Payable Management: Total Invoice – Total Paid = Balance</p>
                </div>
                <div>
                    <Link href="/vendors/payments" className="btn btn-primary shadow-lg">
                        <span>💳</span> Make Payment
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="panel bg-gradient-to-r from-danger to-red-600 border-none">
                    <div className="flex justify-between">
                        <div className="text-lg font-bold text-white">Total Outstanding</div>
                    </div>
                    <div className="flex items-center mt-5">
                        <div className="text-3xl font-black text-white">₹{totalPayable.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center text-white/70 text-sm mt-5">
                        <IconTrendingDown className="w-4 h-4 mr-1" />
                        <span>{searchQuery ? 'Filtered results' : 'Amount to be paid to vendors'}</span>
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-bold text-lg dark:text-white-light">Vendor-wise Payable List</h5>
                    <div className="relative w-full max-w-xs">
                        <input
                            type="text"
                            placeholder="Search vendor..."
                            className="form-input ltr:pr-11 rtl:pl-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IconSearch className="w-5 h-5 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Vendor Name</th>
                                <th>Category</th>
                                <th className="!text-right">Total Invoice (A)</th>
                                <th className="!text-right">Total Paid (B)</th>
                                <th className="!text-right bg-danger/5 text-danger font-black">Balance (A - B)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-8">Calculating balances...</td></tr>
                            ) : filteredOutstanding.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8">No matching records found.</td></tr>
                            ) : (
                                filteredOutstanding.map((v, index) => (
                                    <tr key={index}>
                                        <td className="font-bold">{v.vendorName || 'Unknown Vendor'}</td>
                                        <td>
                                            <span className={`badge ${v.vendorType === 'ExplosiveSupplier' ? 'badge-outline-danger' :
                                                v.vendorType === 'LabourContractor' ? 'badge-outline-warning' : 'badge-outline-info'}`}>
                                                {v.vendorType.replace('Supplier', '').replace('Contractor', '').replace('Vendor', '')}
                                            </span>
                                        </td>
                                        <td className="!text-right">₹{v.totalInvoice?.toLocaleString()}</td>
                                        <td className="!text-right text-success font-bold">₹{v.totalPaid?.toLocaleString()}</td>
                                        <td className="!text-right font-black text-danger bg-danger/5">₹{v.balance?.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorOutstandingManagement;
