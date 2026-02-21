'use client';
import React, { useEffect, useState, Fragment } from 'react';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconX from '@/components/icon/icon-x';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import IconSave from '@/components/icon/icon-save';
import IconPlus from '@/components/icon/icon-plus';

interface ExpenseCategoryManagerProps {
    category: string;
    title: string;
}

const ExpenseCategoryManager = ({ category, title }: ExpenseCategoryManagerProps) => {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehicles] = useState<any[]>([]);

    // Modal States
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [addModal, setAddModal] = useState(false);

    // Form States
    const [selectedExpense, setSelectedExpense] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        category: category,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        vehicleOrMachine: '',
        quantity: '',
        rate: '',
        paymentMode: 'Cash',
        meterReading: '',
        billUrl: '',
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses?category=${category}`);
            const data = await res.json();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`);
            const data = await res.json();
            if (data.success) setVehicles(data.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchVehicles();
    }, [category]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (category === 'Diesel' && (name === 'quantity' || name === 'rate')) {
                const qty = parseFloat(name === 'quantity' ? value : prev.quantity) || 0;
                const rate = parseFloat(name === 'rate' ? value : prev.rate) || 0;
                updated.amount = (qty * rate).toString();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, billUrl }),
            });
            const data = await res.json();
            if (data.success) {
                setAddModal(false);
                fetchExpenses();
                resetForm();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${selectedExpense._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, billUrl }),
            });
            const data = await res.json();
            if (data.success) {
                setEditModal(false);
                fetchExpenses();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/${selectedExpense._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
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
            quantity: '',
            rate: '',
            paymentMode: 'Cash',
            meterReading: '',
            billUrl: '',
        });
        setSelectedFile(null);
    };

    const openEditModal = (expense: any) => {
        setSelectedExpense(expense);
        setFormData({
            category: expense.category,
            amount: expense.amount.toString(),
            date: expense.date.split('T')[0],
            description: expense.description || '',
            vehicleOrMachine: expense.vehicleOrMachine || '',
            quantity: expense.quantity?.toString() || '',
            rate: expense.rate?.toString() || '',
            paymentMode: expense.paymentMode || 'Cash',
            meterReading: expense.meterReading || '',
            billUrl: expense.billUrl || '',
        });
        setSelectedFile(null);
        setEditModal(true);
    };

    const openDeleteModal = (expense: any) => {
        setSelectedExpense(expense);
        setDeleteModal(true);
    };

    return (
        <div className="panel mt-6">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">{title}</h5>
                <button type="button" className="btn btn-primary gap-2" onClick={() => { resetForm(); setAddModal(true); }}>
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

            {/* Add / Edit Modal */}
            <Transition appear show={addModal || editModal} as={Fragment}>
                <Dialog as="div" open={addModal || editModal} onClose={() => { setAddModal(false); setEditModal(false); }}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60 z-[999]" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-start justify-center px-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                        <div className="text-lg font-bold">{editModal ? 'Edit Record' : 'Add New Record'}</div>
                                        <button type="button" className="text-white-dark hover:text-dark" onClick={() => { setAddModal(false); setEditModal(false); }}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={editModal ? handleUpdate : handleAdd} className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label>Date</label>
                                                    <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label>Vehicle/Machine</label>
                                                    <select name="vehicleOrMachine" className="form-select" value={formData.vehicleOrMachine} onChange={handleChange}>
                                                        <option value="">Select Vehicle</option>
                                                        {vehicles.map((v: any) => <option key={v._id} value={v.name}>{v.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {category === 'Diesel' && (
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                    <div>
                                                        <label>Litres</label>
                                                        <input type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleChange} required />
                                                    </div>
                                                    <div>
                                                        <label>Rate</label>
                                                        <input type="number" name="rate" className="form-input" value={formData.rate} onChange={handleChange} required />
                                                    </div>
                                                    <div>
                                                        <label>Meter Reading</label>
                                                        <input type="text" name="meterReading" className="form-input" value={formData.meterReading} onChange={handleChange} placeholder="Odo / Hours" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label>Amount</label>
                                                    <input type="number" name="amount" className="form-input font-bold text-primary" value={formData.amount} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label>Payment Mode</label>
                                                    <select name="paymentMode" className="form-select" value={formData.paymentMode} onChange={handleChange}>
                                                        <option value="Cash">Cash</option>
                                                        <option value="Credit">Credit</option>
                                                        <option value="Bank Transfer">Bank Transfer</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label>Bill / Invoice (பில் பதிவேற்ற)</label>
                                                <input type="file" className="form-input" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                                                {formData.billUrl && (
                                                    <a href={`${(process.env.NEXT_PUBLIC_API_URL || '').replace('/api', '')}${formData.billUrl}`} target="_blank" className="text-xs text-primary underline mt-1 block">View Current Bill</a>
                                                )}
                                            </div>

                                            <div>
                                                <label>Description</label>
                                                <textarea name="description" className="form-textarea" rows={3} value={formData.description} onChange={handleChange}></textarea>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => { setAddModal(false); setEditModal(false); }}>Cancel</button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    <IconSave className="ltr:mr-2 rtl:ml-2" />
                                                    {editModal ? 'Update' : 'Save'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Modal */}
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
        </div>
    );
};

export default ExpenseCategoryManager;
