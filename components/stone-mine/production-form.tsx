'use client';
import React, { useState } from 'react';
import IconSave from '@/components/icon/icon-save';

const ProductionForm = () => {
    const [formData, setFormData] = useState({
        stoneType: '20mm',
        quantity: '',
        unit: 'Tons',
        date: new Date().toISOString().split('T')[0],
        machineUsed: '',
    });

    const stoneTypes = ['20mm', '40mm', '6mm', 'M-Sand', 'P-Sand', 'GSB', 'WMM', 'Dust'];

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // Implement API call for production
        alert('Production data saved locally (API pending)');
    };

    return (
        <div className="panel">
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">உற்பத்தி பதிவு (Production Entry)</h5>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="stoneType">கல் வகை (Stone Type)</label>
                        <select id="stoneType" name="stoneType" className="form-select" value={formData.stoneType} onChange={handleChange}>
                            {stoneTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
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
                        <label htmlFor="quantity">அளவு (Quantity)</label>
                        <input id="quantity" type="number" name="quantity" placeholder="Quantity" className="form-input" value={formData.quantity} onChange={handleChange} required />
                    </div>
                    <div>
                        <label htmlFor="unit">அலகு (Unit)</label>
                        <select id="unit" name="unit" className="form-select" value={formData.unit} onChange={handleChange}>
                            <option value="Tons">Tons</option>
                            <option value="Units">Units</option>
                            <option value="Loads">Loads</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="machineUsed">பயன்படுத்தப்பட்ட இயந்திரம் (Machine Used)</label>
                    <input id="machineUsed" type="text" name="machineUsed" placeholder="Crusher / JCB No" className="form-input" value={formData.machineUsed} onChange={handleChange} />
                </div>

                <div className="flex items-center justify-end">
                    <button type="submit" className="btn btn-primary gap-2">
                        <IconSave className="h-5 w-5" />
                        Save Production
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductionForm;
