'use client';
import React, { useState, useEffect } from 'react';
import IconSave from '@/components/icon/icon-save';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconX from '@/components/icon/icon-x';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import { useToast } from '@/components/stone-mine/toast-notification';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const SalesEntryForm = () => {
    const { showToast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [stoneTypes, setStoneTypes] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        invoiceDate: new Date().toISOString().split('T')[0],
        customer: '',
        paymentType: 'Cash',
        gstPercentage: 0,
        dueDate: '',
        notes: '',
    });

    const [items, setItems] = useState<any[]>([
        { item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }
    ]);

    const [recentSales, setRecentSales] = useState<any[]>([]);

    const fetchSales = async () => {
        try {
            const res = await axios.get(`${API}/sales`);
            if (res.data.success) setRecentSales(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, stoneRes] = await Promise.all([
                    axios.get(`${API}/customers?status=active`),
                    axios.get(`${API}/master/stone-types`),
                ]);
                if (custRes.data.success) setCustomers(custRes.data.data);
                if (stoneRes.data.success) setStoneTypes(stoneRes.data.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
        fetchSales();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, e: any) => {
        const { name, value } = e.target;
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [name]: value };

        if (name === 'stoneType') {
            const selectedStone = stoneTypes.find(s => s._id === value);
            if (selectedStone) {
                updatedItems[index].item = selectedStone.name;
                updatedItems[index].rate = selectedStone.defaultPrice || '';
                updatedItems[index].unit = selectedStone.unit || 'Tons';
            }
        }

        const qty = parseFloat(updatedItems[index].quantity) || 0;
        const rate = parseFloat(updatedItems[index].rate) || 0;
        updatedItems[index].amount = qty * rate;

        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, { item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const gstAmount = (subtotal * (parseFloat(String(formData.gstPercentage)) || 0)) / 100;
    const grandTotal = subtotal + gstAmount;

    const resetForm = () => {
        setEditId(null);
        setShowForm(false);
        setFormData({
            invoiceDate: new Date().toISOString().split('T')[0],
            customer: '',
            paymentType: 'Cash',
            gstPercentage: 0,
            dueDate: '',
            notes: '',
        });
        setItems([{ item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }]);
    };

    const handleCreateNew = () => {
        setEditId(null);
        setFormData({
            invoiceDate: new Date().toISOString().split('T')[0],
            customer: '',
            paymentType: 'Cash',
            gstPercentage: 0,
            dueDate: '',
            notes: '',
        });
        setItems([{ item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }]);
        setShowForm(true);
    };

    const handleEdit = async (saleId: string) => {
        try {
            const { data } = await axios.get(`${API}/sales/${saleId}`);
            if (data.success) {
                const sale = data.data;
                setEditId(sale._id);
                setFormData({
                    invoiceDate: sale.invoiceDate ? new Date(sale.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    customer: sale.customer?._id || '',
                    paymentType: sale.paymentType || 'Cash',
                    gstPercentage: sale.gstPercentage || 0,
                    dueDate: sale.dueDate ? new Date(sale.dueDate).toISOString().split('T')[0] : '',
                    notes: sale.notes || '',
                });
                setItems(
                    sale.items?.map((item: any) => ({
                        item: item.item || '',
                        stoneType: item.stoneType?._id || item.stoneType || '',
                        quantity: item.quantity || '',
                        unit: item.unit || 'Tons',
                        rate: item.rate || '',
                        amount: item.amount || 0,
                    })) || [{ item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }]
                );
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error(error);
            showToast('Error loading sale for editing', 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const { data } = await axios.delete(`${API}/sales/${deleteId}`);
            if (data.success) {
                showToast('Sale deleted successfully!', 'success');
                if (editId === deleteId) resetForm();
                fetchSales();
            }
        } catch (error) {
            console.error(error);
            showToast('Error deleting sale', 'error');
        } finally {
            setDeleteId(null);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                items: items.map(item => ({
                    item: item.item,
                    stoneType: item.stoneType || undefined,
                    quantity: parseFloat(item.quantity),
                    unit: item.unit,
                    rate: parseFloat(item.rate),
                    amount: item.amount
                })),
                subtotal,
                gstAmount,
                grandTotal,
                amountPaid: formData.paymentType === 'Cash' ? grandTotal : 0,
            };

            if (editId) {
                const { data } = await axios.put(`${API}/sales/${editId}`, payload);
                if (data.success) {
                    showToast(`Sale updated! Invoice: ${data.data.invoiceNumber}`, 'success');
                    resetForm();
                    fetchSales();
                }
            } else {
                const { data } = await axios.post(`${API}/sales`, payload);
                if (data.success) {
                    showToast(`Sale recorded! Invoice: ${data.data.invoiceNumber}`, 'success');
                    resetForm();
                    fetchSales();
                }
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Error saving sale', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Sale Entry Form — shown only when creating/editing */}
            {showForm && (
                <div className="panel">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div>
                            <h5 className="text-xl font-bold dark:text-white-light">
                                {editId ? '✏️ விற்பனை திருத்தம் (Edit Sale)' : '➕ புதிய விற்பனை (New Sale)'}
                            </h5>
                            <p className="text-white-dark text-xs mt-1">
                                {editId ? 'Modify existing sale record' : 'Record each sale with item details, quantity, and rate'}
                            </p>
                        </div>
                        <button className="btn btn-outline-danger btn-sm" onClick={resetForm}>
                            <IconX className="w-4 h-4 ltr:mr-1 rtl:ml-1" /> Close
                        </button>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {/* Section 1: Invoice Details */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                Invoice Details
                            </div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Invoice Date *</label>
                                    <input type="date" name="invoiceDate" className="form-input" value={formData.invoiceDate} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Customer Name *</label>
                                    <select name="customer" className="form-select border-primary" value={formData.customer} onChange={handleChange} required>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Payment Type *</label>
                                    <select name="paymentType" className="form-select" value={formData.paymentType} onChange={handleChange}>
                                        <option value="Cash">💵 Cash Sale</option>
                                        <option value="Credit">📒 Credit Sale</option>
                                    </select>
                                </div>
                                {formData.paymentType === 'Credit' && (
                                    <div>
                                        <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Due Date</label>
                                        <input type="date" name="dueDate" className="form-input border-warning" value={formData.dueDate} onChange={handleChange} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Item Details */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                    <IconPlus className="w-4 h-4" />
                                    Item Details
                                </div>
                                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
                                    <IconPlus className="w-4 h-4 ltr:mr-1 rtl:ml-1" /> Add Item
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Item (Material)</th>
                                            <th>Quantity</th>
                                            <th>Unit</th>
                                            <th>Rate (₹)</th>
                                            <th className="!text-right">Amount (₹)</th>
                                            <th className="!text-center w-16">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <select name="stoneType" className="form-select text-sm" value={item.stoneType} onChange={(e) => handleItemChange(idx, e)}>
                                                        <option value="">Select Item</option>
                                                        {stoneTypes.map(st => (
                                                            <option key={st._id} value={st._id}>{st.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="number" name="quantity" className="form-input text-sm w-28" placeholder="0" value={item.quantity} onChange={(e) => handleItemChange(idx, e)} required />
                                                </td>
                                                <td>
                                                    <select name="unit" className="form-select text-sm w-24" value={item.unit} onChange={(e) => handleItemChange(idx, e)}>
                                                        <option value="Tons">Tons</option>
                                                        <option value="Units">Units</option>
                                                        <option value="Kg">Kg</option>
                                                        <option value="CFT">CFT</option>
                                                        <option value="Loads">Loads</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="number" name="rate" className="form-input text-sm w-28" placeholder="0.00" value={item.rate} onChange={(e) => handleItemChange(idx, e)} required />
                                                </td>
                                                <td className="!text-right font-bold text-primary text-lg">
                                                    ₹{item.amount.toLocaleString()}
                                                </td>
                                                <td className="!text-center">
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: GST & Totals */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                GST & Totals
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">GST %</label>
                                    <select name="gstPercentage" className="form-select" value={formData.gstPercentage} onChange={handleChange}>
                                        <option value="0">No GST (0%)</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                </div>
                                <div className="bg-dark-light/5 dark:bg-dark p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white-dark">Subtotal:</span>
                                        <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {gstAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white-dark">GST ({formData.gstPercentage}%):</span>
                                            <span className="font-bold">₹{gstAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg border-t border-[#ebedf2] dark:border-[#1b2e4b] pt-2">
                                        <span className="font-bold text-primary">Grand Total:</span>
                                        <span className="font-black text-primary text-2xl">₹{grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">குறிப்பு (Notes)</label>
                            <textarea name="notes" className="form-textarea" rows={2} placeholder="Any additional notes..." value={formData.notes} onChange={handleChange}></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-[#ebedf2] dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger px-8" onClick={resetForm}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/20">
                                <IconSave className="ltr:mr-2 rtl:ml-2" />
                                {editId ? 'Update Sale' : 'Save Sale'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Sales Table — hidden when form is open */}
            {!showForm && (
                <div className="panel">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="text-lg font-bold dark:text-white-light">விற்பனை பட்டியல் (Sales List)</h5>
                        {!showForm && (
                            <button className="btn btn-primary shadow-lg shadow-primary/20" onClick={handleCreateNew}>
                                <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                Create New Sale
                            </button>
                        )}
                    </div>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Type</th>
                                    <th className="!text-right">Total</th>
                                    <th className="!text-center">Status</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.length === 0 ? (
                                    <tr><td colSpan={9} className="text-center py-6 text-white-dark">No sales yet</td></tr>
                                ) : (
                                    recentSales.map((sale, idx) => (
                                        <tr key={sale._id} className={editId === sale._id ? 'bg-primary/5' : ''}>
                                            <td>{idx + 1}</td>
                                            <td className="font-bold text-primary">{sale.invoiceNumber}</td>
                                            <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                                            <td className="font-semibold">{sale.customer?.name || '—'}</td>
                                            <td>
                                                <span className="badge bg-dark/10 text-dark dark:bg-dark-light/10 dark:text-white-dark">
                                                    {sale.items?.length || 0} items
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${sale.paymentType === 'Cash' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                    {sale.paymentType === 'Cash' ? '💵 Cash' : '📒 Credit'}
                                                </span>
                                            </td>
                                            <td className="!text-right font-bold">₹{sale.grandTotal?.toLocaleString()}</td>
                                            <td className="!text-center">
                                                <span className={`badge ${sale.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : sale.paymentStatus === 'Partial' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                                                    {sale.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="!text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEdit(sale._id)}
                                                        title="Edit Sale"
                                                    >
                                                        <IconEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => setDeleteId(sale._id)}
                                                        title="Delete Sale"
                                                    >
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                show={!!deleteId}
                title="Delete Sale"
                message="Are you sure you want to delete this sale? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};

export default SalesEntryForm;
