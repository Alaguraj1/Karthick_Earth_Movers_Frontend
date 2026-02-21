'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';

const MasterManagement = () => {
    const [activeTab, setActiveTab] = useState('expense-categories');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', description: '', type: 'Vehicle', vehicleNumber: '' });

    const tabs = [
        { id: 'expense-categories', label: 'Expense Categories (செலவு வகைகள்)' },
        { id: 'income-sources', label: 'Income Sources (வருமான வகைகள்)' },
        { id: 'vehicles', label: 'Vehicles & Machines (வாகனப்பிரிவு)' },
        { id: 'customers', label: 'Customers (வாடிக்கையாளர்)' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}`);
            const json = await res.json();
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/${activeTab}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            const json = await res.json();
            if (json.success) {
                alert('Added successfully!');
                setNewItem({ name: '', description: '', type: 'Vehicle', vehicleNumber: '' });
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

            <div className="flex flex-wrap border-b border-white-light dark:border-[#191e3a] mb-5">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${activeTab === tab.id ? '!border-primary text-primary' : ''} -mb-[1px] block border-b border-transparent p-3.5 py-2 hover:text-primary`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="panel">
                    <h5 className="mb-5 text-lg font-semibold">புதிதாக சேர்க்க (Add New)</h5>
                    <form className="space-y-4" onSubmit={handleAdd}>
                        <div>
                            <label htmlFor="name">பெயர் (Name)</label>
                            <input id="name" type="text" className="form-input" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required />
                        </div>
                        {activeTab === 'vehicles' && (
                            <>
                                <div>
                                    <label htmlFor="vehNum">வாகன எண் (Vehicle No - Optional)</label>
                                    <input id="vehNum" type="text" className="form-input" value={newItem.vehicleNumber} onChange={(e) => setNewItem({ ...newItem, vehicleNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="type">வகை (Type)</label>
                                    <select id="type" className="form-select" value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}>
                                        <option value="Vehicle">Vehicle</option>
                                        <option value="Machine">Machine</option>
                                    </select>
                                </div>
                            </>
                        )}
                        {(activeTab === 'expense-categories' || activeTab === 'income-sources') && (
                            <div>
                                <label htmlFor="desc">விவரம் (Description)</label>
                                <textarea id="desc" className="form-textarea" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}></textarea>
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary gap-2">
                            <IconPlus /> Add to Master
                        </button>
                    </form>
                </div>

                <div className="panel">
                    <h5 className="mb-5 text-lg font-semibold">தற்போதைய பட்டியல் (Current List)</h5>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    {activeTab === 'vehicles' && <th>Number / Type</th>}
                                    {activeTab !== 'vehicles' && <th>Description</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={2}>Loading...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={2}>No data found.</td></tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item._id}>
                                            <td>{item.name}</td>
                                            {activeTab === 'vehicles' && (
                                                <td>
                                                    {item.vehicleNumber || '-'} <span className="badge badge-outline-primary ml-2">{item.type}</span>
                                                </td>
                                            )}
                                            {activeTab !== 'vehicles' && <td>{item.description || '-'}</td>}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterManagement;
