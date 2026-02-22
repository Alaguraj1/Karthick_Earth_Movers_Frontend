'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuChat from '@/components/icon/menu/icon-menu-chat';
import IconMenuMailbox from '@/components/icon/menu/icon-menu-mailbox';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuNotes from '@/components/icon/menu/icon-menu-notes';
import IconMenuScrumboard from '@/components/icon/menu/icon-menu-scrumboard';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuInvoice from '@/components/icon/menu/icon-menu-invoice';
import IconMenuCalendar from '@/components/icon/menu/icon-menu-calendar';
import IconMenuComponents from '@/components/icon/menu/icon-menu-components';
import IconMenuElements from '@/components/icon/menu/icon-menu-elements';
import IconMenuCharts from '@/components/icon/menu/icon-menu-charts';
import IconMenuWidgets from '@/components/icon/menu/icon-menu-widgets';
import IconMenuFontIcons from '@/components/icon/menu/icon-menu-font-icons';
import IconMenuDragAndDrop from '@/components/icon/menu/icon-menu-drag-and-drop';
import IconMenuTables from '@/components/icon/menu/icon-menu-tables';
import IconMenuDatatables from '@/components/icon/menu/icon-menu-datatables';
import IconMenuForms from '@/components/icon/menu/icon-menu-forms';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconPlus from '@/components/icon/icon-plus';
import IconMenuPages from '@/components/icon/menu/icon-menu-pages';
import IconMenuAuthentication from '@/components/icon/menu/icon-menu-authentication';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import { usePathname } from 'next/navigation';
import { getTranslation } from '@/i18n';

