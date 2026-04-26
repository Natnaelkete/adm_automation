"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Activity, 
  Settings, 
  Download, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ChevronRight,
  Database,
  LineChart,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API Configuration
const API_BASE = "http://localhost:8000";

export default function ADMDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<any[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch jobs periodically
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/jobs`);
        setJobs(response.data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll current job status if active
  useEffect(() => {
    if (!currentJobId) return;

    const pollStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/status/${currentJobId}`);
        setCurrentJob(response.data);
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          setCurrentJobId(null);
        }
      } catch (error) {
        console.error("Status poll failed", error);
        setCurrentJobId(null);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [currentJobId]);

  const startGeneration = async (data: any) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/api/generate`, data);
      setCurrentJobId(response.data.job_id);
      setActiveTab('status');
    } catch (error: any) {
      alert("Failed to start generation: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Sidebar - Modern & Minimal */}
      <aside className="w-20 lg:w-64 border-r border-white/5 bg-neutral-950 flex flex-col z-30 transition-all duration-300">
        <div className="p-6 h-20 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Zap size={22} className="text-black fill-black" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-black text-lg tracking-tight leading-none">ADM.AI</h1>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1 block">Enterprise</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={22} />} 
            label="Overview" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<PlusCircle size={22} />} 
            label="Generator" 
            active={activeTab === 'new'} 
            onClick={() => setActiveTab('new')} 
          />
          <SidebarItem 
            icon={<Activity size={22} />} 
            label="Pipeline" 
            active={activeTab === 'status'} 
            onClick={() => setActiveTab('status')} 
          />
        </nav>

        <div className="p-4 mt-auto">
          <div className="hidden lg:block p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Engine Status</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium leading-tight">
              GitHub Models (GPT-4o) is active and processing requests.
            </p>
          </div>
          <SidebarItem icon={<Settings size={22} />} label="Settings" active={false} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 overflow-hidden relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Floating Header */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/40 backdrop-blur-2xl sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">
            <span>Portfolio</span>
            <ChevronRight size={14} className="opacity-30" />
            <span className="text-white">Global Strategy Artifacts</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Node_Active</span>
            </div>
            <button 
              onClick={() => setActiveTab('new')}
              className="bg-white text-black hover:bg-neutral-200 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
              Initialize Synthesis
            </button>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12 animate-fade-in-up"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MetricsCard 
                    title="Reports Synthesized" 
                    value={jobs.length} 
                    trend="In Sync"
                    icon={<FileText size={22} className="text-blue-400" />} 
                  />
                  <MetricsCard 
                    title="Live Pipelines" 
                    value={jobs.filter(j => j.status === 'generating').length} 
                    trend="Optimal"
                    icon={<Activity size={22} className="text-indigo-400" />} 
                  />
                  <MetricsCard 
                    title="Ready for Export" 
                    value={jobs.filter(j => j.status === 'completed').length} 
                    trend="Verified"
                    icon={<CheckCircle2 size={22} className="text-emerald-400" />} 
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black tracking-tighter">Strategic History</h3>
                    <button className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-0.5">Archive Access</button>
                  </div>

                  <div className="bg-neutral-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="px-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Corporation Identity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">State</th>
                          <th className="px-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Integrity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {jobs.map((job) => (
                          <tr key={job.job_id} className="hover:bg-white/[0.03] transition-all group">
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-white/10 flex items-center justify-center text-white font-black text-sm group-hover:border-white/30 transition-all shadow-inner">
                                  {job.client_name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">{job.client_name}</div>
                                  <div className="text-[10px] text-neutral-500 font-mono mt-1 opacity-50 tracking-widest uppercase">ID: {job.job_id.split('-')[0]}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <StatusBadge status={job.status} />
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                <div className="flex-1 h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5 min-w-[120px]">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${job.progress}%` }}
                                    className="h-full bg-white shadow-[0_0_12px_white]" 
                                  />
                                </div>
                                <span className="text-[11px] font-black font-mono text-neutral-400">{job.progress}%</span>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              {job.status === 'completed' ? (
                                <button 
                                  className="w-10 h-10 bg-white hover:bg-neutral-200 text-black rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-90"
                                  onClick={() => window.open(`${API_BASE}/${job.output_file}`, '_blank')}
                                >
                                  <Download size={18} />
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-700">
                                  <Clock size={18} className="opacity-50" />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {jobs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-10 py-32 text-center">
                              <div className="max-w-xs mx-auto space-y-6">
                                <div className="w-20 h-20 bg-neutral-950 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                                  <FileText className="text-neutral-800" size={36} />
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-xl font-black text-white tracking-tight">Artifact Repository Empty</h4>
                                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">Synthesize your first strategic ADM document by initiating the transformation architect.</p>
                                </div>
                                <button 
                                  onClick={() => setActiveTab('new')}
                                  className="text-[11px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                  Launch Architect <ArrowRight size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'new' && (
              <motion.div 
                key="new"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto py-10 animate-fade-in-up"
              >
                <div className="mb-16 space-y-4">
                  <h2 className="text-6xl font-black tracking-tighter leading-none">Transformation Architect</h2>
                  <p className="text-xl text-neutral-500 font-medium max-w-2xl">
                    Deploy high-fidelity AI to synthesize mission-critical artifacts based on your corporate data profile.
                  </p>
                </div>
                <GeneratorForm onSubmit={startGeneration} loading={loading} />
              </motion.div>
            )}

            {activeTab === 'status' && (
              <motion.div 
                key="status"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-3xl mx-auto py-20 text-center space-y-20 animate-fade-in-up"
              >
                {currentJob ? (
                  <>
                    <div className="relative inline-flex flex-col items-center">
                      <div className="w-72 h-72 rounded-[4rem] bg-neutral-950 border border-white/10 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-8xl font-black tracking-tighter mb-2 relative z-10">{currentJob.progress}%</span>
                        <span className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] relative z-10">Integrity Check</span>
                        
                        <svg className="absolute inset-0 w-72 h-72 rotate-[-90deg]">
                          <rect
                            x="4"
                            y="4"
                            width="280"
                            height="280"
                            rx="64"
                            fill="transparent"
                            stroke="white"
                            strokeWidth="4"
                            strokeDasharray="1120"
                            strokeDashoffset={1120 * (1 - currentJob.progress / 100)}
                            className="transition-all duration-1000 ease-out shadow-[0_0_20px_white]"
                          />
                        </svg>
                      </div>
                      
                      <div className="mt-16 space-y-6">
                        <h3 className="text-4xl font-black tracking-tighter">
                          {currentJob.status === 'completed' ? "Synthesis Finalized" : "Executing Pipeline"}
                        </h3>
                        <div className="inline-flex items-center gap-3 px-8 py-3 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">
                          {currentJob.status === 'generating' && <Activity size={14} className="animate-pulse" />}
                          Current Phase: {currentJob.current_section}
                        </div>
                      </div>
                    </div>

                    <div className="max-w-md mx-auto">
                      {currentJob.status === 'completed' ? (
                        <button 
                          onClick={() => window.open(`${API_BASE}/${currentJob.output_file}`, '_blank')}
                          className="bg-white text-black hover:bg-neutral-200 w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest flex items-center justify-center gap-4 group transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                        >
                          DOWNLOAD ARTIFACT
                          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                      ) : (
                        <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] flex items-center gap-8 text-left backdrop-blur-xl">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-black shrink-0 shadow-2xl">
                            <Zap size={40} className="fill-black" />
                          </div>
                          <div className="space-y-2">
                            <div className="font-black text-xl tracking-tight leading-none">AI Reasoning Hub</div>
                            <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                              Synthesizing complex narrative architecture for {currentJob.client_name}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-10 bg-neutral-900/20 p-20 rounded-[4rem] border border-white/5 backdrop-blur-md">
                    <div className="w-28 h-28 bg-neutral-950 rounded-[3rem] flex items-center justify-center mx-auto text-neutral-800 border border-white/5 shadow-inner">
                      <Activity size={56} className="opacity-20" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-3xl font-black text-white tracking-tighter">Pipeline Standby</h4>
                      <p className="text-neutral-500 font-medium max-w-sm mx-auto leading-relaxed text-sm">
                        Active document synthesis pipelines will materialize here. Initiate a request to begin.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Internal Components
function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-5 px-5 py-5 rounded-3xl transition-all duration-500 group relative ${
        active 
          ? 'bg-white/10 text-white shadow-inner' 
          : 'text-neutral-500 hover:text-white hover:bg-white/[0.02]'
      }`}
    >
      <div className={`${active ? 'text-white scale-110' : 'group-hover:text-white group-hover:scale-110'} transition-all duration-500 shrink-0`}>
        {icon}
      </div>
      <span className="hidden lg:block font-black text-[12px] uppercase tracking-widest leading-none">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-pill"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_white]"
        />
      )}
    </button>
  );
}

function MetricsCard({ title, value, trend, icon }: { title: string, value: any, trend: string, icon: any }) {
  return (
    <div className="bg-neutral-900/30 border border-white/5 p-10 rounded-[3.5rem] group relative overflow-hidden backdrop-blur-md hover:bg-neutral-900/50 transition-all duration-500">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-[80px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-white/10 transition-all duration-700" />
      
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="w-14 h-14 bg-white/5 rounded-[1.25rem] flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all duration-500">
          {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-xl">{trend}</span>
      </div>
      
      <div className="space-y-2 relative z-10">
        <div className="text-6xl font-black tracking-tighter leading-none">{value}</div>
        <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]">{title}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-neutral-950 text-neutral-600 border-neutral-900',
    generating: 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${styles[status]}`}>
      {status === 'generating' ? 'Processing' : status}
    </span>
  );
}

function GeneratorForm({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) {
  const [formData, setFormData] = useState({
    company_name: "Global Finance Corp",
    industry: "Banking & Financial Services",
    annual_adm_spend: 12000000,
    applications: [
      { name: "Core Banking", business_unit: "Retail", age_years: 15, tech_stack: "COBOL/Mainframe", annual_run_cost: 4500000, disposition: "Refactor" }
    ],
    competitors: [
      { name: "FinTech Pro", capabilities: ["AI Advice"], gaps: ["Legacy Support"] }
    ]
  });

  return (
    <div className="space-y-16 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-10">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <Database size={20} className="text-neutral-500" />
            </div>
            Core Intelligence
          </h3>
          <div className="space-y-6">
            <ModernInput 
              label="Entity Identity" 
              value={formData.company_name} 
              onChange={(v) => setFormData({...formData, company_name: v})} 
            />
            <ModernInput 
              label="Sector" 
              value={formData.industry} 
              onChange={(v) => setFormData({...formData, industry: v})} 
            />
            <ModernInput 
              label="ADM Budget Allocation ($)" 
              type="number"
              value={formData.annual_adm_spend} 
              onChange={(v) => setFormData({...formData, annual_adm_spend: parseInt(v)})} 
            />
          </div>
        </div>

        <div className="space-y-10">
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <LineChart size={20} className="text-neutral-500" />
            </div>
            Inventory Matrix
          </h3>
          <div className="p-10 rounded-[3.5rem] bg-neutral-900/40 border border-white/5 space-y-6 backdrop-blur-md">
            <p className="text-sm text-neutral-500 leading-relaxed font-medium">
              We've initialized the system with high-fidelity mock data. For deployment, connect your ERP/CMDB endpoints for automated ingestion.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Mainframe Legacy', 'Microservices', 'Edge Computing', 'AI Optimization'].map(tag => (
                <span key={tag} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-neutral-600 uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onSubmit(formData)}
        disabled={loading}
        className="bg-white text-black hover:bg-neutral-200 w-full py-5 rounded-2xl text-xl font-black uppercase tracking-[0.1em] transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4 group"
      >
        {loading ? (
          <Activity className="animate-spin" size={24} />
        ) : (
          <>
            INITIATE SYNTHESIS
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-500" />
          </>
        )}
      </button>
    </div>
  );
}

function ModernInput({ label, value, onChange, type = "text" }: { label: string, value: any, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-3 group">
      <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-2 group-focus-within:text-white transition-colors">{label}</label>
      <input 
        type={type}
        className="w-full bg-white/[0.02] border border-white/5 rounded-[1.5rem] px-8 py-5 text-xl font-black tracking-tight focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-white placeholder:text-neutral-800"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter value..."
      />
    </div>
  );
}
