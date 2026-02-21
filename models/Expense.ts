import mongoose, { Schema, model, models } from 'mongoose';

const ExpenseSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
            enum: ['Diesel', 'Machine Maintenance', 'Labour Wages', 'Explosive Cost', 'Transport Charges', 'Office & Misc'],
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        description: {
            type: String,
        },
        vehicleOrMachine: {
            type: String, // For diesel/maintenance
        },
        quantity: {
            type: Number, // For diesel (litres)
        },
        rate: {
            type: Number, // For diesel
        },
        paymentMode: {
            type: String,
            enum: ['Cash', 'Credit', 'Bank Transfer'],
            default: 'Cash',
        },
        billUrl: {
            type: String,
        },
        staffId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Expense = models.Expense || model('Expense', ExpenseSchema);

export default Expense;
