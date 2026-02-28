'use client';
import React, { useState, useEffect } from 'react';
import IconSearch from '@/components/icon/icon-search';
import IconPrinter from '@/components/icon/icon-printer';
import IconX from '@/components/icon/icon-x';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const InvoiceGeneration = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });

    const fetchSales = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
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
    }, []);

    const viewInvoice = async (id: string) => {
        try {
            const { data } = await axios.get(`${API}/sales/${id}`);
            if (data.success) {
                setSelectedSale(data.data);
                setShowInvoice(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print-area');
        if (!printContent) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice ${selectedSale?.invoiceNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; }
                    @media print { body { padding: 15px; } }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white-light">பில் உருவாக்குதல்</h2>
                    <p className="text-white-dark text-sm mt-1">Invoice Generation — View and print invoices</p>
                </div>
            </div>

            {/* Invoice Detail View */}
            {showInvoice && selectedSale ? (
                <div>
                    {/* Action Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <button className="btn btn-outline-danger" onClick={() => setShowInvoice(false)}>
                            <IconX className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> Back to List
                        </button>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <IconPrinter className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> Print / Download PDF
                        </button>
                    </div>

                    <div id="invoice-print-area" className="panel">
                        {/* ===== TOP HEADER: Company Logo + Address ===== */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#4361ee', margin: 0 }}>INVOICE</h1>
                                <p style={{ fontSize: '13px', color: '#555', marginTop: '4px', fontWeight: 'bold' }}>invoice no: {selectedSale.invoiceNumber}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>Karthick Earth Movers</p>
                                <p style={{ fontSize: '12px', color: '#888' }}>Stone Quarry & Crusher Unit</p>
                                <p style={{ fontSize: '12px', color: '#888' }}>Tamil Nadu, India</p>
                                <p style={{ fontSize: '12px', color: '#888' }}>karthickearthmovers@gmail.com</p>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e0e6ed', margin: '15px 0 25px 0' }} />

                        {/* ===== DETAIL SECTION: Issue For | Invoice Info | Bank Info ===== */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as any, gap: '20px', marginBottom: '30px' }}>
                            {/* Issue For */}
                            <div style={{ flex: '1', minWidth: '250px' }}>
                                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '1px', marginBottom: '8px' }}>Issue For:</p>
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>customer name :</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>{selectedSale.customer?.name || '—'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>address:</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right', whiteSpace: 'normal', maxWidth: '150px' }}>{selectedSale.customer?.address || '—'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>phone number:</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>{selectedSale.customer?.phone || '—'}</td>
                                        </tr>
                                        {selectedSale.customer?.gstNumber && (
                                            <tr>
                                                <td style={{ padding: '4px 0', color: '#888' }}>GST:</td>
                                                <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right', color: '#4361ee' }}>{selectedSale.customer.gstNumber}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Invoice Details */}
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>Issue Date :</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>{new Date(selectedSale.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>Payment Type :</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>{selectedSale.paymentType}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>Status :</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right', color: selectedSale.paymentStatus === 'Paid' ? '#00ab55' : selectedSale.paymentStatus === 'Partial' ? '#e2a03f' : '#e7515a' }}>{selectedSale.paymentStatus}</td>
                                        </tr>
                                        {selectedSale.dueDate && (
                                            <tr>
                                                <td style={{ padding: '4px 0', color: '#888' }}>Due Date :</td>
                                                <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>{new Date(selectedSale.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bank / Payment Info */}
                            <div style={{ flex: '1', minWidth: '200px' }}>
                                <table style={{ width: '100%', fontSize: '13px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>Bank Name:</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>Indian Bank</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>Account Number:</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>—</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>IFSC Code:</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>—</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '4px 0', color: '#888' }}>Country:</td>
                                            <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right' }}>India</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e0e6ed', margin: '0 0 20px 0' }} />

                        {/* ===== ITEMS TABLE ===== */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px' }}>
                            <thead>
                                <tr>
                                    <th style={{ background: '#4361ee', color: 'white', padding: '12px 15px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.No</th>
                                    <th style={{ background: '#4361ee', color: 'white', padding: '12px 15px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item Description</th>
                                    <th style={{ background: '#4361ee', color: 'white', padding: '12px 15px', textAlign: 'center', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
                                    <th style={{ background: '#4361ee', color: 'white', padding: '12px 15px', textAlign: 'center', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</th>
                                    <th style={{ background: '#4361ee', color: 'white', padding: '12px 15px', textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rate (₹)</th>
                                    <th style={{ background: '#4361ee', color: 'white', padding: '12px 15px', textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSale.items?.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td style={{ padding: '11px 15px', borderBottom: '1px solid #eee', fontSize: '13px' }}>{idx + 1}</td>
                                        <td style={{ padding: '11px 15px', borderBottom: '1px solid #eee', fontWeight: '600', fontSize: '13px' }}>{item.item}</td>
                                        <td style={{ padding: '11px 15px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '13px' }}>{item.quantity}</td>
                                        <td style={{ padding: '11px 15px', borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '13px' }}>{item.unit}</td>
                                        <td style={{ padding: '11px 15px', borderBottom: '1px solid #eee', textAlign: 'right', fontSize: '13px' }}>₹{item.rate?.toLocaleString()}</td>
                                        <td style={{ padding: '11px 15px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold', fontSize: '13px' }}>₹{item.amount?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* ===== TOTALS ===== */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                            <div style={{ minWidth: '280px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Subtotal</span>
                                    <span style={{ fontWeight: 'bold' }}>₹{selectedSale.subtotal?.toLocaleString()}</span>
                                </div>
                                {selectedSale.gstAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
                                        <span style={{ color: '#888' }}>GST ({selectedSale.gstPercentage}%)</span>
                                        <span style={{ fontWeight: 'bold' }}>₹{selectedSale.gstAmount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
                                    <span style={{ color: '#888' }}>Amount Paid</span>
                                    <span style={{ fontWeight: 'bold', color: '#00ab55' }}>₹{selectedSale.amountPaid?.toLocaleString()}</span>
                                </div>
                                {selectedSale.balanceAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px' }}>
                                        <span style={{ color: '#888' }}>Balance Due</span>
                                        <span style={{ fontWeight: 'bold', color: '#e7515a' }}>₹{selectedSale.balanceAmount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#4361ee', borderTop: '2px solid #4361ee', marginTop: '8px' }}>
                                    <span>Grand Total</span>
                                    <span>₹{selectedSale.grandTotal?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* ===== NOTES ===== */}
                        {selectedSale.notes && (
                            <div style={{ background: '#f8f9fa', padding: '12px 15px', borderRadius: '6px', marginBottom: '30px', fontSize: '13px' }}>
                                <span style={{ fontWeight: 'bold', color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes: </span>
                                <span style={{ color: '#555' }}>{selectedSale.notes}</span>
                            </div>
                        )}

                        {/* ===== FOOTER ===== */}
                        <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid #ccc', width: '200px', paddingTop: '8px', fontSize: '12px', color: '#888' }}>Customer Signature</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid #ccc', width: '200px', paddingTop: '8px', fontSize: '12px', color: '#888' }}>Authorized Signature</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#aaa', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <p>Thank you for your business! — Karthick Earth Movers</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="panel mb-6">
                        <div className="flex items-end gap-4 flex-wrap">
                            <div>
                                <label className="text-xs font-bold text-white-dark uppercase mb-2 block">From Date</label>
                                <input type="date" className="form-input w-44" value={filters.startDate} onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white-dark uppercase mb-2 block">To Date</label>
                                <input type="date" className="form-input w-44" value={filters.endDate} onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))} />
                            </div>
                            <button className="btn btn-primary" onClick={fetchSales}>
                                <IconSearch className="w-4 h-4 ltr:mr-2 rtl:ml-2" /> Search
                            </button>
                        </div>
                    </div>

                    {/* Sales List */}
                    <div className="panel">
                        <h5 className="text-lg font-bold dark:text-white-light mb-4">Invoice List</h5>
                        <div className="table-responsive">
                            <table className="table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Invoice #</th>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th className="!text-right">Grand Total</th>
                                        <th className="!text-center">Payment</th>
                                        <th className="!text-center">Status</th>
                                        <th className="!text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={9} className="text-center py-8 text-white-dark">Loading...</td></tr>
                                    ) : sales.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-8 text-white-dark">No invoices found</td></tr>
                                    ) : (
                                        sales.map((sale, idx) => (
                                            <tr key={sale._id}>
                                                <td>{idx + 1}</td>
                                                <td className="font-bold text-primary">{sale.invoiceNumber}</td>
                                                <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                                                <td className="font-semibold">{sale.customer?.name || '—'}</td>
                                                <td>
                                                    <span className="badge bg-dark/10 text-dark dark:bg-dark-light/10 dark:text-white-dark">
                                                        {sale.items?.length || 0} items
                                                    </span>
                                                </td>
                                                <td className="!text-right font-bold text-lg">₹{sale.grandTotal?.toLocaleString()}</td>
                                                <td className="!text-center">
                                                    <span className={`badge ${sale.paymentType === 'Cash' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                        {sale.paymentType}
                                                    </span>
                                                </td>
                                                <td className="!text-center">
                                                    <span className={`badge ${sale.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : sale.paymentStatus === 'Partial' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                                                        {sale.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="!text-center">
                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => viewInvoice(sale._id)}>
                                                        <IconPrinter className="w-4 h-4 ltr:mr-1 rtl:ml-1" /> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default InvoiceGeneration;
