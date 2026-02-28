'use client';
import React, { useState, useEffect } from 'react';
import IconSearch from '@/components/icon/icon-search';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const CashCreditSales = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'Cash' | 'Credit'>('all');
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });

    const fetchSales = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (activeTab !== 'all') params.paymentType = activeTab;
            const { data } = await axios.get(`${API}/sales`, { params });
            if (data.success) setSales(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const cashSales = sales.filter(s => s.paymentType === 'Cash');
    const creditSales = sales.filter(s => s.paymentType === 'Credit');
    const totalCash = cashSales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalCredit = creditSales.reduce((sum, s) => sum + s.grandTotal, 0);
    const totalCreditPaid = creditSales.reduce((sum, s) => sum + s.amountPaid, 0);
    const totalCreditPending = creditSales.reduce((sum, s) => sum + s.balanceAmount, 0);

    const displayedSales = activeTab === 'all' ? sales : sales.filter(s => s.paymentType === activeTab);

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold dark:text-white-light">பணம் / கடன் விற்பனை</h2>
                <p className="text-white-dark text-sm mt-1">Cash / Credit Sales — Track all payment types</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="panel bg-gradient-to-br from-success/20 to-success/5 border border-success/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase font-bold text-success tracking-wider">💵 Cash Sales</p>
                            <h3 className="text-2xl font-black text-success mt-2">₹{totalCash.toLocaleString()}</h3>
                            <p className="text-white-dark text-xs mt-1">{cashSales.length} transactions</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center text-2xl">💵</div>
                    </div>
                </div>
                <div className="panel bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase font-bold text-warning tracking-wider">📒 Credit Sales</p>
                            <h3 className="text-2xl font-black text-warning mt-2">₹{totalCredit.toLocaleString()}</h3>
                            <p className="text-white-dark text-xs mt-1">{creditSales.length} transactions</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center text-2xl">📒</div>
                    </div>
                </div>
                <div className="panel bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase font-bold text-primary tracking-wider">Collected (Credit)</p>
                            <h3 className="text-2xl font-black text-primary mt-2">₹{totalCreditPaid.toLocaleString()}</h3>
                            <p className="text-white-dark text-xs mt-1">Amount received</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-2xl">✅</div>
                    </div>
                </div>
                <div className="panel bg-gradient-to-br from-danger/20 to-danger/5 border border-danger/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase font-bold text-danger tracking-wider">Pending (Credit)</p>
                            <h3 className="text-2xl font-black text-danger mt-2">₹{totalCreditPending.toLocaleString()}</h3>
                            <p className="text-white-dark text-xs mt-1">Yet to collect</p>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-danger/20 flex items-center justify-center text-2xl">⏳</div>
                    </div>
                </div>
            </div>

            {/* Filters & Tabs */}
            <div className="panel mb-6">
                <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex gap-2">
                        <button className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`} onClick={() => setActiveTab('all')}>All</button>
                        <button className={`btn ${activeTab === 'Cash' ? 'btn-success' : 'btn-outline-success'} btn-sm`} onClick={() => setActiveTab('Cash')}>💵 Cash</button>
                        <button className={`btn ${activeTab === 'Credit' ? 'btn-warning' : 'btn-outline-warning'} btn-sm`} onClick={() => setActiveTab('Credit')}>📒 Credit</button>
                    </div>
                    <div className="flex-1"></div>
                    <div>
                        <input type="date" className="form-input w-40" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} />
                    </div>
                    <div>
                        <input type="date" className="form-input w-40" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={fetchSales}>
                        <IconSearch className="w-4 h-4 ltr:mr-1 rtl:ml-1" /> Filter
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="panel">
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Invoice #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th className="!text-center">Type</th>
                                <th className="!text-right">Grand Total</th>
                                <th className="!text-right">Paid</th>
                                <th className="!text-right">Balance</th>
                                <th className="!text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-8 text-white-dark">Loading...</td></tr>
                            ) : displayedSales.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-8 text-white-dark">No sales records found</td></tr>
                            ) : (
                                displayedSales.map((sale, idx) => (
                                    <tr key={sale._id}>
                                        <td>{idx + 1}</td>
                                        <td className="font-bold text-primary">{sale.invoiceNumber}</td>
                                        <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                                        <td className="font-semibold">{sale.customer?.name || '—'}</td>
                                        <td className="!text-center">
                                            <span className={`badge ${sale.paymentType === 'Cash' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                {sale.paymentType === 'Cash' ? '💵 Cash' : '📒 Credit'}
                                            </span>
                                        </td>
                                        <td className="!text-right font-bold">₹{sale.grandTotal?.toLocaleString()}</td>
                                        <td className="!text-right font-bold text-success">₹{sale.amountPaid?.toLocaleString()}</td>
                                        <td className="!text-right font-bold text-danger">
                                            {sale.balanceAmount > 0 ? `₹${sale.balanceAmount?.toLocaleString()}` : '—'}
                                        </td>
                                        <td className="!text-center">
                                            <span className={`badge ${sale.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : sale.paymentStatus === 'Partial' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                                                {sale.paymentStatus}
                                            </span>
                                        </td>
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

export default CashCreditSales;
