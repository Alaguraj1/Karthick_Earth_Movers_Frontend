'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconArrowLeft from '@/components/icon/icon-arrow-left';

import axios from 'axios';

const MasterManagement = () => {
    const [activeTab, setActiveTab] = useState('expense-categories');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '' });
    const [formView, setFormView] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const tabs = [
        { id: 'expense-categories', label: 'Expense Categories (செலவு வகைகள்)' },
        { id: 'income-sources', label: 'Income Sources (வருமான வகைகள்)' },
        { id: 'vehicles', label: 'Vehicles & Machines (வாகனப்பிரிவு)' },
        { id: 'customers', label: 'Customers (வாடிக்கையாளர்)' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: json } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}`);
            if (json.success) setData(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleAdd = async (e: any) => {
        e.preventDefault();
        try {
            const endpoint = editItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}/${editItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}`;

            const method = editItem ? 'put' : 'post';

            const { data: json } = await axios[method](endpoint, newItem);
            if (json.success) {
                alert(editItem ? 'Updated successfully!' : 'Added successfully!');
                setNewItem({ name: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '' });
                setEditItem(null);
                setFormView(false);
                fetchData();
            }
        } catch (error) {
            console.error(error);
            alert('Error saving data');
        }
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setNewItem({
            name: item.name,
            description: item.description || '',
            type: item.type || 'Vehicle',
            vehicleNumber: item.vehicleNumber || '',
            mobile: item.mobile || '',
        });
        setFormView(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            const { data: json } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}/${id}`);
            if (json.success) {
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Masters</span></li>
            </ul>

            <div className="panel overflow-hidden border-0 p-0 mb-5">
                <div className="flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${activeTab === tab.id ? '!border-primary text-primary font-bold' : ''} -mb-[1px] block border-b-2 border-transparent p-4 hover:text-primary transition-all`}
                            onClick={() => { setActiveTab(tab.id); setFormView(false); }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {formView ? (
                <div className="panel">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-full w-10 h-10 p-0"
                                onClick={() => { setFormView(false); setEditItem(null); }}
                            >
                                <IconArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h5 className="text-xl font-bold dark:text-white-light">{editItem ? 'Edit Master Record' : 'Add New Master Entry'}</h5>
                                <p className="text-white-dark text-xs mt-1">Configure {tabs.find(t => t.id === activeTab)?.label.split('(')[0].toLowerCase()} details</p>
                            </div>
                        </div>
                    </div>

                    <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleAdd}>
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconPlus className="w-4 h-4" />
                                Basic Details
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="text-xs font-bold text-white-dark uppercase mb-2 block">பெயர் (Title / Name)</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="form-input border-primary"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        required
                                        placeholder="Enter full name or title..."
                                    />
                                </div>

                                {activeTab === 'vehicles' && (
                                    <>
                                        <div>
                                            <label htmlFor="vehNum" className="text-xs font-bold text-white-dark uppercase mb-2 block">வாகன எண் (Vehicle No - Optional)</label>
                                            <input
                                                id="vehNum"
                                                type="text"
                                                className="form-input"
                                                value={newItem.vehicleNumber}
                                                onChange={(e) => setNewItem({ ...newItem, vehicleNumber: e.target.value })}
                                                placeholder="e.g., TN 99 XX 1234"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="type" className="text-xs font-bold text-white-dark uppercase mb-2 block">பிரிவு (Category)</label>
                                            <select
                                                id="type"
                                                className="form-select border-primary"
                                                value={newItem.type}
                                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                                            >
                                                <option value="Vehicle">Vehicle (வாகனம்)</option>
                                                <option value="Machine">Machine (இயந்திரம்)</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'labours' && (
                                    <div className="md:col-span-2">
                                        <label htmlFor="mobile" className="text-xs font-bold text-white-dark uppercase mb-2 block">தொலைபேசி எண் (Mobile - Optional)</label>
                                        <input
                                            id="mobile"
                                            type="text"
                                            className="form-input"
                                            value={newItem.mobile}
                                            onChange={(e) => setNewItem({ ...newItem, mobile: e.target.value })}
                                            placeholder="Enter 10-digit mobile number..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                Additional Information
                            </div>
                            <div>
                                <label htmlFor="desc" className="text-xs font-bold text-white-dark uppercase mb-2 block">விவரம் (Description / Remarks)</label>
                                <textarea
                                    id="desc"
                                    className="form-textarea min-h-[120px]"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Enter any additional notes or details here..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-[#ebedf2] dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger px-8" onClick={() => { setFormView(false); setEditItem(null); }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/20">
                                <IconSave className="ltr:mr-2 rtl:ml-2" />
                                {editItem ? 'Update Master' : 'Save Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        <h5 className="text-xl font-bold dark:text-white-light">
                            {tabs.find(t => t.id === activeTab)?.label.split('(')[0]} List
                        </h5>
                        <button type="button" className="btn btn-primary shadow-lg" onClick={() => {
                            setNewItem({ name: '', description: '', type: 'Vehicle', vehicleNumber: '', mobile: '' });
                            setEditItem(null);
                            setFormView(true);
                        }}>
                            <IconPlus className="mr-2" /> Add New
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    {activeTab === 'vehicles' && <th>Number / Type</th>}
                                    {activeTab === 'labours' && <th>Mobile</th>}
                                    {activeTab !== 'vehicles' && activeTab !== 'labours' && <th>Description</th>}
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-white-dark uppercase font-bold">No records found</td></tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item._id}>
                                            <td className="font-semibold">{item.name}</td>
                                            {activeTab === 'vehicles' && (
                                                <td>
                                                    <span className="font-bold">{item.vehicleNumber || '-'}</span>
                                                    <span className={`badge ${item.type === 'Machine' ? 'badge-outline-warning' : 'badge-outline-primary'} ml-3`}>{item.type}</span>
                                                </td>
                                            )}
                                            {activeTab === 'labours' && <td>{item.mobile || '-'}</td>}
                                            {activeTab !== 'vehicles' && activeTab !== 'labours' && (
                                                <td className="text-white-dark">{item.description || '-'}</td>
                                            )}
                                            <td className="text-center">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button type="button" className="hover:text-primary transition-all" onClick={() => handleEdit(item)}>
                                                        <IconEdit className="h-5 w-5" />
                                                    </button>
                                                    <button type="button" className="hover:text-danger transition-all" onClick={() => handleDelete(item._id)}>
                                                        <IconTrashLines className="h-5 w-5" />
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
        </div>
    );
};

export default MasterManagement;
