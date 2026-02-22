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
import { IRootState } from '@/store';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useSelector } from 'react-redux';

const ComponentsDashboardSales = () => {
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    //Revenue Chart
    const revenueChart: any = {
        series: [
            {
                name: 'Income',
                data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
            },
            {
                name: 'Expenses',
                data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000],
            },
        ],
        options: {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['#2196F3', '#E7515A'] : ['#1B55E2', '#E7515A'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value !== undefined ? (value / 1000 + 'K') : '0K';
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
            },
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
    const salesByCategory: any = {
        series: [985, 737, 270],
        options: {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#0e1726' : '#fff',
            },
            colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
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
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val !== undefined ? val : '';
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: (w: any) => {
                                    return (w.globals?.seriesTotals || []).reduce(function (a: any, b: any) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Stone Sales', 'Transport', 'Others'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        },
    };

    //Daily Sales
    const dailySales: any = {
        series: [
            {
                name: 'Sales',
                data: [44, 55, 41, 67, 22, 43, 21],
            },
            {
                name: 'Last Week',
                data: [13, 23, 20, 8, 13, 27, 33],
            },
        ],
        options: {
            chart: {
                height: 160,
                type: 'bar',
                fontFamily: 'Nunito, sans-serif',
                toolbar: {
                    show: false,
                },
                stacked: true,
                stackType: '100%',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 1,
            },
            colors: ['#e2a03f', '#e0e6ed'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0,
                        },
                    },
                },
            ],
            xaxis: {
                labels: {
                    show: false,
                },
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            },
            yaxis: {
                show: false,
            },
            fill: {
                opacity: 1,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '25%',
                },
            },
            legend: {
                show: false,
            },
            grid: {
                show: false,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 10,
                    right: -20,
                    bottom: -20,
                    left: -20,
                },
            },
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
            fill: {
                opacity: 1, type: 'gradient',
                gradient: { type: 'vertical', shadeIntensity: 1, inverseColors: false, opacityFrom: 0.3, opacityTo: 0.05, stops: [100, 100] }
            },
            tooltip: { x: { show: false }, y: { formatter: (val: any) => val !== undefined ? val : 0 } },
        },
    };

    return (
        <>
            <div>
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="/" className="text-primary hover:underline">
                            Dashboard
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Mine Overview</span>
                    </li>
                </ul>

                <div className="pt-5">
                    <div className="mb-6 grid gap-6 xl:grid-cols-3">
                        <div className="panel h-full xl:col-span-2">
                            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                                <h5 className="text-lg font-semibold">வருமானம் & செலவுகள் (Revenue vs Expenses)</h5>
                                <div className="dropdown">
                                    <Dropdown
                                        offset={[0, 1]}
                                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                        button={<IconHorizontalDots className="text-black/70 hover:!text-primary dark:text-white/70" />}
                                    >
                                        <ul>
                                            <li>
                                                <button type="button">Weekly</button>
                                            </li>
                                            <li>
                                                <button type="button">Monthly</button>
                                            </li>
                                            <li>
                                                <button type="button">Yearly</button>
                                            </li>
                                        </ul>
                                    </Dropdown>
                                </div>
                            </div>
                            <p className="text-lg dark:text-white-light/90">
                                மொத்த லாபம் (Net Profit) <span className="ml-2 text-primary">₹3,50,000</span>
                            </p>
                            <div className="relative">
                                <div className="rounded-lg bg-white dark:bg-black">
                                    {isMounted ? (
                                        <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />
                                    ) : (
                                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                            <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="panel h-full">
                            <div className="mb-5 flex items-center">
                                <h5 className="text-lg font-semibold dark:text-white-light">விற்பனை பிரிவுகள் (Sales By Category)</h5>
                            </div>
                            <div>
                                <div className="rounded-lg bg-white dark:bg-black">
                                    {isMounted ? (
                                        <ReactApexChart series={salesByCategory.series} options={salesByCategory.options} type="donut" height={460} width={'100%'} />
                                    ) : (
                                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                            <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="panel h-full sm:col-span-2 xl:col-span-1">
                            <div className="mb-5 flex items-center">
                                <h5 className="text-lg font-semibold dark:text-white-light">
                                    தினசரி உற்பத்தி (Daily Production)
                                    <span className="block text-sm font-normal text-white-dark">Stone production in Tons.</span>
                                </h5>
                                <div className="relative ltr:ml-auto rtl:mr-auto">
                                    <div className="grid h-11 w-11 place-content-center rounded-full bg-[#ffeccb] text-warning dark:bg-warning dark:text-[#ffeccb]">
                                        <IconBolt />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="rounded-lg bg-white dark:bg-black">
                                    {isMounted ? (
                                        <ReactApexChart series={dailySales.series} options={dailySales.options} type="bar" height={160} width={'100%'} />
                                    ) : (
                                        <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                            <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="panel h-full">
                            <div className="mb-5 flex items-center justify-between dark:text-white-light">
                                <h5 className="text-lg font-semibold">நிர்வாக சுருக்கம் (Summary)</h5>
                            </div>
                            <div className="space-y-9">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                                        <div className="grid h-9 w-9 place-content-center  rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
                                            <IconInbox />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex font-semibold text-white-dark">
                                            <h6>மொத்த வருமானம் (Income)</h6>
                                            <p className="ltr:ml-auto rtl:mr-auto">₹15,00,000</p>
                                        </div>
                                        <div className="h-2 rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                            <div className="h-full w-11/12 rounded-full bg-gradient-to-r from-[#7579ff] to-[#b224ef]" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                                        <div className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
                                            <IconCreditCard />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex font-semibold text-white-dark">
                                            <h6>மொத்த செலவு (Expenses)</h6>
                                            <p className="ltr:ml-auto rtl:mr-auto">₹11,50,000</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#f09819] to-[#ff5858]" style={{ width: '76%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-9 w-9 ltr:mr-3 rtl:ml-3">
                                        <div className="grid h-9 w-9 place-content-center rounded-full bg-success-light text-success dark:bg-success dark:text-success-light">
                                            <IconTag />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-2 flex font-semibold text-white-dark">
                                            <h6>நிகர லாபம் (Net Profit)</h6>
                                            <p className="ltr:ml-auto rtl:mr-auto">₹3,50,000</p>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-dark-light shadow dark:bg-[#1b2e4b]">
                                            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#3cba92] to-[#0ba360]" style={{ width: '24%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="panel h-full p-0">
                            <div className="absolute flex w-full items-center justify-between p-5">
                                <div className="relative">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success-light text-success dark:bg-success dark:text-success-light">
                                        <IconShoppingCart />
                                    </div>
                                </div>
                                <h5 className="text-2xl font-semibold ltr:text-right rtl:text-left dark:text-white-light">
                                    3,192
                                    <span className="block text-sm font-normal">Total Loads Sent</span>
                                </h5>
                            </div>
                            <div className="rounded-lg bg-transparent">
                                {/* loader */}
                                {isMounted ? (
                                    <ReactApexChart series={totalOrders.series} options={totalOrders.options} type="area" height={290} width={'100%'} />
                                ) : (
                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="panel h-full pb-0 sm:col-span-2 xl:col-span-1">
                            <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Stone Mine Overview</h5>
                            <div className="space-y-4 p-4">
                                <div className="flex items-center justify-between rounded-lg bg-primary-light p-3 text-primary">
                                    <span className="font-semibold">Active Excavators</span>
                                    <span className="text-xl font-bold">12</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-success-light p-3 text-success">
                                    <span className="font-semibold">Loads Dispatched Today</span>
                                    <span className="text-xl font-bold">45</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-warning-light p-3 text-warning">
                                    <span className="font-semibold">Pending Invoices</span>
                                    <span className="text-xl font-bold">₹2,45,000</span>
                                </div>
                            </div>
                        </div>
                        <div className="panel h-full sm:col-span-2">
                            <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Latest dispatched loads</h5>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Truck No</th>
                                            <th>Material</th>
                                            <th>Quantity</th>
                                            <th>Customer</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>TN-33-AX-1234</td>
                                            <td>Blue Metal 20mm</td>
                                            <td>12 Tons</td>
                                            <td>Local Contractor</td>
                                            <td><span className="badge bg-success">Dispatched</span></td>
                                        </tr>
                                        <tr>
                                            <td>TN-45-B-5678</td>
                                            <td>M-Sand</td>
                                            <td>10 Tons</td>
                                            <td>Build-Tech Corp</td>
                                            <td><span className="badge bg-success">Dispatched</span></td>
                                        </tr>
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
