'use client';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Link from 'next/link';
import IconSave from '@/components/icon/icon-save';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import IconEye from '@/components/icon/icon-eye';
import DeleteConfirmModal from '@/components/stone-mine/delete-confirm-modal';
import { useToast } from '@/components/stone-mine/toast-notification';
import api from '@/utils/api';
import { canEditRecord } from '@/utils/permissions';
import * as XLSX from 'xlsx';
import IconDownload from '@/components/icon/icon-download';
import IconFileUpload from '@/components/icon/icon-file-upload';



const SalesEntryForm = () => {
    const currentUser = useSelector((state: IRootState) => state.auth.user);
    const role = currentUser?.role?.toLowerCase();
    const canSeeFinancials = role === 'owner' || role === 'manager' || role === 'accountant';
    const isOwner = role === 'owner';
    const isSupervisor = role === 'supervisor';

    const { showToast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [stoneTypes, setStoneTypes] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        invoiceDate: new Date().toISOString().split('T')[0],
        customer: '',
        paymentType: 'Cash',
        gstPercentage: 0,
        dueDate: '',
        notes: '',
        fromLocation: 'Quarry',
        toLocation: '',
        receiptNumber: '',
        receiptFile: '',
        gstNumber: '',
    });

    const [items, setItems] = useState<any[]>([
        { item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }
    ]);
    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterDelivery, setFilterDelivery] = useState('');
    const [filterReceipt, setFilterReceipt] = useState('');
    const [filterGst, setFilterGst] = useState('');

    const fetchSales = async () => {
        try {
            const res = await api.get('/sales');
            if (res.data.success) setRecentSales(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const res = await api.get('/customers');
                if (res.data.success) setCustomers(res.data.data);
            } catch (error) { console.error('Error fetching customers:', error); }

            try {
                const res = await api.get('/master/stone-types');
                if (res.data.success) setStoneTypes(res.data.data);
            } catch (error) { console.error('Error fetching stone types:', error); }
        };
        fetchMasterData();
        fetchSales();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'gstNumber' && value.length >= 3) {
            handleGstSearch(value);
        }

        if (name === 'customer') {
            const selected = customers.find(c => c._id === value);
            if (selected) {
                setFormData(prev => ({ ...prev, gstNumber: selected.gstNumber || '' }));
            }
        }
    };

    const handleGstSearch = async (gst: string) => {
        try {
            const res = await api.get(`/customers?search=${gst}`);
            if (res.data.success && res.data.data.length > 0) {
                // Find an exact match if possible, otherwise first match
                const match = res.data.data.find((c: any) => c.gstNumber?.toLowerCase() === gst.toLowerCase()) || res.data.data[0];
                if (match) {
                    setFormData(prev => ({
                        ...prev,
                        customer: match._id,
                        // We also update the notes or other fields if needed, but selecting the customer is primary
                    }));
                }
            }
        } catch (error) {
            console.error('Error searching customer by GST:', error);
        }
    };

    const handleToggleDeliveryStatus = async (sale: any) => {
        const newStatus = sale.deliveryStatus === 'completed' ? 'open' : 'completed';
        try {
            await api.patch(`/sales/${sale._id}/delivery-status`, { deliveryStatus: newStatus });
            showToast(`Sale marked as ${newStatus === 'completed' ? '✅ Completed' : '🔄 Reopened'}`, 'success');
            fetchSales();
        } catch (error) {
            console.error(error);
            showToast('Error updating delivery status', 'error');
        }
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
                let unit = selectedStone.unit || 'Tons';
                if (unit === 'Ton') unit = 'Tons';
                if (unit === 'Unit') unit = 'Units';
                updatedItems[index].unit = unit;
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
            fromLocation: 'Quarry',
            toLocation: '',
            receiptNumber: '',
            receiptFile: '',
            gstNumber: '',
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
            fromLocation: 'Quarry',
            toLocation: '',
            receiptNumber: '',
            receiptFile: '',
            gstNumber: '',
        });
        setItems([{ item: '', stoneType: '', quantity: '', unit: 'Tons', rate: '', amount: 0 }]);
        setShowForm(true);
    };

    const handleEdit = async (saleId: string) => {
        try {
            const { data } = await api.get(`/sales/${saleId}`);
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
                    fromLocation: sale.fromLocation || 'Quarry',
                    toLocation: sale.toLocation || '',
                    receiptNumber: sale.receiptNumber || '',
                    receiptFile: sale.receiptFile || '',
                    gstNumber: sale.customer?.gstNumber || '',
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
            const { data } = await api.delete(`/sales/${deleteId}`);
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
                    quantity: parseFloat(item.quantity) || 0,
                    unit: item.unit,
                    rate: parseFloat(item.rate) || 0,
                    amount: item.amount || 0
                })),
                subtotal,
                gstAmount,
                grandTotal,
                amountPaid: formData.paymentType === 'Cash' ? grandTotal : 0,
            };

            if (editId) {
                const { data } = await api.put(`/sales/${editId}`, payload);
                if (data.success) {
                    showToast(`Sale updated! Invoice: ${data.data.invoiceNumber}`, 'success');
                    resetForm();
                    fetchSales();
                }
            } else {
                const { data } = await api.post('/sales', payload);
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

    const downloadTemplate = () => {
        const template = [
            {
                'Receipt Number': 'REC-12345',
                'Receipt File': '',
                'Invoice Date': new Date().toISOString().split('T')[0],
                'Customer Name': 'Example Customer',
                'Item': '20mm Blue Metal',
                'Quantity': 10,
                'Unit': 'Tons',
                'Rate': 550,
                'Payment Type': 'Cash',
                'GST Percentage': 5,
                'From Location': 'Quarry',
                'To Location': 'Site A',
                'Notes': 'Bulk load'
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SalesTemplate');
        XLSX.writeFile(wb, 'Sales_Bulk_Upload_Template.xlsx');
    };

    const handleFileUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                setIsUploading(true);
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    showToast('The file is empty', 'error');
                    return;
                }

                // Map Excel headers to API keys
                const salesData = data.map((row: any) => ({
                    invoiceDate: row['Invoice Date'],
                    customerName: row['Customer Name'],
                    item: row['Item'],
                    quantity: row['Quantity'],
                    unit: row['Unit'],
                    rate: row['Rate'],
                    paymentType: row['Payment Type'],
                    gstPercentage: row['GST Percentage'],
                    fromLocation: row['From Location'],
                    toLocation: row['To Location'],
                    notes: row['Notes'],
                    receiptNumber: row['Receipt Number'],
                    receiptFile: row['Receipt File']
                }));

                const res = await api.post('/sales/bulk', { salesData });
                if (res.data.success) {
                    showToast(`✅ ${res.data.message}`, 'success');
                    fetchSales();
                }
            } catch (error: any) {
                console.error(error);
                const msg = error.response?.data?.errors ? error.response.data.errors.join('\n') : (error.response?.data?.message || 'Error uploading file');
                showToast(msg, 'error');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleReceiptUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('bill', file);

        try {
            const { data } = await api.post('/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (data.success) {
                setFormData((prev) => ({ ...prev, receiptFile: data.filePath }));
                showToast('Receipt uploaded successfully!', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Error uploading receipt', 'error');
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
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">GST Number (Search)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            className="form-input ltr:pr-10 rtl:pl-10 border-info"
                                            placeholder="Enter GST..."
                                            value={formData.gstNumber}
                                            onChange={handleChange}
                                        />
                                        <IconSearch className="w-4 h-4 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-info" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Customer Name *</label>
                                    <select name="customer" className="form-select border-primary" value={formData.customer} onChange={handleChange} required>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                    {formData.customer && (
                                        <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/10">
                                            {(() => {
                                                const selected = customers.find(c => c._id === formData.customer);
                                                if (selected) {
                                                    return (
                                                        <div className="text-[10px] space-y-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-white-dark">Phone:</span>
                                                                <span className="font-bold">{selected.phone || 'N/A'}</span>
                                                            </div>
                                                            <div className="border-t border-primary/5 pt-1">
                                                                <span className="text-white-dark block mb-1">Address:</span>
                                                                <span className="font-semibold block break-words whitespace-pre-wrap">{selected.address || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}
                                </div>
                                {canSeeFinancials && (
                                    <div>
                                        <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Payment Type *</label>
                                        <select name="paymentType" className="form-select border-warning" value={formData.paymentType} onChange={handleChange}>
                                            <option value="Cash">💵 Cash Sale (பணம்)</option>
                                            <option value="Credit">📒 Credit Sale (கடன்)</option>
                                        </select>
                                    </div>
                                )}
                                {formData.paymentType === 'Credit' && (
                                    <div>
                                        <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Due Date</label>
                                        <input type="date" name="dueDate" className="form-input border-warning" value={formData.dueDate} onChange={handleChange} />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Receipt Number</label>
                                    <input type="text" name="receiptNumber" className="form-input" placeholder="Enter receipt #" value={formData.receiptNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Receipt Upload</label>
                                    <div className="flex items-center gap-2">
                                        <input type="file" className="form-input p-1 h-10 flex-1" accept=".jpg,.jpeg,.png,.pdf" onChange={handleReceiptUpload} />
                                        {formData.receiptFile && (
                                            <a href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}${formData.receiptFile}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info p-2" title="View Uploaded File">
                                                <IconEye className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
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
                                            {canSeeFinancials && <th>Rate (₹)</th>}
                                            {canSeeFinancials && <th className="!text-right">Amount (₹)</th>}
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
                                                {canSeeFinancials && (
                                                    <td>
                                                        <input type="number" name="rate" className="form-input text-sm w-28 border-primary/20" placeholder="0.00" value={item.rate} onChange={(e) => handleItemChange(idx, e)} required={canSeeFinancials} />
                                                    </td>
                                                )}
                                                {canSeeFinancials && (
                                                    <td className="!text-right font-bold text-primary text-lg">
                                                        ₹{item.amount.toLocaleString()}
                                                    </td>
                                                )}
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

                        {/* Section 3: Location Details */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                Location Details (இட விவரங்கள்)
                            </div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">From Location</label>
                                    <input type="text" name="fromLocation" className="form-input font-bold text-primary" value={formData.fromLocation} onChange={handleChange} placeholder="Quarry" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">To Location (Destination)</label>
                                    <input type="text" name="toLocation" className="form-input" value={formData.toLocation} onChange={handleChange} placeholder="Enter destination..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: GST & Totals */}
                        {canSeeFinancials && (
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
                        )}

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
                    <div className="flex flex-col gap-5 mb-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h5 className="text-lg font-bold dark:text-white-light whitespace-nowrap">விற்பனை பட்டியல் (Sales List)</h5>
                            <div className="flex items-center gap-2">
                                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                                {isOwner && (
                                    <>
                                        <button className="btn btn-outline-primary whitespace-nowrap" onClick={downloadTemplate}>
                                            <IconDownload className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                            Download Template
                                        </button>
                                        <button className="btn btn-info whitespace-nowrap" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                            <IconFileUpload className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                            {isUploading ? 'Uploading...' : 'Bulk Upload'}
                                        </button>
                                    </>
                                )}
                                <button className="btn btn-primary shadow-lg shadow-primary/20 whitespace-nowrap" onClick={handleCreateNew}>
                                    <IconPlus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                                    Create New Sale
                                </button>
                            </div>
                        </div>

                        {/* Filter Panel */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-primary/5 p-4 rounded-xl">
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">General Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Invoice #..."
                                        className="form-input ltr:pr-10 rtl:pl-10 h-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <IconSearch className="w-4 h-4 absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-white-dark" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Filter Customer</label>
                                <select className="form-select h-10" value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}>
                                    <option value="">All Customers</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Start Date</label>
                                <input type="date" className="form-input h-10" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">End Date</label>
                                <input type="date" className="form-input h-10" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Delivery Status</label>
                                <select className="form-select h-10" value={filterDelivery} onChange={(e) => setFilterDelivery(e.target.value)}>
                                    <option value="">All</option>
                                    <option value="open">🔄 Open</option>
                                    <option value="completed">✅ Delivered</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Receipt #</label>
                                <input
                                    type="text"
                                    placeholder="Receipt #..."
                                    className="form-input h-10"
                                    value={filterReceipt}
                                    onChange={(e) => setFilterReceipt(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase mb-1 block">Billing Type</label>
                                <select className="form-select h-10" value={filterGst} onChange={(e) => setFilterGst(e.target.value)}>
                                    <option value="">All</option>
                                    <option value="gst">📄 GST Account</option>
                                    <option value="normal">📄 Normal (0%)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Location</th>
                                    <th>Items</th>
                                    {canSeeFinancials && <th>Type</th>}
                                    {canSeeFinancials && <th className="!text-right">Total</th>}
                                    <th className="!text-center">Payment</th>
                                    <th className="!text-center">Delivery</th>
                                    <th className="!text-center">Receipt</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const filtered = recentSales.filter(s => {
                                        const matchesSearch = !search ||
                                            s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
                                            s.customer?.name?.toLowerCase().includes(search.toLowerCase());

                                        const matchesCustomer = !filterCustomer ||
                                            s.customer?.name === filterCustomer;

                                        const saleDate = s.invoiceDate ? new Date(s.invoiceDate).toISOString().split('T')[0] : '';
                                        const matchesStart = !filterStartDate || saleDate >= filterStartDate;
                                        const matchesEnd = !filterEndDate || saleDate <= filterEndDate;

                                        const matchesDelivery = !filterDelivery || (s.deliveryStatus || 'open') === filterDelivery;

                                        const matchesReceipt = !filterReceipt ||
                                            s.receiptNumber?.toLowerCase().includes(filterReceipt.toLowerCase());

                                        const matchesGst = !filterGst || (
                                            filterGst === 'gst' ? (s.gstPercentage > 0) : (s.gstPercentage === 0 || !s.gstPercentage)
                                        );

                                        return matchesSearch && matchesCustomer && matchesStart && matchesEnd && matchesDelivery && matchesReceipt && matchesGst;
                                    });

                                    if (filtered.length === 0) {
                                        return <tr><td colSpan={10} className="text-center py-6 text-white-dark">No sales records found</td></tr>;
                                    }

                                    return filtered.map((sale, idx) => (
                                        <tr key={sale._id} className={editId === sale._id ? 'bg-primary/5' : ''}>
                                            <td>{idx + 1}</td>
                                            <td className="font-bold">
                                                {(sale.grandTotal || 0) > 0 ? (
                                                    <Link href={`/sales-billing/invoices?id=${sale._id}`} target="_blank" className="text-primary hover:underline">
                                                        {sale.invoiceNumber}
                                                    </Link>
                                                ) : (
                                                    <span className="text-white-dark/50 cursor-not-allowed" title="Cannot generate invoice — total is ₹0">
                                                        {sale.invoiceNumber}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{new Date(sale.invoiceDate).toLocaleDateString()}</td>
                                            <td className="font-semibold">{sale.customer?.name || '—'}</td>
                                            <td>
                                                {sale.toLocation ? (
                                                    <span className="text-[11px] font-bold text-primary">{sale.toLocation}</span>
                                                ) : (
                                                    <span className="text-white-dark text-xs">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge bg-dark/10 text-dark dark:bg-dark-light/10 dark:text-white-dark">
                                                    {sale.items?.length || 0} items
                                                </span>
                                            </td>
                                            {canSeeFinancials && (
                                                <td>
                                                    <span className={`badge ${sale.paymentType === 'Cash' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                        {sale.paymentType === 'Cash' ? '💵 Cash' : '📒 Credit'}
                                                    </span>
                                                </td>
                                            )}
                                            {canSeeFinancials && (
                                                <td className="!text-right font-bold">
                                                    {(sale.grandTotal || 0) === 0 ? (
                                                        <span className="badge bg-danger/10 text-danger text-[10px]">₹0 – No Invoice</span>
                                                    ) : (
                                                        <>₹{sale.grandTotal?.toLocaleString()}</>
                                                    )}
                                                </td>
                                            )}
                                            <td className="!text-center">
                                                <span className={`badge ${sale.paymentStatus === 'Paid' ? 'bg-success/10 text-success'
                                                    : sale.paymentStatus === 'Partial' ? 'bg-warning/10 text-warning'
                                                        : 'bg-danger/10 text-danger'
                                                    }`}>
                                                    {sale.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="!text-center">
                                                <button
                                                    title={sale.deliveryStatus === 'completed' ? 'Click to Re-open' : 'Click to Mark Complete'}
                                                    onClick={() => handleToggleDeliveryStatus(sale)}
                                                    className={`badge cursor-pointer border-0 ${sale.deliveryStatus === 'completed'
                                                        ? 'bg-teal-500/10 text-teal-500 hover:bg-danger/10 hover:text-danger'
                                                        : 'bg-orange-400/10 text-orange-400 hover:bg-teal-500/10 hover:text-teal-500'
                                                        } transition-colors`}
                                                >
                                                    {sale.deliveryStatus === 'completed' ? '✅ Delivered' : '🔄 Open'}
                                                </button>
                                            </td>
                                            <td className="!text-center">
                                                {sale.receiptNumber && <div className="text-[10px] font-bold text-white-dark mb-1">{sale.receiptNumber}</div>}
                                                {sale.receiptFile ? (
                                                    <a
                                                        href={`${process.env.NEXT_PUBLIC_BASE_URL || ''}${sale.receiptFile}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="badge bg-info/10 text-info hover:bg-info hover:text-white transition-colors"
                                                    >
                                                        View File
                                                    </a>
                                                ) : (
                                                    <span className="text-white-dark/30">—</span>
                                                )}
                                            </td>
                                            <td className="!text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canEditRecord(currentUser, sale.createdAt || sale.invoiceDate) ? (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handleEdit(sale._id)}
                                                            title="Edit Sale"
                                                        >
                                                            <IconEdit className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-white-dark italic">Locked</span>
                                                    )}
                                                    <Link
                                                        href={`/sales-billing/sales-entry/details?id=${sale._id}`}
                                                        className="btn btn-sm btn-outline-info"
                                                        title="View Sales Details"
                                                    >
                                                        <IconEye className="w-4 h-4" />
                                                    </Link>
                                                    {isOwner && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => setDeleteId(sale._id)}
                                                            title="Delete Sale"
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
            }

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                show={!!deleteId}
                title="Delete Sale"
                message="Are you sure you want to delete this sale? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div >
    );
};

export default SalesEntryForm;
