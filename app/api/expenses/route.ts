import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET() {
    await dbConnect();
    try {
        const expenses = await Expense.find({}).sort({ date: -1 });
        return NextResponse.json({ success: true, data: expenses });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const expense = await Expense.create(body);
        return NextResponse.json({ success: true, data: expense }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
