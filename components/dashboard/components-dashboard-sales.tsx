'use client';
import Dropdown from '@/components/dropdown';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconBolt from '@/components/icon/icon-bolt';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconCreditCard from '@/components/icon/icon-credit-card';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconInbox from '@/components/icon/icon-inbox';
import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconTag from '@/components/icon/icon-tag';
import IconBellBing from '@/components/icon/icon-bell-bing';
import IconInfoCircle from '@/components/icon/icon-info-circle';
import IconBox from '@/components/icon/icon-box';
import IconAlertTriangle from '@/components/icon/icon-info-triangle';
import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ComponentsDashboardSales = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: res } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/reports/dashboard-summary`);
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Revenue Chart Data Processing - Synchronized Alignment
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const last12Months: any[] = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last12Months.push({
            month: d.getMonth() + 1,
            year: d.getFullYear(),
            label: months[d.getMonth()]
        });
    }

    const revenueChartSeries = [
        {
            name: 'Income',
            data: last12Months.map(m => {
                const found = data?.revenueChart?.revenueData?.find((rd: any) => rd._id.month === m.month && rd._id.year === m.year);
                return found ? found.total : 0;
            })
        },
        {
            name: 'Expenses',
            data: last12Months.map(m => {
                const found = data?.revenueChart?.expenseData?.find((ed: any) => ed._id.month === m.month && ed._id.year === m.year);
                return found ? found.total : 0;
            })
        }
    ];

    const revenueChartLabels = last12Months.map(m => m.label);

    //Revenue Chart Options
    const revenueChart: any = {
        series: revenueChartSeries,
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: { enabled: false },
                toolbar: { show: false },
            },
            dataLabels: { enabled: false },
            stroke: { show: true, curve: 'smooth', width: 2, lineCap: 'square' },
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            labels: revenueChartLabels,
            xaxis: {
                axisBorder: { show: false },
                axisTicks: { show: false },
                crosshairs: { show: true },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: { fontSize: '12px', cssClass: 'apexcharts-xaxis-title' },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        if (typeof value !== 'number') return '0';
                        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                        return value.toString();
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: { fontSize: '12px', cssClass: 'apexcharts-yaxis-title' },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: { width: 10, height: 10, offsetX: -2 },
                itemMargin: { horizontal: 10, vertical: 5 },
            },
            tooltip: { marker: { show: true }, x: { show: true } },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    };

    //Sales By Category
    const salesData = data?.salesByCategory || [];
    const salesByCategory: any = {
        series: salesData.length > 0 ? salesData.map((d: any) => d.total) : [1],
        options: {
            chart: { type: 'donut', height: 460, fontFamily: 'Nunito, sans-serif' },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 15, colors: isDark ? '#0e1726' : '#fff' },
            colors: ['#e2a03f', '#5c1ac3', '#e7515a', '#2196f3', '#00ab55'],
            labels: salesData.length > 0 ? salesData.map((d: any) => d._id) : ['No Data'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: { width: 10, height: 10, offsetX: -2 },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: { show: true, fontSize: '20px', offsetY: -10 },
                            value: {
                                show: true,
                                fontSize: '20px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => { return '₹' + (parseFloat(val) / 1000).toFixed(1) + 'K'; },
                            },
                            total: {
                                show: true,
                                label: 'Total Sales',
                                color: '#888ea8',
                                fontSize: '16px',
                                formatter: (w: any) => {
                                    const total = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                                    return '₹' + (total / 1000).toFixed(1) + 'K';
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    //Daily Sales (Weekly Production)
    const productionLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const productionDataArr = [0, 0, 0, 0, 0, 0, 0];
    data?.weeklyProduction?.forEach((p: any) => {
        productionDataArr[p._id - 1] = p.total;
    });

    const dailySales: any = {
        series: [
            {
                name: 'Production (Tons)',
                data: productionDataArr,
            }
        ],
        options: {
            chart: { height: 160, type: 'bar', fontFamily: 'Nunito, sans-serif', toolbar: { show: false } },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 1 },
            colors: ['#00ab55'],
            xaxis: {
                categories: productionLabels,
                axisBorder: { show: false }, axisTicks: { show: false },
            },
            yaxis: { show: false },
            fill: { opacity: 1 },
            plotOptions: { bar: { horizontal: false, columnWidth: '40%', borderRadius: 4 } },
            grid: { show: false, padding: { top: 10, right: 0, bottom: 0, left: 0 } },
        },
    };

    //Total Loads Sent Chart
    const totalOrders: any = {
        series: [{ name: 'Loads', data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40] }],
        options: {
            chart: { height: 290, type: 'area', fontFamily: 'Nunito, sans-serif', sparkline: { enabled: true } },
            stroke: { curve: 'smooth', width: 2 },
            colors: ['#00ab55'],
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            yaxis: { min: 0, show: false },
            grid: { padding: { top: 125, right: 0, bottom: 0, left: 0 } },
            fill: { opacity: 1, type: 'gradient', gradient: { type: 'vertical', shadeIntensity: 1, inverseColors: false, opacityFrom: 0.3, opacityTo: 0.05, stops: [100, 100] } },
            tooltip: { x: { show: false }, y: { formatter: (val: any) => val !== undefined ? val : 0 } },
        },
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><span className="animate-spin border-4 border-primary border-t-transparent rounded-full w-12 h-12"></span></div>;

    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                    <li><Link href="/" className="text-primary hover:underline">Dashboard</Link></li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Mine Overview</span></li>
                </ul>

                {/* Real-time Alerts Section */}
                {(data?.alerts?.lowStock?.length > 0 || data?.alerts?.compliance?.length > 0) && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Low Stock Alerts */}
                        {data?.alerts?.lowStock?.length > 0 && (
                            <div className="panel bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 rounded-2xl shadow-lg animate-pulse-subtle">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                                        <IconBox className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h5 className="font-black uppercase tracking-tight text-orange-800 dark:text-orange-400">Low Stock Alert (குறைவான இருப்பு)</h5>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Re-order required immediately</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {data?.alerts?.lowStock.map((item: any) => (
                                        <div key={item._id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-orange-200/50 dark:border-orange-800/50 group hover:scale-[1.02] transition-transform">
                                            <span className="font-black text-sm uppercase italic tracking-tight">{item.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-danger bg-danger/10 px-2 py-1 rounded-lg italic">{item.currentStock} {item.unit}</span>
                                                <IconAlertTriangle className="w-4 h-4 text-danger animate-bounce" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Compliance Alerts */}
                        {data?.alerts?.compliance?.length > 0 && (
                            <div className="panel bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
                                        <IconBellBing className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h5 className="font-black uppercase tracking-tight text-red-800 dark:text-red-400">Compliance Expiry (காலாவதி எச்சரிக்கை)</h5>
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Documents expiring within 30 days</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {data?.alerts?.compliance.map((v: any) => (
                                        <div key={v._id} className="flex items-start justify-between bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-red-200/50 dark:border-red-800/50">
                                            <div>
                                                <span className="font-black text-sm uppercase italic tracking-tight block">{v.name} ({v.registrationNumber || v.vehicleNumber})</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(['insuranceExpiryDate', 'fitnessExpiryDate', 'pollutionExpiryDate', 'taxExpiryDate', 'permitExpiryDate']).map((key) => {
                                                        const dateVal = v[key];
                                                        if (dateVal && new Date(dateVal) <= new Date(new Date().setDate(new Date().getDate() + 30))) {
                                                            const label = key.replace('ExpiryDate', '').toUpperCase();
                                                            return <span key={key} className="text-[8px] font-black bg-danger/10 text-danger px-1.5 py-0.5 rounded uppercase tracking-tighter">{label}</span>
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                            </div>
                                            <IconInfoCircle className="w-4 h-4 text-red-500 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-2">
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        <div className="panel h-full xl:col-span-2 border-none shadow-xl rounded-3xl">
                            <div className="mb-5 flex items-center justify-between dark:text-white-light px-2">
                                <h5 className="text-xl font-black uppercase tracking-tight">Revenue vs Expenses (வருமானம் & செலவுகள்)</h5>
                            </div>
                            <div className="flex items-center gap-4 px-2 mb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white-dark tracking-widest mb-1">Month Profit</p>
                                    <p className="text-2xl font-black text-primary italic">₹{data?.summary?.netProfit?.toLocaleString()}</p>
                                </div>
                                <div className="h-10 w-[2px] bg-primary/10"></div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white-dark tracking-widest mb-1">Status</p>
                                    <span className={`badge ${data?.summary?.netProfit > 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} border-none font-black uppercase text-[10px] px-3`}>
                                        {data?.summary?.netProfit > 0 ? 'Profitable' : 'Loss'}
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                {isMounted && <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />}
                            </div>
                        </div>

                        <div className="panel h-full border-none shadow-xl rounded-3xl">
                            <div className="mb-5 flex items-center px-2">
                                <h5 className="text-xl font-black uppercase tracking-tight dark:text-white-light">Sales By Category (விற்பனை)</h5>
                            </div>
                            <div>
                                {isMounted && <ReactApexChart series={salesByCategory.series} options={salesByCategory.options} type="donut" height={460} width={'100%'} />}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="panel h-full sm:col-span-2 xl:col-span-1 border-none shadow-xl rounded-3xl">
                            <div className="mb-5 flex items-center px-2">
                                <h5 className="text-xl font-black uppercase tracking-tight dark:text-white-light">Weekly Production (வார உற்பத்தி)</h5>
                            </div>
                            <div>
                                {isMounted && <ReactApexChart series={dailySales.series} options={dailySales.options} type="bar" height={160} width={'100%'} />}
                                <p className="text-[10px] font-black uppercase text-white-dark mt-4 text-center tracking-widest italic opacity-50">Last 7 days production records</p>
                            </div>
                        </div>

                        <div className="panel h-full border-none shadow-xl rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
                            <div className="mb-8 flex items-center px-2">
                                <h5 className="text-xl font-black uppercase tracking-tight dark:text-white-light italic">Executive Summary (சுருக்கம்)</h5>
                            </div>
                            <div className="space-y-8 px-2">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110">
                                        <IconInbox className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 ltr:ml-4 rtl:mr-4">
                                        <div className="mb-1 flex font-black uppercase tracking-widest text-[10px] text-white-dark">
                                            <h6>Market Income</h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-primary">₹{data?.summary?.monthIncome?.toLocaleString()}</p>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-primary/5">
                                            <div className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(67,97,238,0.3)]" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger shrink-0 transition-transform hover:scale-110">
                                        <IconCreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 ltr:ml-4 rtl:mr-4">
                                        <div className="mb-1 flex font-black uppercase tracking-widest text-[10px] text-white-dark">
                                            <h6>Operational Cost</h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-danger">₹{data?.summary?.monthExpense?.toLocaleString()}</p>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-danger/5">
                                            <div className="h-full rounded-full bg-danger shadow-[0_0_10px_rgba(231,81,90,0.3)]" style={{ width: `${Math.min((data?.summary?.monthExpense / data?.summary?.monthIncome) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center text-success shrink-0 transition-transform hover:scale-110">
                                        <IconTag className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 ltr:ml-4 rtl:mr-4">
                                        <div className="mb-1 flex font-black uppercase tracking-widest text-[10px] text-white-dark">
                                            <h6>Net Surplus</h6>
                                            <p className="ltr:ml-auto rtl:mr-auto text-success">₹{data?.summary?.netProfit?.toLocaleString()}</p>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-success/5">
                                            <div className="h-full rounded-full bg-success shadow-[0_0_10px_rgba(0,171,85,0.3)]" style={{ width: `${Math.max((data?.summary?.netProfit / data?.summary?.monthIncome) * 100, 0)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="panel h-full p-0 border-none shadow-xl rounded-3xl overflow-hidden relative group">
                            <div className="absolute top-6 left-6 z-10">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success transition-transform group-hover:rotate-12">
                                    <IconShoppingCart className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="absolute top-6 right-6 z-10 text-right">
                                <h5 className="text-3xl font-black italic ltr:text-right rtl:text-left dark:text-white-light text-success">
                                    {data?.summary?.totalInvoices}
                                    <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-white-dark mt-1">Total Sales Record</span>
                                </h5>
                            </div>
                            <div className="rounded-lg bg-transparent">
                                {isMounted && <ReactApexChart series={totalOrders.series} options={totalOrders.options} type="area" height={290} width={'100%'} />}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 sm:grid-cols-2">
                        <div className="panel h-full border-none shadow-xl rounded-2xl col-span-2 overflow-hidden">
                            <div className="mb-6 flex items-center justify-between px-2">
                                <h5 className="text-xl font-black uppercase tracking-tight italic">Latest Live Sales (சமீபத்திய விற்பனை)</h5>
                                <Link href="/sales" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All Registry →</Link>
                            </div>
                            <div className="table-responsive rounded-xl">
                                <table className="table-hover">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest text-white-dark p-4">
                                            <th className="py-4 px-6">Invoice / Date</th>
                                            <th>Customer Name</th>
                                            <th>Total Revenue</th>
                                            <th>Mode</th>
                                            <th className="text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-bold">
                                        {data?.latestSales?.map((sale: any) => (
                                            <tr key={sale._id} className="group hover:bg-primary/5 transition-all">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-black dark:text-white uppercase italic">{sale.invoiceNumber}</span>
                                                        <span className="text-[10px] text-white-dark uppercase">{new Date(sale.invoiceDate).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                                                        <span className="uppercase tracking-tight text-white-dark group-hover:text-primary transition-colors">{sale.customer?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-primary italic">₹{sale.grandTotal?.toLocaleString()}</td>
                                                <td>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${sale.paymentType === 'Cash' ? 'text-success' : 'text-warning'}`}>
                                                        {sale.paymentType}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${sale.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'} border-none font-black uppercase text-[9px] px-3`}>
                                                        {sale.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComponentsDashboardSales;
