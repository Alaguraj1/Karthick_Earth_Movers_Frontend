'use client';
import React, { useState, useEffect } from 'react';
import IconPlus from '@/components/icon/icon-plus';
import IconSave from '@/components/icon/icon-save';
import IconEdit from '@/components/icon/icon-edit';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import axios from 'axios';

const LabourListPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formView, setFormView] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        workType: 'Helper',
        wage: '',
        wageType: 'Daily',
        joiningDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'active'
    });

    const workTypes = ['Helper', 'Machine Operator', 'Driver', 'Supervisor', 'Cleaner', 'Security', 'Office Staff'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: json } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/labour`);
            if (json.success) setData(json.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const endpoint = editItem
                ? `${process.env.NEXT_PUBLIC_API_URL}/labour/${editItem._id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/labour`;

            const method = editItem ? 'put' : 'post';

            const { data: json } = await axios[method](endpoint, formData);
            if (json.success) {
                alert(editItem ? 'Updated successfully!' : 'Added successfully!');
                resetForm();
                fetchData();
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error saving data');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            mobile: '',
            address: '',
            workType: 'Helper',
            wage: '',
            wageType: 'Daily',
            joiningDate: new Date().toISOString().split('T')[0],
            description: '',
            status: 'active'
        });
        setEditItem(null);
        setFormView(false);
    };

    const handleEdit = (item: any) => {
        setEditItem(item);
        setFormData({
            name: item.name,
            mobile: item.mobile || '',
            address: item.address || '',
            workType: item.workType || 'Helper',
            wage: item.wage || '',
            wageType: item.wageType || 'Daily',
            joiningDate: item.joiningDate ? new Date(item.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: item.description || '',
            status: item.status || 'active'
        });
        setFormView(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this labour profile?')) return;
        try {
            const { data: json } = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/labour/${id}`);
            if (json.success) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><a href="/" className="text-primary hover:underline">Dashboard</a></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Labour Management</span></li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Labour List</span></li>
            </ul>

            {formView ? (
                <div className="panel">
                    <div className="mb-8 flex items-center justify-between border-b border-[#ebedf2] dark:border-[#1b2e4b] pb-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm ltr:mr-4 rtl:ml-4 flex items-center justify-center rounded-full w-10 h-10 p-0"
                                onClick={resetForm}
                            >
                                <IconArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h5 className="text-xl font-bold dark:text-white-light">{editItem ? 'Edit Labour Profile' : 'Add New Labour'}</h5>
                                <p className="text-white-dark text-xs mt-1">தொழிலாளர் விவரங்களைப் பதிவு செய்யவும்</p>
                            </div>
                        </div>
                    </div>

                    <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconPlus className="w-4 h-4" />
                                Basic Information
                            </div>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Labour Name (பெயர்)</label>
                                    <input type="text" name="name" className="form-input border-primary" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Mobile number (தொலைபேசி)</label>
                                    <input type="text" name="mobile" className="form-input" value={formData.mobile} onChange={handleChange} placeholder="10-digit number" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Joining Date (சேர்ந்த நாள்)</label>
                                    <input type="date" name="joiningDate" className="form-input" value={formData.joiningDate} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Address (முகவரி)</label>
                                    <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} placeholder="Full address" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Work Type (வேலை வகை)</label>
                                    <select name="workType" className="form-select" value={formData.workType} onChange={handleChange}>
                                        {workTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Wage Amount (சம்பளம்)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                        <input type="number" name="wage" className="form-input pl-8 font-bold border-primary" value={formData.wage} onChange={handleChange} required placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-white-dark uppercase mb-2 block">Wage Type (சம்பள முறை)</label>
                                    <select name="wageType" className="form-select" value={formData.wageType} onChange={handleChange}>
                                        <option value="Daily">Daily Wage (தினக்கூலி)</option>
                                        <option value="Monthly">Monthly Salary (மாதச் சம்பளம்)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs tracking-wider border-b border-primary/10 pb-2">
                                <IconEdit className="w-4 h-4" />
                                Remarks
                            </div>
                            <textarea name="description" className="form-textarea min-h-[100px]" value={formData.description} onChange={handleChange} placeholder="Optional notes..."></textarea>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-8 border-t border-[#ebedf2] dark:border-[#1b2e4b]">
                            <button type="button" className="btn btn-outline-danger px-8" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/20">
                                <IconSave className="ltr:mr-2 rtl:ml-2" />
                                {editItem ? 'Update Profile' : 'Save Labour'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="panel">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <h5 className="text-xl font-bold dark:text-white-light">Labour List (தொழிலாளர் பட்டியல்)</h5>
                        <button type="button" className="btn btn-primary shadow-lg" onClick={() => setFormView(true)}>
                            <IconPlus className="mr-2" /> Add New Labour
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Labour Name</th>
                                    <th>Work Type</th>
                                    <th>Mobile</th>
                                    <th>Wage Rate</th>
                                    <th>Join Date</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-10 font-bold uppercase text-white-dark">No labours found</td></tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item._id}>
                                            <td className="font-bold text-primary">{item.name}</td>
                                            <td>
                                                <span className="badge badge-outline-info">{item.workType}</span>
                                            </td>
                                            <td>{item.mobile || '-'}</td>
                                            <td>
                                                <div className="font-semibold">₹{item.wage}</div>
                                                <div className="text-[10px] text-white-dark italic">{item.wageType}</div>
                                            </td>
                                            <td>{new Date(item.joiningDate).toLocaleDateString()}</td>
                                            <td className="text-center">
                                                <div className="flex justify-center items-center gap-3">
                                                    <button type="button" className="hover:text-primary" onClick={() => handleEdit(item)}>
                                                        <IconEdit className="h-5 w-5" />
                                                    </button>
                                                    <button type="button" className="hover:text-danger" onClick={() => handleDelete(item._id)}>
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

export default LabourListPage;
