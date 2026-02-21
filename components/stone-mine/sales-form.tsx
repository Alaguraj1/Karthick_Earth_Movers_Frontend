'use client';
import React, { useState, useEffect } from 'react';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';

const SalesForm = () => {
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        vehicleNumber: '',
        paymentStatus: 'Paid',
        description: '',
    });

    const [sources, setSources] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [srcRes, custRes, vehRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/income-sources`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/customers`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/master/vehicles`)
                ]);
                const srcData = await srcRes.json();
                const custData = await custRes.json();
                const vehData = await vehRes.json();

                if (srcData.success) {
                    setSources(srcData.data);
                    if (srcData.data.length > 0) setFormData(prev => ({ ...prev, source: srcData.data[0].name }));
                }
                if (custData.success) setCustomers(custData.data);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                alert('Income recorded successfully!');
                setFormData({
                    source: sources.length > 0 ? sources[0].name : '',
                    amount: '',
                    date: new Date().toISOString().split('T')[0],
                    customerName: '',
                    vehicleNumber: '',
                    paymentStatus: 'Paid',
                    description: '',
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">புதிய விற்பனை/வருமானம் (New Sales/Income)</h5>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="source">வகை (Source)</label>
                        <select id="source" name="source" className="form-select" value={formData.source} onChange={handleChange}>
                            {sources.map((src) => (
                                <option key={src._id} value={src.name}>
                                    {src.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date">தேதி (Date)</label>
                        <input id="date" type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="customerName">வாடிக்கையாளர் பெயர் (Customer Name)</label>
                        <select id="customerName" name="customerName" className="form-select" value={formData.customerName} onChange={handleChange}>
                            <option value="">Select Customer</option>
                            {customers.map((cust) => (
                                <option key={cust._id} value={cust.name}>
                                    {cust.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="vehicleNumber">வாகன எண் (Vehicle No)</label>
                        <select id="vehicleNumber" name="vehicleNumber" className="form-select" value={formData.vehicleNumber} onChange={handleChange}>
                            <option value="">Select Vehicle</option>
                            {vehicles.map((veh) => (
                                <option key={veh._id} value={veh.vehicleNumber || veh.name}>
                                    {veh.vehicleNumber ? `${veh.vehicleNumber} (${veh.name})` : veh.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="amount">தொகை (Amount)</label>
                        <input id="amount" type="number" name="amount" placeholder="₹" className="form-input" value={formData.amount} onChange={handleChange} required />
                    </div>
                    <div>
                        <label htmlFor="paymentStatus">நிலை (Status)</label>
                        <select id="paymentStatus" name="paymentStatus" className="form-select" value={formData.paymentStatus} onChange={handleChange}>
                            <option value="Paid">Paid (செலுத்தப்பட்டது)</option>
                            <option value="Pending">Pending (நிலுவை)</option>
                            <option value="Partial">Partial (பகுதி)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="description">குறிப்பு (Description)</label>
                    <textarea id="description" name="description" rows={3} className="form-textarea" placeholder="More details..." value={formData.description} onChange={handleChange}></textarea>
                </div>

                <div className="flex items-center justify-end">
                    <button type="button" className="btn btn-outline-danger gap-2 ltr:mr-2 rtl:ml-2">
                        <IconX className="h-5 w-5" />
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary gap-2">
                        <IconSave className="h-5 w-5" />
                        Save Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesForm;
