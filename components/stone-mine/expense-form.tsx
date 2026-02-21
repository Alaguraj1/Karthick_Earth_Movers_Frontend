'use client';
import React, { useState, useEffect } from 'react';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';

const ExpenseForm = () => {
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        vehicleOrMachine: '',
        quantity: '',
        rate: '',
        paymentMode: 'Cash',
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [catRes, vehRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/expense-categories`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`)
                ]);
                const catData = await catRes.json();
                const vehData = await vehRes.json();

                if (catData.success) {
                    setCategories(catData.data);
                    if (catData.data.length > 0) {
                        setFormData(prev => ({ ...prev, category: catData.data[0].name }));
                    }
                }
                if (vehData.success) setVehicles(vehData.data);
            } catch (error) {
                console.error('Error fetching master data:', error);
            }
        };
        fetchMasterData();
    }, []);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                alert('Expense added successfully!');
                setFormData({
                    category: categories.length > 0 ? categories[0].name : '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    vehicleOrMachine: '',
                    quantity: '',
                    rate: '',
                    paymentMode: 'Cash',
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">புதிய செலவு பதிவு (Add New Expense)</h5>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="category">வகை (Category)</label>
                        <select id="category" name="category" className="form-select" value={formData.category} onChange={handleChange}>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date">தேதி (Date)</label>
                        <input id="date" type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label htmlFor="amount">தொகை (Amount)</label>
                        <input id="amount" type="number" name="amount" placeholder="₹" className="form-input" value={formData.amount} onChange={handleChange} required />
                    </div>
                    {formData.category === 'Diesel' && (
                        <>
                            <div>
                                <label htmlFor="quantity">அளவு (Litres)</label>
                                <input id="quantity" type="number" name="quantity" placeholder="Litres" className="form-input" value={formData.quantity} onChange={handleChange} />
                            </div>
                            <div>
                                <label htmlFor="vehicleOrMachine">வாகனம்/இயந்திரம் (Vehicle/Machine)</label>
                                <select id="vehicleOrMachine" name="vehicleOrMachine" className="form-select" value={formData.vehicleOrMachine} onChange={handleChange}>
                                    <option value="">Select Vehicle / Machine</option>
                                    {vehicles.map((veh) => (
                                        <option key={veh._id} value={veh.name}>
                                            {veh.name} {veh.vehicleNumber ? `(${veh.vehicleNumber})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <label htmlFor="description">விவரம் (Description)</label>
                    <textarea id="description" name="description" rows={3} className="form-textarea" placeholder="More details..." value={formData.description} onChange={handleChange}></textarea>
                </div>

                <div className="flex items-center justify-end">
                    <button type="button" className="btn btn-outline-danger gap-2 ltr:mr-2 rtl:ml-2">
                        <IconX className="h-5 w-5" />
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary gap-2">
                        <IconSave className="h-5 w-5" />
                        Save Expense
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