const Sidebar = () => {
    const dispatch = useDispatch();
    const { t } = getTranslation();
    const pathname = usePathname();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">VRISTO</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <IconMinus className="hidden h-5 w-4 flex-none" />
                                <span>Stone Mine</span>
                            </h2>

                            <li className="nav-item">
                                <ul>
                                    <li className="nav-item">
                                        <Link href="/sales" className="group">
                                            <div className="flex items-center">
                                                <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Dashboard</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'expense-mgmt' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('expense-mgmt')}>
                                            <div className="flex items-center">
                                                <IconMenuInvoice className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Expenses</span>
                                            </div>

                                            <div className={currentMenu !== 'expense-mgmt' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'expense-mgmt' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/expenses/diesel">Diesel / Fuel</Link>
                                                </li>
                                                <li>
                                                    <Link href="/expenses/machine-maintenance">Maintenance</Link>
                                                </li>
                                                <li>
                                                    <Link href="/expenses/labour-wages">Labour Wages</Link>
                                                </li>
                                                <li>
                                                    <Link href="/expenses/explosive-cost">Explosive Cost</Link>
                                                </li>
                                                <li>
                                                    <Link href="/expenses/transport-charges">Transport</Link>
                                                </li>
                                                <li>
                                                    <Link href="/expenses/office-misc">Office & Misc</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>
                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'sales-billing' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('sales-billing')}>
                                            <div className="flex items-center">
                                                <IconMenuContacts className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Sales & Billing</span>
                                            </div>

                                            <div className={currentMenu !== 'sales-billing' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'sales-billing' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/sales-billing/customers">Customer Management</Link>
                                                </li>
                                                <li>
                                                    <Link href="/sales-billing/sales-entry">Sales Entry</Link>
                                                </li>
                                                <li>
                                                    <Link href="/sales-billing/invoices">Invoice Generation</Link>
                                                </li>
                                                <li>
                                                    <Link href="/sales-billing/cash-credit">Cash / Credit Sales</Link>
                                                </li>
                                                <li>
                                                    <Link href="/sales-billing/pending-payments">Pending Payments</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>
                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'production-mgmt' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('production-mgmt')}>
                                            <div className="flex items-center">
                                                <IconMenuScrumboard className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase tracking-widest text-[10px] font-black">Production</span>
                                            </div>

                                            <div className={currentMenu !== 'production-mgmt' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'production-mgmt' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/production/entry">Daily Entry</Link>
                                                </li>
                                                <li>
                                                    <Link href="/production/stock">Stock Tracking</Link>
                                                </li>
                                                <li>
                                                    <Link href="/production/analysis">Analysis</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'asset-mgmt' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('asset-mgmt')}>
                                            <div className="flex items-center">
                                                <IconMenuWidgets className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase tracking-widest text-[10px] font-black">Machine & Vehicle</span>
                                            </div>

                                            <div className={currentMenu !== 'asset-mgmt' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'asset-mgmt' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/assets/machines">Machine Details</Link>
                                                </li>
                                                <li>
                                                    <Link href="/assets/vehicles">Vehicle Details</Link>
                                                </li>
                                                <li>
                                                    <Link href="/assets/fuel-log">Fuel Tracking</Link>
                                                </li>
                                                <li>
                                                    <Link href="/assets/maintenance">Maintenance History</Link>
                                                </li>
                                                <li>
                                                    <Link href="/assets/cost-analysis">Cost per Machine</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'labour-mgmt' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('labour-mgmt')}>
                                            <div className="flex items-center">
                                                <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Labour Management</span>
                                            </div>

                                            <div className={currentMenu !== 'labour-mgmt' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'labour-mgmt' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/labour/list">Labour List</Link>
                                                </li>
                                                <li>
                                                    <Link href="/labour/attendance">Daily Attendance</Link>
                                                </li>
                                                <li>
                                                    <Link href="/labour/wages">Wages Calculation</Link>
                                                </li>
                                                <li>
                                                    <Link href="/labour/advance">Advance Payment</Link>
                                                </li>
                                                <li>
                                                    <Link href="/labour/report">Labour Report</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'transport-mgmt' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('transport-mgmt')}>
                                            <div className="flex items-center">
                                                <IconMenuScrumboard className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase tracking-widest text-[10px] font-black">Transport Management</span>
                                            </div>

                                            <div className={currentMenu !== 'transport-mgmt' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'transport-mgmt' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/transport/trips">Vehicle Trip Management</Link>
                                                </li>
                                                <li>
                                                    <Link href="/transport/driver-payments">Driver Payment</Link>
                                                </li>
                                                <li>
                                                    <Link href="/transport/profitability">Profit per Trip</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'vendor-mgmt' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('vendor-mgmt')}>
                                            <div className="flex items-center">
                                                <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase tracking-widest text-[10px] font-black">Vendor Management</span>
                                            </div>

                                            <div className={currentMenu !== 'vendor-mgmt' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'vendor-mgmt' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/vendors/explosive">Explosive Suppliers</Link>
                                                </li>
                                                <li>
                                                    <Link href="/vendors/labour">Labour Contractors</Link>
                                                </li>
                                                <li>
                                                    <Link href="/vendors/transport">Transport Vendors</Link>
                                                </li>
                                                <li>
                                                    <Link href="/vendors/payments">Payment History</Link>
                                                </li>
                                                <li>
                                                    <Link href="/vendors/outstanding">Outstanding Balance</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>

                                    <li className="menu nav-item">
                                        <button type="button" className={`${currentMenu === 'accounts-reports' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('accounts-reports')}>
                                            <div className="flex items-center">
                                                <IconMenuCharts className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark uppercase tracking-widest text-[10px] font-black">Accounts & Reports</span>
                                            </div>

                                            <div className={currentMenu !== 'accounts-reports' ? '-rotate-90 rtl:rotate-90' : ''}>
                                                <IconCaretDown />
                                            </div>
                                        </button>

                                        <AnimateHeight duration={300} height={currentMenu === 'accounts-reports' ? 'auto' : 0}>
                                            <ul className="sub-menu text-gray-500">
                                                <li>
                                                    <Link href="/accounts-reports/day-book">Day Book</Link>
                                                </li>
                                                <li>
                                                    <Link href="/accounts-reports/cash-flow">Cash Flow Statement</Link>
                                                </li>
                                                <li>
                                                    <Link href="/accounts-reports/profit-loss">Profit & Loss A/c</Link>
                                                </li>
                                                <li>
                                                    <Link href="/accounts-reports/summary">Monthly/Yearly Reports</Link>
                                                </li>
                                            </ul>
                                        </AnimateHeight>
                                    </li>

                                    <li className="nav-item">
                                        <Link href="/masters" className="group">
                                            <div className="flex items-center">
                                                <IconMenuForms className="shrink-0 group-hover:!text-primary" />
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Masters</span>
                                            </div>
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
