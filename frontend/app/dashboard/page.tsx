"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Package, ShoppingCart, DollarSign, ArrowRight, Coffee, Loader2, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, AreaChart, Area, CartesianGrid } from "recharts";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

interface DashboardData {
	totalSales: number;
	totalOrders: number;
	averageOrderValue: number;
	topProduct: string;
	paymentBreakdown: { cash: number; digital: number; upi: number };
	salesByDay: { date: string; total: number }[];
}

export default function DashboardPage() {
	const router = useRouter();
	const { token, isAuthenticated, user, hasHydrated } = useAuthStore();
	const [dashboard, setDashboard] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!hasHydrated) return;

		if (!isAuthenticated || !token) {
			router.push("/login");
			return;
		}

		const fetchDashboard = async () => {
			try {
				const response = await api.reports.dashboard(token, { period: "today" });
				setDashboard(response.data as DashboardData);
			} catch (error) {
				console.error("Failed to fetch dashboard:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, [hasHydrated, isAuthenticated, token, router]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[80vh]">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="animate-spin text-brand-primary" size={32} />
					<p className="text-brand-muted text-sm tracking-widest uppercase">Curating Insights...</p>
				</div>
			</div>
		);
	}

	const kpis = [
		{
			label: "Today's Revenue",
			value: `₹${(dashboard?.totalSales || 0).toLocaleString()}`,
			icon: DollarSign,
		},
		{
			label: "Orders Today",
			value: (dashboard?.totalOrders || 0).toString(),
			icon: ShoppingCart,
		},
		{
			label: "Avg Order Value",
			value: `₹${(dashboard?.averageOrderValue || 0).toFixed(0)}`,
			icon: TrendingUp,
		},
	];

	const chartData =
		dashboard?.salesByDay?.map((d) => ({
			date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
			sales: d.total,
		})) || [];

	const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

	return (
		<div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-screen bg-[#FDF9F1] font-sans selection:bg-[#E8A838]/20">
			{/* Top Bar / Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
				<div className="space-y-4">
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-[#D5C4AF]/20 text-[#504535] text-xs font-medium tracking-wide">
						<Calendar size={12} className="text-[#805600]" />
						{todayDate}
					</div>
					<h1 className="text-4xl md:text-5xl font-serif text-[#1C1C17] tracking-tight leading-tight">
						Morning Solstice,<br className="hidden md:block"/> {user?.name?.split(' ')[0] || "Curator"}.
					</h1>
					<p className="text-[#504535] text-base max-w-xl leading-relaxed">
						Inventory metrics and staff cadence are optimal. Here is a curated overview of today's rhythm and performance.
					</p>
				</div>
				<div className="flex items-center gap-4">
					<Link
						href="/pos"
						className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-br from-[#805600] to-[#E8A838] text-white rounded-xl shadow-[0_8px_16px_rgba(128,86,0,0.2)] hover:shadow-[0_12px_24px_rgba(128,86,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
					>
						<div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
						<span className="relative z-10 flex items-center gap-2 font-medium tracking-wide">
							<Coffee size={18} />
							Launch POS
						</span>
					</Link>
				</div>
			</div>

			{/* Top KPIs */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				{kpis.map((k) => (
					<div key={k.label} className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(80,69,53,0.06)] border border-[#D5C4AF]/20 group hover:border-[#D5C4AF]/60 transition-colors duration-500">
						<div className="flex items-start justify-between mb-6">
							<p className="text-[#504535] text-sm font-medium tracking-wider uppercase">{k.label}</p>
							<div className="w-10 h-10 rounded-full bg-[#FDF9F1] flex items-center justify-center text-[#805600] group-hover:scale-110 transition-transform duration-500">
								<k.icon size={18} strokeWidth={2.5} />
							</div>
						</div>
						<p className="text-4xl text-[#1C1C17] font-mono tracking-tight">{k.value}</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
				{/* Chart Area */}
				<div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(80,69,53,0.06)] border border-[#D5C4AF]/20">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-2xl font-serif text-[#1C1C17]">Weekly Rhythm</h2>
							<p className="text-[#504535] text-sm mt-1">Sales performance observed over the last 7 days</p>
						</div>
					</div>
					
					{chartData.length > 0 ? (
						<div className="h-[280px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E2DA" />
									<XAxis dataKey="date" tick={{ fill: "#504535", fontSize: 13, fontFamily: 'inherit' }} axisLine={false} tickLine={false} dy={10} />
									<YAxis tick={{ fill: "#504535", fontSize: 13, fontFamily: 'inherit' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} />
									<Tooltip
										cursor={{ fill: '#FDF9F1' }}
										contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(213,196,175,0.3)", borderRadius: "16px", color: "#1C1C17", boxShadow: "0 10px 25px rgba(80,69,53,0.1)" }}
										formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
										labelStyle={{ color: '#504535', marginBottom: '4px' }}
									/>
									<Bar dataKey="sales" radius={[8, 8, 8, 8]}>
										{chartData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? "#E8A838" : "#F7F3EB"} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					) : (
						<div className="h-[280px] flex items-center justify-center border border-dashed border-[#D5C4AF] rounded-2xl bg-[#FDF9F1]/50 text-[#504535]">
							Waiting for first transactions...
						</div>
					)}
				</div>

				{/* Quick Actions & Mix */}
				<div className="space-y-8">
					<div className="bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(80,69,53,0.06)] border border-[#D5C4AF]/20 relative overflow-hidden group">
						<div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#FDF9F1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
						
						<h2 className="text-xl font-serif text-[#1C1C17] mb-6">Payment Mix</h2>
						<div className="space-y-6">
							<div className="flex justify-between items-end">
								<div>
									<p className="text-[#504535] text-sm mb-1">Cash Collection</p>
									<p className="text-[#1C1C17] text-xl font-mono">₹{(dashboard?.paymentBreakdown?.cash || 0).toLocaleString()}</p>
								</div>
								<div className="h-2 w-16 bg-[#805600] rounded-full" />
							</div>
							<div className="w-full h-[1px] bg-[#E6E2DA]" />
							<div className="flex justify-between items-end">
								<div>
									<p className="text-[#504535] text-sm mb-1">Digital Processing</p>
									<p className="text-[#1C1C17] text-xl font-mono">₹{(dashboard?.paymentBreakdown?.digital || 0).toLocaleString()}</p>
								</div>
								<div className="h-2 w-16 bg-[#E8A838] rounded-full" />
							</div>
							<div className="w-full h-[1px] bg-[#E6E2DA]" />
							<div className="flex justify-between items-end">
								<div>
									<p className="text-[#504535] text-sm mb-1">UPI Transfers</p>
									<p className="text-[#1C1C17] text-xl font-mono">₹{(dashboard?.paymentBreakdown?.upi || 0).toLocaleString()}</p>
								</div>
								<div className="h-2 w-16 bg-[#FDBA49] rounded-full" />
							</div>
						</div>
					</div>

					<div className="bg-white rounded-3xl p-6 shadow-[0_20px_40px_rgba(80,69,53,0.06)] border border-[#D5C4AF]/20">
						<Link href="/backend/products" className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#FDF9F1] transition-colors group">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#805600]">
									<Package size={16} />
								</div>
								<span className="text-[#1C1C17] font-medium">Curate Products</span>
							</div>
							<ArrowRight size={18} className="text-[#D5C4AF] group-hover:text-[#805600] transition-colors transform group-hover:translate-x-1" />
						</Link>
						<Link href="/backend/reports" className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#FDF9F1] transition-colors group mt-2">
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#805600]">
									<TrendingUp size={16} />
								</div>
								<span className="text-[#1C1C17] font-medium">Deep Analytics</span>
							</div>
							<ArrowRight size={18} className="text-[#D5C4AF] group-hover:text-[#805600] transition-colors transform group-hover:translate-x-1" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
