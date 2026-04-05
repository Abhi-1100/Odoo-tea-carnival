"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, Package, ShoppingCart, DollarSign, ArrowRight, Coffee, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useAuthStore } from "@/store/authStore";
import { ApiError, api } from "@/lib/api";

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
	const { token, isAuthenticated, user, hasHydrated, logout } = useAuthStore();
	const [dashboard, setDashboard] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!hasHydrated) return;

		if (!isAuthenticated || !token) {
			router.push("/login");
			return;
		}

		const fetchDashboard = async () => {
			try {
				const response = await api.reports.dashboard(token, { period: "month" });
				setDashboard(response.data as DashboardData);
				setError(null);
			} catch (error) {
				console.error("Failed to fetch dashboard:", error);
				const status = error instanceof ApiError ? error.status : undefined;
				const message = error instanceof Error ? error.message.toLowerCase() : "";
				if (status === 401 || status === 403 || message.includes("invalid token") || message.includes("token has expired")) {
					logout();
					router.replace("/login");
					return;
				}
				setError("Unable to load dashboard stats right now.");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboard();
	}, [hasHydrated, isAuthenticated, token, router, logout]);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="animate-spin text-brand-primary" size={40} />
			</div>
		);
	}

	const kpis = [
		{
			label: "Today's Sales",
			value: `₹${(dashboard?.totalSales || 0).toLocaleString()}`,
			icon: DollarSign,
			color: "bg-brand-primary/20 text-brand-primary",
			change: dashboard?.totalOrders ? "+12%" : "",
		},
		{
			label: "Total Orders",
			value: (dashboard?.totalOrders || 0).toString(),
			icon: ShoppingCart,
			color: "bg-brand-teal/20 text-brand-teal",
			change: "+5%",
		},
		{
			label: "Avg Order Value",
			value: `₹${(dashboard?.averageOrderValue || 0).toFixed(0)}`,
			icon: TrendingUp,
			color: "bg-orange-500/20 text-orange-400",
			change: "+8%",
		},
	];

	const quickLinks = [
		{ label: "Manage Products", href: "/backend/products", icon: Package },
		{ label: "Floor Plan", href: "/backend/floors", icon: Coffee },
		{ label: "Open POS", href: "/pos", icon: ShoppingCart },
		{ label: "View Reports", href: "/backend/reports", icon: TrendingUp },
	];

	const chartData =
		dashboard?.salesByDay?.map((d) => ({
			date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
			sales: d.total,
		})) || [];

	return (
		<div className="p-8 space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-white">Dashboard</h1>
				<p className="text-brand-muted text-sm mt-1">
					Welcome back, {user?.name || "Admin"} - here's what's happening this month.
				</p>
			</div>

			{error && (
				<div className="card p-4 border border-red-500/20 bg-red-500/5 text-red-300 text-sm">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				{kpis.map((k) => (
					<div key={k.label} className="card p-5">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-brand-muted text-xs font-medium mb-2">{k.label}</p>
								<p className="text-2xl font-bold text-white">{k.value}</p>
								{k.change && <p className="text-green-400 text-xs mt-1 font-medium">{k.change} vs yesterday</p>}
							</div>
							<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.color}`}>
								<k.icon size={18} />
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="card p-6 xl:col-span-2">
					<h2 className="text-white font-semibold mb-4">Sales This Month</h2>
					{chartData.length > 0 ? (
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={chartData} barSize={32}>
								<XAxis dataKey="date" tick={{ fill: "#a59a96", fontSize: 12 }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fill: "#a59a96", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
								<Tooltip contentStyle={{ background: "#161614", border: "1px solid #261e1b", borderRadius: "8px", color: "#f0dfdb" }} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Sales"]} />
								<Bar dataKey="sales" fill="#e8a838" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div className="h-[200px] flex items-center justify-center text-brand-muted">No sales data for this month</div>
					)}
				</div>

				<div className="card p-6">
					<h2 className="text-white font-semibold mb-4">Quick Links</h2>
					<div className="space-y-2">
						{quickLinks.map((q) => (
							<Link key={q.href} href={q.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-bg transition-colors group">
								<div className="flex items-center gap-3">
									<q.icon size={16} className="text-brand-primary" />
									<span className="text-sm text-white">{q.label}</span>
								</div>
								<ArrowRight size={14} className="text-brand-muted group-hover:text-brand-primary transition-colors" />
							</Link>
						))}
					</div>
				</div>
			</div>

			<div className="card p-6">
				<h2 className="text-white font-semibold mb-4">Payment Breakdown</h2>
				<div className="grid grid-cols-3 gap-4">
					<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
						<p className="text-green-400 text-sm mb-1">Cash</p>
						<p className="text-white text-xl font-bold">₹{(dashboard?.paymentBreakdown?.cash || 0).toLocaleString()}</p>
					</div>
					<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
						<p className="text-blue-400 text-sm mb-1">Digital</p>
						<p className="text-white text-xl font-bold">₹{(dashboard?.paymentBreakdown?.digital || 0).toLocaleString()}</p>
					</div>
					<div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
						<p className="text-purple-400 text-sm mb-1">UPI</p>
						<p className="text-white text-xl font-bold">₹{(dashboard?.paymentBreakdown?.upi || 0).toLocaleString()}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
