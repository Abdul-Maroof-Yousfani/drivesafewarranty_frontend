"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Package,
  Car,
  FileText,
  PlusCircle,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Trophy,
  Activity,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getSuperAdminDashboardStatsAction } from "@/lib/actions/dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

const COLORS = [
  "#2563eb", // Vibrant Blue
  "#7c3aed", // Rich Violet
  "#db2777", // Deep Pink
  "#ea580c", // Bold Orange
  "#059669", // Modern Emerald
  "#4f46e5", // Tech Indigo
];

// Custom Tooltip Component for a refined tech look
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
}

const CustomTooltip = ({ active, payload, label, prefix = "" }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-xl ring-1 ring-black/5 dark:ring-white/5">
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          {prefix}{payload[0].value.toLocaleString()}
          <span className="text-[9px] font-medium text-slate-500">
            {payload[0].name === "sales" ? "Units" : "GBP"}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<{
    totalDealers: number;
    totalCustomers: number;
    totalWarranties: number;
    totalEarnings: number;
    pendingInvoices: number;
    pendingInvoicesAmount: number;
    totalPackages?: number;
    recentCustomers: Array<{
      id: string;
      name: string;
      email: string;
      warrantyPackage: string;
      date: string;
    }>;
    topPackages: Array<{ name: string; sales: number }>;
    topDealers: Array<{ name: string; revenue: number }>;
  }>({
    totalDealers: 0,
    totalCustomers: 0,
    totalWarranties: 0,
    totalEarnings: 0,
    pendingInvoices: 0,
    pendingInvoicesAmount: 0,
    totalPackages: 0,
    recentCustomers: [],
    topPackages: [],
    topDealers: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const res = await getSuperAdminDashboardStatsAction();
      if (!mounted) return;
      if (res.status && res.data) {
        setStats({
          totalDealers: res.data.totalDealers,
          totalCustomers: res.data.totalCustomers,
          totalWarranties: res.data.totalWarranties,
          totalEarnings: res.data.totalEarnings,
          pendingInvoices: res.data.pendingInvoices,
          pendingInvoicesAmount: res.data.pendingInvoicesAmount ?? 0,
          totalPackages: res.data.totalPackages,
          recentCustomers: res.data.recentCustomers,
          topPackages: res.data.topPackages || [],
          topDealers: res.data.topDealers || [],
        });
      }
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <motion.div 
      className="space-y-4 pt-1"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Mini Header */}
      <div className="flex items-end justify-between px-1 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics Overview
          </h1>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-0.5 opacity-80">
            Real-time Operational Intelligence
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
           <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Live Data Stream
           </div>
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Dealers", value: stats.totalDealers, icon: Building2, color: "blue", sub: "Partners" },
          { label: "Customers", value: stats.totalCustomers, icon: Users, color: "emerald", sub: "Active" },
          { label: "Policies", value: stats.totalWarranties, icon: ShieldCheck, color: "violet", sub: "Stored" },
          { label: "Gross Sales", value: stats.totalEarnings, icon: DollarSign, color: "amber", sub: "All-time", prefix: "£" },
          { label: "Pending", value: stats.pendingInvoicesAmount, icon: FileText, color: "orange", sub: "Invoices", prefix: "£" },
          { label: "Warranty Packages", value: stats.totalPackages, icon: Package, color: "indigo", sub: "Packages" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-none bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl group p-0">
              <CardHeader className="p-3 pb-0 space-y-0 flex flex-row items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{stat.label}</span>
                <stat.icon className={`h-3 w-3 text-${stat.color}-500/50 group-hover:text-${stat.color}-500 transition-all`} />
              </CardHeader>
              <CardContent className="p-3 pt-1">
                <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {stat.prefix}{stat.value?.toLocaleString()}
                </div>
                <p className="text-[9px] font-medium text-slate-400 mt-0.5 truncate uppercase tracking-tighter">
                  {stat.sub}
                </p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full bg-${stat.color}-500/40 transition-all duration-500`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics Main Section */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Compact Donut */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card className="h-full border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 rounded-2xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight">Market Distribution</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Warranty Plan Popularity</CardDescription>
              </div>
              <Activity className="h-3.5 w-3.5 text-slate-300" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[210px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topPackages}
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="sales"
                      stroke="none"
                    >
                      {stats.topPackages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-1">
                   <span className="text-2xl font-bold text-slate-900 dark:text-white">
                     {stats.topPackages.reduce((a, b) => a + b.sales, 0)}
                   </span>
                   <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                </div>
              </div>
              {/* Mini Legend Row */}
              <div className="flex flex-wrap gap-2 mt-2">
                 {stats.topPackages.slice(0, 3).map((pkg, i) => (
                   <div key={pkg.name} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex-1 min-w-[30%]">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[11px] font-bold truncate text-slate-500">{pkg.name}</span>
                      <span className="text-[11px] font-bold ml-auto text-slate-700 dark:text-slate-300">{pkg.sales}</span>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compact Revenue Bar */}
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <Card className="h-full border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/30 rounded-2xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight">Dealers Performance</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top Dealers</CardDescription>
              </div>
              <Trophy className="h-3.5 w-3.5 text-amber-400 opacity-60" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topDealers} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} barGap={12}>
                    <defs>
                      {stats.topDealers.map((_, i) => (
                        <linearGradient key={`gradient-${i}`} id={`colorCompactRev-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={1}/>
                          <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }}
                      dy={5}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#94A3B8' }}
                      tickFormatter={(val) => `£${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`}
                    />
                    <Tooltip 
                      content={<CustomTooltip prefix="£" />}
                      cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 4 }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      radius={[4, 4, 2, 2]} 
                      barSize={32}
                      animationDuration={1000}
                    >
                      {stats.topDealers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorCompactRev-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Activity List */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
          <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-slate-800/80">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight">Recent Transactions</CardTitle>
                <CardDescription className="text-[9px] uppercase font-bold text-slate-400">Live sales feed</CardDescription>
              </div>
              <Button variant="ghost" className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors" asChild>
                <Link href="/super-admin/customers/list">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {stats.recentCustomers.length > 0 ? (
                  stats.recentCustomers.slice(0, 6).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-primary border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                             <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white">{customer.name}</p>
                            <span className="text-[9px] font-medium text-slate-400 block">{customer.warrantyPackage} • {customer.date}</span>
                          </div>
                       </div>
                       <Link href={`/super-admin/customers/edit/${customer.id}`} className="h-6 w-6 rounded-full flex items-center justify-center text-slate-300 hover:bg-white hover:text-primary transition-all shadow-sm border border-transparent hover:border-slate-100">
                          <ArrowUpRight className="h-3 w-3" />
                       </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center opacity-30">
                     <Activity className="h-8 w-8 mx-auto mb-2" />
                     <p className="text-[10px] uppercase font-bold tracking-widest">No Recent Activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Refined Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
            <CardHeader className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border-b dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-[9px] uppercase font-bold text-slate-400">Direct Controls</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Provision Dealer", href: "/super-admin/dealers/create", color: "blue", icon: Building2 },
                  { label: "Register Client", href: "/super-admin/customers/create", color: "emerald", icon: Users },
                  { label: "Launch Plan", href: "/super-admin/warranty-packages/create", color: "violet", icon: Package },
                  { label: "Direct Checkout", href: "/super-admin/warranty-sales/create", color: "amber", icon: ShieldCheck },
                ].map((action) => (
                  <Button 
                    key={action.label} 
                    variant="outline" 
                    className="w-full justify-start h-auto py-3 px-3 rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 group relative overflow-hidden transition-all duration-300" 
                    asChild
                  >
                    <Link href={action.href} className="flex flex-col items-start gap-2 !space-x-0">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center transition-all group-hover:shadow-sm">
                        <action.icon className={`h-4 w-4 text-${action.color}-500/80 group-hover:text-${action.color}-500 transition-colors`} />
                      </div>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">{action.label}</span>
                        <ArrowRight className="h-2.5 w-2.5 text-slate-200 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
              <div className="pt-4 mt-auto">
                 <Button variant="ghost" className="w-full h-9 rounded-lg text-primary text-[9px] font-bold uppercase tracking-widest hover:bg-primary/5 border border-primary/5 transition-all" asChild>
                   <Link href="/super-admin/reports/sales">System Performance</Link>
                 </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
