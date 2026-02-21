'use client';
import React, { useEffect, useState, Fragment } from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconX from '@/components/icon/icon-x';
import IconSave from '@/components/icon/icon-save';
import IconPlus from '@/components/icon/icon-plus';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';

import axios from 'axios';

interface ExpenseCategoryManagerProps {
    category: string;
    title: string;
}

const ExpenseCategoryManager = ({ category, title }: ExpenseCategoryManagerProps) => {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [labours, setLabours] = useState<any[]>([]);

    // View State
    const [formView, setFormView] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    // Form States
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        category: category,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        vehicleOrMachine: '',
        vehicleType: '',
        vehicleNumber: '',
        quantity: '',
        rate: '',
        paymentMode: 'Cash',
        meterReading: '',
        billUrl: '',
        // Maintenance specialized fields
        maintenanceType: '',
        sparePartsCost: '',
        labourCharge: '',
        vendorName: '',
        // Labour specialized fields
        labourName: '',
        workType: '',
        wageType: '',
        perDaySalary: '',
        advanceDeduction: '',
        netPay: '',
        siteAssigned: '',
        // Explosive specialized fields
        site: '',
        explosiveType: '',
        unit: 'Nos',
        supplierName: '',
        licenseNumber: '',
        supervisorName: '',
        // Transport specialized fields
        transportType: '',
        fromLocation: '',
        toLocation: '',
        driverName: '',
        loadDetails: '',
        // Office & Misc specialized fields
        officeExpenseType: '',
        paidTo: '',
        billNumber: '',
        nextServiceDate: '',
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
                params: { category }
            });
            if (data.success) {
                setExpenses(data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicles = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`);
            if (data.success) setVehicles(data.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const fetchLabours = async () => {
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/labours`);
            if (data.success) setLabours(data.data);
        } catch (error) {
            console.error('Error fetching labours:', error);
        }
    };

    useEffect(() => {
        if (category === 'Labour Wages' && formData.labourName && formData.date && labours.length > 0) {
            const fetchLabourSummary = async () => {
                const selDate = new Date(formData.date);
                const month = selDate.getMonth() + 1;
                const year = selDate.getFullYear();

                try {
                    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour/wages-summary`, {
                        params: { month, year }
                    });

                    if (data.success) {
                        const summary = data.data.find((s: any) => s.name === formData.labourName);
                        if (summary) {
                            setFormData(prev => ({
                                ...prev,
                                quantity: summary.attendance.total.toString(),
                                perDaySalary: summary.dailyRate.toString(),
                                rate: summary.dailyWage.toString(),
                                amount: summary.totalWages.toString(),
                                advanceDeduction: summary.totalAdvance.toString(),
                                netPay: summary.netPayable.toString()
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Error fetching labour summary:', error);
                }
            };
            fetchLabourSummary();
        }
    }, [formData.labourName, formData.date, category, labours]);

    useEffect(() => {
        fetchExpenses();
        fetchVehicles();
        fetchLabours();
    }, [category]);

    const uniqueVehicleTypes = Array.from(new Set(vehicles
        .filter(v => {
            if (category === 'Transport Charges') return v.type === 'Vehicle';
            // Allow both Machines and Vehicles for Maintenance
            if (category === 'Machine Maintenance') return true;
            return true;
        })
        .map((v) => v.category || v.name)
    ));

    const filteredVehicles = vehicles.filter((v) => (v.category || v.name) === formData.vehicleType);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // If vehicleType changes, reset vehicleNumber
            if (name === 'vehicleType') {
                updated.vehicleNumber = '';
                updated.vehicleOrMachine = value; // Default to type name if no number selected yet

                // Auto-select if ONLY ONE matching vehicle in master
                const matches = vehicles.filter((v) => (v.category || v.name) === value);
                if (matches.length === 1) {
                    const onlyMatch = matches[0];
                    const num = onlyMatch.vehicleNumber || onlyMatch.registrationNumber || '';
                    updated.vehicleNumber = num;
                    updated.vehicleOrMachine = value + (num ? ` (${num})` : '');
                }
            }

            // If vehicleNumber changes, update full vehicleOrMachine string
            if (name === 'vehicleNumber') {
                updated.vehicleOrMachine = prev.vehicleType + (value ? ` (${value})` : '');
            }

            // Categories that need Qty x Rate calculation
            const calculationCategories = ['Diesel', 'Explosive Cost', 'Transport Charges'];
            if (calculationCategories.includes(category) && (name === 'quantity' || name === 'rate')) {
                const qty = parseFloat(name === 'quantity' ? value : prev.quantity) || 0;
                const rate = parseFloat(name === 'rate' ? value : prev.rate) || 0;
                updated.amount = (qty * rate).toString();
            }

            // Calculation for Machine Maintenance
            if (category === 'Machine Maintenance' && (name === 'sparePartsCost' || name === 'labourCharge')) {
                const parts = parseFloat(name === 'sparePartsCost' ? value : prev.sparePartsCost) || 0;
                const labour = parseFloat(name === 'labourCharge' ? value : prev.labourCharge) || 0;
                updated.amount = (parts + labour).toString();
            }

            // Calculation for Labour Wages
            if (category === 'Labour Wages') {
                if (name === 'labourName') {
                    const worker = labours.find((l: any) => l.name === value);
                    if (worker) {
                        updated.workType = worker.workType || '';
                        updated.wageType = worker.wageType === 'Daily' ? 'Daily Wage' : (worker.wageType === 'Monthly' ? 'Monthly Salary' : '');
                        updated.rate = (worker.wage || '').toString();
                    }
                }

                const selDate = new Date(updated.date || prev.date);
                const daysInMonth = new Date(selDate.getFullYear(), selDate.getMonth() + 1, 0).getDate();
                const qty = parseFloat(name === 'quantity' ? value : updated.quantity || prev.quantity) || 0;
                const rate = parseFloat(name === 'rate' ? value : updated.rate || prev.rate) || 0;
                const advance = parseFloat(name === 'advanceDeduction' ? value : updated.advanceDeduction || prev.advanceDeduction) || 0;

                let total = 0;
                if (updated.wageType === 'Monthly Salary') {
                    const daily = rate / (daysInMonth || 30);
                    updated.perDaySalary = daily.toFixed(2);
                    total = qty * daily;
                } else {
                    updated.perDaySalary = rate.toString();
                    total = qty * rate;
                }

                updated.amount = total.toFixed(2);
                updated.netPay = (total - advance).toFixed(2);
            }
            return updated;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const uploadFile = async () => {
        if (!selectedFile) return null;
        const uploadData = new FormData();
        uploadData.append('bill', selectedFile);
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data.filePath;
        } catch (error) {
            console.error('File upload failed:', error);
            return null;
        }
    };

    const handleAdd = async (e: any) => {
        e.preventDefault();
        let billUrl = formData.billUrl;
        if (selectedFile) {
            const uploadedUrl = await uploadFile();
            if (uploadedUrl) billUrl = uploadedUrl;
        }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, { ...formData, billUrl });
            if (data.success) {
                alert('Record saved successfully!');
                resetForm();
                fetchExpenses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (e: any) => {
        e.preventDefault();
        let billUrl = formData.billUrl;
        if (selectedFile) {
            const uploadedUrl = await uploadFile();
            if (uploadedUrl) billUrl = uploadedUrl;
        }
        try {
            const { data } = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${selectedExpense._id}`, { ...formData, billUrl });
            if (data.success) {
                alert('Record updated successfully!');
                resetForm();
                fetchExpenses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            const { data } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${selectedExpense._id}`);
            if (data.success) {
                setDeleteModal(false);
                fetchExpenses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setFormData({
            category: category,
            amount: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            vehicleOrMachine: '',
            vehicleType: '',
            vehicleNumber: '',
            quantity: '',
            rate: '',
            paymentMode: 'Cash',
            meterReading: '',
            billUrl: '',
            maintenanceType: '',
            sparePartsCost: '',
            labourCharge: '',
            vendorName: '',
            labourName: '',
            workType: '',
            wageType: '',
            perDaySalary: '',
            advanceDeduction: '',
            netPay: '',
            siteAssigned: '',
            site: '',
            explosiveType: '',
            unit: 'Nos',
            supplierName: '',
            licenseNumber: '',
            supervisorName: '',
            transportType: '',
            fromLocation: '',
            toLocation: '',
            driverName: '',
            loadDetails: '',
            officeExpenseType: '',
            paidTo: '',
            billNumber: '',
            nextServiceDate: '',
        });
        setSelectedFile(null);
        setFormView(false);
        setEditMode(false);
    };

    const openEditModal = (expense: any) => {
        setSelectedExpense(expense);

        // Try to parse vehicleType and vehicleNumber from vehicleOrMachine string if possible
        // Expecting "Name (Number)" or just "Name"
        let vType = expense.vehicleOrMachine || '';
        let vNum = '';
        if (vType.includes('(')) {
            const parts = vType.split(' (');
            vType = parts[0];
            vNum = parts[1].replace(')', '');
        }

        setFormData({
            category: expense.category,
            amount: expense.amount.toString(),
            date: expense.date.split('T')[0],
            description: expense.description || '',
            vehicleOrMachine: expense.vehicleOrMachine || '',
            vehicleType: vType,
            vehicleNumber: vNum,
            quantity: expense.quantity?.toString() || '',
            rate: expense.rate?.toString() || '',
            paymentMode: expense.paymentMode || 'Cash',
            meterReading: expense.meterReading || '',
            billUrl: expense.billUrl || '',
            maintenanceType: expense.maintenanceType || '',
            sparePartsCost: expense.sparePartsCost?.toString() || '',
            labourCharge: expense.labourCharge?.toString() || '',
            vendorName: expense.vendorName || '',
            labourName: expense.labourName || '',
            workType: expense.workType || '',
            wageType: expense.wageType || '',
            perDaySalary: expense.perDaySalary || '',
            advanceDeduction: expense.advanceDeduction?.toString() || '',
            netPay: expense.netPay?.toString() || '',
            siteAssigned: expense.siteAssigned || '',
            site: expense.site || '',
            explosiveType: expense.explosiveType || '',
            unit: expense.unit || 'Nos',
            supplierName: expense.supplierName || '',
            licenseNumber: expense.licenseNumber || '',
            supervisorName: expense.supervisorName || '',
            transportType: expense.transportType || '',
            fromLocation: expense.fromLocation || '',
            toLocation: expense.toLocation || '',
            driverName: expense.driverName || '',
            loadDetails: expense.loadDetails || '',
            officeExpenseType: expense.officeExpenseType || '',
            paidTo: expense.paidTo || '',
            billNumber: expense.billNumber || '',
            nextServiceDate: expense.nextServiceDate ? expense.nextServiceDate.split('T')[0] : '',
        });
        setSelectedFile(null);
        setEditMode(true);
        setFormView(true);
    };

    const openDeleteModal = (expense: any) => {
        setSelectedExpense(expense);
        setDeleteModal(true);
    };

    return (
        <div className="panel mt-6">
            {!formView ? (
                <>
                    <div className="mb-5 flex items-center justify-between">
                        <h5 className="text-lg font-semibold dark:text-white-light">{title}</h5>
                        <button type="button" className="btn btn-primary gap-2" onClick={() => { resetForm(); setFormView(true); setEditMode(false); }}>
                            <IconPlus /> Add Record
                        </button>
                    </div>
                    <div className="table-responsive min-h-[400px]">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    {category === 'Diesel' ? (
                                        <>
                                            <th>Vehicle/Machine</th>
                                            <th>Litres</th>
                                            <th>Rate</th>
                                            <th>Meter</th>
                                        </>
                                    ) : category === 'Explosive Cost' ? (
                                        <>
                                            <th>Site</th>
                                            <th>Material</th>
                                            <th>Qty/Rate</th>
                                            <th>Supplier</th>
                                            <th>Supervisor</th>
                                        </>
                                    ) : category === 'Transport Charges' ? (
                                        <>
                                            <th>Type</th>
                                            <th>Route (From-To)</th>
                                            <th>Vehicle</th>
                                            <th>Load</th>
                                            <th>Qty/Rate</th>
                                        </>
                                    ) : category === 'Machine Maintenance' ? (
                                        <>
                                            <th>Machine</th>
                                            <th>Type</th>
                                            <th>Parts</th>
                                            <th>Labour</th>
                                            <th>Hours</th>
                                        </>
                                    ) : category === 'Labour Wages' ? (
                                        <>
                                            <th>Labour</th>
                                            <th>Type</th>
                                            <th>Days/Hrs</th>
                                            <th>Total</th>
                                            <th>Net Pay</th>
                                        </>
                                    ) : category === 'Office & Misc' ? (
                                        <>
                                            <th>Expense Type</th>
                                            <th>Paid To</th>
                                            <th>Bill No</th>
                                            <th>Description</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Vehicle/Machine</th>
                                            <th>Description</th>
                                        </>
                                    )}
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center">Loading...</td></tr>
                                ) : expenses.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center">No records found.</td></tr>
                                ) : (
                                    expenses.map((expense: any) => (
                                        <tr key={expense._id}>
                                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                                            {category === 'Diesel' ? (
                                                <>
                                                    <td>{expense.vehicleOrMachine || '-'}</td>
                                                    <td>{expense.quantity || '-'}</td>
                                                    <td>₹{expense.rate || '-'}</td>
                                                    <td>{expense.meterReading || '-'}</td>
                                                </>
                                            ) : category === 'Explosive Cost' ? (
                                                <>
                                                    <td>{expense.site || '-'}</td>
                                                    <td><span className="badge badge-outline-warning">{expense.explosiveType || '-'}</span></td>
                                                    <td>{expense.quantity} {expense.unit} @ ₹{expense.rate}</td>
                                                    <td>
                                                        <div className="font-semibold">{expense.supplierName || '-'}</div>
                                                        {expense.licenseNumber && <div className="text-[10px] text-white-dark">Lic: {expense.licenseNumber}</div>}
                                                    </td>
                                                    <td>{expense.supervisorName || '-'}</td>
                                                </>
                                            ) : category === 'Transport Charges' ? (
                                                <>
                                                    <td><span className="badge badge-outline-secondary">{expense.transportType || '-'}</span></td>
                                                    <td className="text-xs">
                                                        <div className="flex flex-col">
                                                            <span className="text-primary font-medium">{expense.fromLocation || '-'}</span>
                                                            <span className="text-white-dark">to {expense.toLocation || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td>{expense.vehicleOrMachine || '-'}</td>
                                                    <td className="text-xs italic">{expense.loadDetails || '-'}</td>
                                                    <td>{expense.quantity || '1'} @ ₹{expense.rate || '0'}</td>
                                                </>
                                            ) : category === 'Machine Maintenance' ? (
                                                <>
                                                    <td>{expense.vehicleOrMachine || '-'}</td>
                                                    <td><span className="badge badge-outline-info">{expense.maintenanceType || '-'}</span></td>
                                                    <td>₹{expense.sparePartsCost || '0'}</td>
                                                    <td>₹{expense.labourCharge || '0'}</td>
                                                    <td>{expense.meterReading || '-'} Hrs</td>
                                                </>
                                            ) : category === 'Labour Wages' ? (
                                                <>
                                                    <td>{expense.labourName || '-'}</td>
                                                    <td>{expense.wageType || '-'}</td>
                                                    <td>{expense.quantity || '-'}</td>
                                                    <td>₹{expense.amount?.toLocaleString() || '0'}</td>
                                                    <td className="font-bold text-success">₹{expense.netPay?.toLocaleString() || '0'}</td>
                                                </>
                                            ) : category === 'Office & Misc' ? (
                                                <>
                                                    <td><span className="badge badge-outline-primary">{expense.officeExpenseType || '-'}</span></td>
                                                    <td>{expense.paidTo || '-'}</td>
                                                    <td>{expense.billNumber || '-'}</td>
                                                    <td className="text-xs">{expense.description || '-'}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{expense.vehicleOrMachine || '-'}</td>
                                                    <td>{expense.description || '-'}</td>
                                                </>
                                            )}
                                            <td className="font-bold text-primary">₹{expense.amount.toLocaleString()}</td>
                                            <td>{expense.paymentMode}</td>
                                            <td className="text-center">
                                                {expense.billUrl && (
                                                    <a href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}${expense.billUrl}`} target="_blank" className="text-primary hover:underline block mb-1">
                                                        View Bill
                                                    </a>
                                                )}
                                                <div className="flex justify-center gap-2">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(expense)}>
                                                        <IconEdit className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(expense)}>
                                                        <IconTrashLines className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="panel">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-full w-10 h-10 p-0"
                                onClick={() => { setFormView(false); setEditMode(false); }}
                            >
                                <IconArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h5 className="text-xl font-bold dark:text-white-light">{editMode ? `Edit ${title} Record` : `Add New ${title} Record`}</h5>
                                <p className="text-white-dark text-xs mt-1">Manage {title.toLowerCase()} details for your daily operations</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={editMode ? handleUpdate : handleAdd} className="max-w-4xl mx-auto space-y-8">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconPlus className="w-4 h-4" />
                                Basic Information
                            </div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Date (தேதி)</label>
                                    <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block font-primary">
                                        {category === 'Transport Charges' ? 'Transport Vehicle Type' : (category === 'Labour Wages' ? 'Link to Machine' : 'Category Type')}
                                    </label>
                                    <select name="vehicleType" className="form-select border-primary/20" value={formData.vehicleType} onChange={handleChange}>
                                        <option value="">{category === 'Labour Wages' ? 'None / General' : 'Select Category'}</option>
                                        {category === 'Transport Charges' ? (
                                            <>
                                                <option value="Lorry">Lorry</option>
                                                <option value="Tipper">Tipper</option>
                                                <option value="Tractor">Tractor</option>
                                                <option value="Trailer">Trailer</option>
                                                <option value="External Transport">External Transport</option>
                                                {/* Dynamic types from master */}
                                                {uniqueVehicleTypes.filter(t => !['Lorry', 'Tipper', 'Tractor', 'Trailer', 'External Transport'].includes(t)).map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </>
                                        ) : (
                                            uniqueVehicleTypes.map((type: string) => <option key={type} value={type}>{type}</option>)
                                        )}
                                    </select>
                                </div>
                                {formData.vehicleType && filteredVehicles.length > 0 && (
                                    <div>
                                        <label className="text-xs font-bold text-primary uppercase mb-2 block">Specific Number / ID (வண்டி எண்)</label>
                                        <select name="vehicleNumber" className="form-select border-primary animate-pulse-once" value={formData.vehicleNumber} onChange={handleChange}>
                                            <option value="">Select No / ID</option>
                                            {filteredVehicles.map((v: any) => (
                                                <option key={v._id} value={v.vehicleNumber || v.registrationNumber}>
                                                    {v.vehicleNumber || v.registrationNumber || v.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Expense Specific Details */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                {title} Specific Details
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {['Diesel', 'Explosive Cost', 'Transport Charges'].includes(category) && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">
                                                {category === 'Diesel' ? 'Litres (லிட்டர்)' : category === 'Explosive Cost' ? 'Quantity' : 'Trips / Qty'}
                                            </label>
                                            <input type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleChange} required step="any" min="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Rate per Unit (விலை)</label>
                                            <input type="number" name="rate" className="form-input" value={formData.rate} onChange={handleChange} required step="any" min="0" />
                                        </div>
                                        {category === 'Diesel' && (
                                            <div>
                                                <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Meter Reading (மீட்டர்)</label>
                                                <input type="text" name="meterReading" className="form-input" value={formData.meterReading} onChange={handleChange} placeholder="Odo / Hours" />
                                            </div>
                                        )}
                                    </>
                                )}

                                {category === 'Explosive Cost' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Site Location (இடம்)</label>
                                            <select name="site" className="form-select border-primary" value={formData.site} onChange={handleChange} required>
                                                <option value="">Select Location</option>
                                                <option value="Main Quarry Pit">Main Quarry Pit</option>
                                                <option value="Crusher Side">Crusher Side</option>
                                                <option value="Hill Blasting Zone">Hill Blasting Zone</option>
                                                <option value="Section A">Section A</option>
                                                <option value="Section B">Section B</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Explosive Type (வகை)</label>
                                            <select name="explosiveType" className="form-select" value={formData.explosiveType} onChange={handleChange} required>
                                                <option value="">Select Material</option>
                                                <option value="Gelatin">Gelatin</option>
                                                <option value="Detonator">Detonator</option>
                                                <option value="Fuse Wire">Fuse Wire</option>
                                                <option value="Booster">Booster</option>
                                                <option value="ANFO">ANFO</option>
                                                <option value="Blasting Powder">Blasting Powder</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Unit (அலகு)</label>
                                            <select name="unit" className="form-select" value={formData.unit} onChange={handleChange}>
                                                <option value="Nos">Nos</option>
                                                <option value="Kg">Kg</option>
                                                <option value="Meter">Meter</option>
                                                <option value="Box">Box</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block text-primary">Supplier Name (விநியோகஸ்தர்)</label>
                                            <input type="text" name="supplierName" className="form-input border-primary/20" value={formData.supplierName} onChange={handleChange} placeholder="ABC Explosives etc." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">License / Permit No</label>
                                            <input type="text" name="licenseNumber" className="form-input" value={formData.licenseNumber} onChange={handleChange} placeholder="Supplier / Blasting License" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block text-primary">Supervisor / Blaster Name</label>
                                            <input type="text" name="supervisorName" className="form-input border-primary/20" value={formData.supervisorName} onChange={handleChange} placeholder="Licensed Blaster Name" />
                                        </div>
                                    </>
                                )}

                                {category === 'Transport Charges' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Transport Type (வகை)</label>
                                            <select name="transportType" className="form-select border-primary/20 font-medium" value={formData.transportType} onChange={handleChange}>
                                                <option value="">Select Type</option>
                                                <option value="Material Transport">Material Transport</option>
                                                <option value="Machine Transport">Machine Transport</option>
                                                <option value="Diesel Delivery">Diesel Delivery</option>
                                                <option value="Spare Parts Delivery">Spare Parts Delivery</option>
                                                <option value="Equipment Shifting">Equipment Shifting</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">From Location (எங்கிருந்து)</label>
                                            <input type="text" name="fromLocation" className="form-input" value={formData.fromLocation} onChange={handleChange} placeholder="e.g. Salem Yard" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">To Location (எங்கு)</label>
                                            <input type="text" name="toLocation" className="form-input text-primary font-medium" value={formData.toLocation} onChange={handleChange} placeholder="e.g. Client Site" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Driver Name (ஓட்டுனர் பெயர்)</label>
                                            <input type="text" name="driverName" className="form-input" value={formData.driverName} onChange={handleChange} placeholder="Enter name..." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Transport Owner / Vendor</label>
                                            <input type="text" name="vendorName" className="form-input" value={formData.vendorName} onChange={handleChange} placeholder="Siva Transports etc." />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Load Details (சுமை விவரம்)</label>
                                            <input type="text" name="loadDetails" className="form-input" value={formData.loadDetails} onChange={handleChange} placeholder="e.g. 10 Units Blue Metal" />
                                        </div>
                                    </>
                                )}

                                {category === 'Labour Wages' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Labour Name</label>
                                            <select name="labourName" className="form-select" value={formData.labourName} onChange={handleChange} required>
                                                <option value="">Select Labour</option>
                                                {labours.map((l: any) => <option key={l._id} value={l.name}>{l.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Work Type</label>
                                            <select name="workType" className="form-select bg-gray-50 dark:bg-dark-light/10" value={formData.workType} onChange={handleChange} disabled>
                                                <option value="">Select Work</option>
                                                <option value="Machine Operator">Machine Operator</option>
                                                <option value="Helper">Helper</option>
                                                <option value="Driver">Driver</option>
                                                <option value="Supervisor">Supervisor</option>
                                                <option value="Cleaner">Cleaner</option>
                                                <option value="Office Staff">Office Staff</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Wage Type</label>
                                            <select name="wageType" className="form-select bg-gray-50 dark:bg-dark-light/10" value={formData.wageType} onChange={handleChange} disabled>
                                                <option value="">Select Type</option>
                                                <option value="Daily Wage">Daily Wage</option>
                                                <option value="Monthly Salary">Monthly Salary</option>
                                                <option value="Overtime">Overtime</option>
                                                <option value="Contract Payment">Contract Payment</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Quantity / Days</label>
                                            <input type="number" name="quantity" className="form-input bg-gray-50 dark:bg-dark-light/10" value={formData.quantity} onChange={handleChange} readOnly />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Rate (Monthly/Daily)</label>
                                            <input type="number" name="rate" className="form-input bg-gray-50 dark:bg-dark-light/10" value={formData.rate} onChange={handleChange} readOnly />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Per Day Salary</label>
                                            <input type="text" name="perDaySalary" className="form-input bg-gray-50 dark:bg-dark-light/10" value={formData.perDaySalary} readOnly />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block text-danger font-bold">Advance Deduction</label>
                                            <input type="number" name="advanceDeduction" className="form-input bg-gray-50 dark:bg-dark-light/10 border-danger/20" value={formData.advanceDeduction} onChange={handleChange} readOnly />
                                        </div>
                                        <div className="bg-success/5 p-3 rounded-lg border border-success/20 sm:col-span-2 lg:col-span-1">
                                            <label className="text-xs font-bold text-success uppercase mb-1 block">Net Payable</label>
                                            <div className="text-xl font-bold text-success">₹ {parseFloat(formData.netPay || '0').toLocaleString()}</div>
                                        </div>
                                    </>
                                )}

                                {category === 'Machine Maintenance' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Maintenance Type</label>
                                            <select name="maintenanceType" className="form-select" value={formData.maintenanceType} onChange={handleChange} required>
                                                <option value="">Select Type</option>
                                                <option value="Service (General Service)">Service (General Service)</option>
                                                <option value="Oil Change">Oil Change</option>
                                                <option value="Spare Part Replacement">Spare Part Replacement</option>
                                                <option value="Breakdown Repair">Breakdown Repair</option>
                                                <option value="Tyre Change">Tyre Change</option>
                                                <option value="Welding / Fabrication">Welding / Fabrication</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Spare Parts Cost</label>
                                            <input type="number" name="sparePartsCost" className="form-input" value={formData.sparePartsCost} onChange={handleChange} min="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Labour Charge</label>
                                            <input type="number" name="labourCharge" className="form-input" value={formData.labourCharge} onChange={handleChange} min="0" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Meter Reading (Hrs)</label>
                                            <input type="text" name="meterReading" className="form-input" value={formData.meterReading} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block text-primary">Next Service Due (அடுத்த சர்வீஸ்)</label>
                                            <input type="date" name="nextServiceDate" className="form-input border-primary/20" value={formData.nextServiceDate} onChange={handleChange} />
                                        </div>
                                    </>
                                )}

                                {category === 'Office & Misc' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Expense Category (செலவு வகை)</label>
                                            <select name="officeExpenseType" className="form-select border-primary/20" value={formData.officeExpenseType} onChange={handleChange} required>
                                                <option value="">Select Category</option>
                                                <option value="Stationery">Stationery</option>
                                                <option value="Electricity (EB Bill)">Electricity (EB Bill)</option>
                                                <option value="Water Bill">Water Bill</option>
                                                <option value="Internet Bill">Internet Bill</option>
                                                <option value="Tea / Snacks">Tea / Snacks</option>
                                                <option value="Cleaning">Cleaning</option>
                                                <option value="Courier">Courier</option>
                                                <option value="Printing">Printing</option>
                                                <option value="Office Maintenance">Office Maintenance</option>
                                                <option value="Miscellaneous">Miscellaneous</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Paid To (யாருக்கு)</label>
                                            <input type="text" name="paidTo" className="form-input text-primary" value={formData.paidTo} onChange={handleChange} placeholder="e.g. EB Office / Shop Name" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Bill Number (வேண்டினால்)</label>
                                            <input type="text" name="billNumber" className="form-input" value={formData.billNumber} onChange={handleChange} placeholder="Invoice No." />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="mt-4">
                                <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Remarks / Description</label>
                                <textarea name="description" className="form-textarea min-h-[100px]" value={formData.description} onChange={handleChange} placeholder="Enter additional details..."></textarea>
                            </div>
                        </div>

                        {/* Section 3: Payment and Attachment */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconSave className="w-4 h-4" />
                                Payment & Attachment
                            </div>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Payment Mode</label>
                                    <select name="paymentMode" className="form-select border-primary" value={formData.paymentMode} onChange={handleChange}>
                                        <option value="Cash">Cash (ரொக்கம்)</option>
                                        <option value="Credit">Credit (கடன்)</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="UPI">UPI</option>
                                        <option value="G-Pay">G-Pay</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Total Amount (மொத்தம்)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            className="form-input pl-8 font-bold text-lg border-primary text-primary"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            required
                                            readOnly={['Diesel', 'Explosive Cost', 'Transport Charges', 'Labour Wages'].includes(category)}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Bill Attachment</label>
                                    <div className="flex items-center gap-2">
                                        <input type="file" className="form-input flex-1" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                                        {formData.billUrl && (
                                            <a
                                                href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}${formData.billUrl}`}
                                                target="_blank"
                                                className="btn btn-outline-info p-2"
                                                title="View Bill"
                                            >
                                                <IconEdit className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-[#ebedf2] dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger px-8" onClick={() => { setFormView(false); setEditMode(false); }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/20">
                                <IconSave className="ltr:mr-2 rtl:ml-2" />
                                {editMode ? 'Update Record' : 'Save Record'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Modal remains a popup for safety confirmation */}
            <Transition appear show={deleteModal} as={Fragment}>
                <Dialog as="div" open={deleteModal} onClose={() => setDeleteModal(false)}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60 z-[999]" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">Confirm Delete</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => setDeleteModal(false)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
                                        <div className="mt-8 flex items-center justify-end">
                                            <button type="button" className="btn btn-outline-primary" onClick={() => setDeleteModal(false)}>Cancel</button>
                                            <button type="button" className="btn btn-danger ltr:ml-4 rtl:mr-4" onClick={handleDelete}>Delete Permanently</button>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div >
    );
};

export default ExpenseCategoryManager;
