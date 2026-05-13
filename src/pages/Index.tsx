// Update this page (the content is just a fallback if you fail to update the page)

import { Home, FileText, AlertCircle, TrendingUp, Plus, LayoutDashboard, ArrowUpRight, CreditCard, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const quickActions = [
    { path: "/rsp-works", label: "RSP Works", icon: FileText, color: "bg-blue-50 text-blue-600", desc: "Manage all RSP-related workloads" },
    { path: "/irsp-works", label: "IRSP Works", icon: FileText, color: "bg-indigo-50 text-indigo-600", desc: "Track IRSP workload progress" },
    { path: "/contingencies", label: "Contingencies", icon: AlertCircle, color: "bg-amber-50 text-amber-600", desc: "Monitor and plan for contingencies" },
    { path: "/unit-cost", label: "Unit Cost", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600", desc: "Analyze and manage unit cost metrics" },
    { path: "/add-works", label: "Add New Work", icon: Plus, color: "bg-violet-50 text-violet-600", desc: "Quickly input new budget items" },
  ];

  const stats = [
    { label: "Total Budget", value: "$2.4M", change: "+12.5%", icon: Wallet, color: "text-indigo-600" },
    { label: "Active Projects", value: "14", change: "+2", icon: LayoutDashboard, color: "text-blue-600" },
    { label: "Pending Requests", value: "28", change: "-4", icon: CreditCard, color: "text-amber-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12 space-y-4">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">Administrator</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Everything you need to manage and monitor the budget portal in one place.
            Quickly access your works, track contingencies, and analyze unit costs.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Quick Navigation</h2>
            <Link to="/add-works" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
              View All Works <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-300 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {action.label}
                  </h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {action.desc}
                </p>
                <div className="mt-2 flex items-center text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Go to page <ArrowUpRight size={12} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
