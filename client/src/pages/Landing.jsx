import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

// local helper components for the landing page dashboard previews
const ProfileCard = () => {
  return (
    <div className="glass-card w-64 md:w-72 p-5 flex flex-col space-y-4 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:border-amber-500/40 transition-all duration-500 cursor-default select-none border border-zinc-800 bg-zinc-900/90 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Employee Profile</span>
        <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Active</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-3.5">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-heading font-extrabold text-white text-base shadow-inner">
          JC
        </div>
        <div className="text-left">
          <h4 className="font-heading font-bold text-zinc-100 text-sm">Jane Cooper</h4>
          <p className="text-[11px] text-zinc-400">Senior UI Designer</p>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 my-1"></div>

      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-left">
        <div>
          <span className="text-zinc-500 block">Department</span>
          <span className="text-zinc-200 font-semibold">Product Design</span>
        </div>
        <div>
          <span className="text-zinc-500 block">Location</span>
          <span className="text-zinc-200 font-semibold">Remote / NY</span>
        </div>
      </div>
    </div>
  );
};

const AttendanceCard = () => {
  return (
    <div className="glass-card w-64 md:w-72 p-5 flex flex-col space-y-4 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-blue-500/40 transition-all duration-500 cursor-default select-none border border-zinc-800 bg-zinc-900/90 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Attendance</span>
        <span className="text-[10px] font-bold text-blue-400 font-mono">Shift Active</span>
      </div>

      <div className="flex items-center justify-between text-left">
        <div className="space-y-1">
          <span className="text-xs text-zinc-400 block">Daily Hours Logged</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-heading text-white">6.5</span>
            <span className="text-xs text-zinc-500">/ 8.0 hrs</span>
          </div>
        </div>
        {/* SVG Radial Progress Indicator */}
        <div className="w-12 h-12 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-zinc-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-blue-500 transition-all duration-500" strokeWidth="3" strokeDasharray="81.25, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <span className="absolute text-[10px] font-bold text-zinc-200">81%</span>
        </div>
      </div>

      <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-900/50 text-[10px] font-mono space-y-1 text-zinc-400 text-left">
        <div className="flex justify-between">
          <span>Check-in:</span>
          <span className="text-zinc-300 font-semibold">09:00 AM</span>
        </div>
        <div className="flex justify-between">
          <span>Target end:</span>
          <span className="text-zinc-300 font-semibold">05:00 PM</span>
        </div>
      </div>

      <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold font-body transition-colors cursor-pointer shadow-md shadow-blue-900/20 active:scale-95">
        Clock Out Now
      </button>
    </div>
  );
};

const PayrollCard = () => {
  return (
    <div className="glass-card w-64 md:w-72 p-5 flex flex-col space-y-4 hover:scale-105 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] hover:border-pink-500/40 transition-all duration-500 cursor-default select-none border border-zinc-800 bg-zinc-900/90 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Payroll Slip</span>
        <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] font-bold tracking-wider uppercase font-mono">
          Finalized
        </span>
      </div>

      <div className="text-left">
        <span className="text-xs text-zinc-400 block">Monthly Net Payout</span>
        <span className="text-2xl font-bold font-heading text-white tracking-tight">$8,450.00</span>
      </div>

      <div className="space-y-2 text-[10px] font-mono text-left">
        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>Base Salary</span>
            <span className="text-zinc-200 font-semibold">$6,200</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-[73.3%] h-full bg-pink-500"></div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-zinc-400">
            <span>Allowances</span>
            <span className="text-zinc-200 font-semibold">$2,250</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-[26.6%] h-full bg-amber-500"></div>
          </div>
        </div>
      </div>

      {/* Miniature Trend Line SVG */}
      <div className="flex items-center space-x-2 bg-zinc-950/40 p-2 rounded border border-zinc-900/40 text-[9px] font-mono text-zinc-500">
        <span className="whitespace-nowrap">Pay History:</span>
        <svg className="w-full h-4 text-emerald-400" viewBox="0 0 100 20" fill="none">
          <path d="M0 15 L20 12 L40 18 L60 8 L80 10 L100 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M0 15 L20 12 L40 18 L60 8 L80 10 L100 2 L100 20 L0 20 Z" fill="currentColor" fillOpacity="0.05" />
        </svg>
      </div>
    </div>
  );
};

const HeroWorkspacePreview = () => {
  return (
    <div className="relative w-full h-[460px] flex items-center justify-center overflow-visible select-none my-12">
      {/* Background Decorative Neon Glows */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-[80px] top-1/4 left-1/3"></div>
      <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] bottom-1/4 right-1/3"></div>
      
      {/* Layered stack with responsive overlapping grid layout */}
      <div className="relative w-full max-w-lg h-full flex items-center justify-center scale-90 sm:scale-100">
        {/* Card 1: Attendance Card (Left/Back layer) */}
        <div className="absolute left-[-20px] top-[30px] sm:left-[-50px] sm:top-[20px] transform -rotate-6 scale-90 sm:scale-95 z-10 hover:z-40 hover:-translate-y-4 hover:rotate-0 hover:scale-100 transition-all duration-500 ease-out">
          <AttendanceCard />
        </div>

        {/* Card 2: Profile Card (Center/Front layer) */}
        <div className="absolute top-[120px] sm:top-[110px] z-30 transform scale-100 sm:scale-105 hover:z-40 hover:-translate-y-4 hover:scale-110 transition-all duration-500 ease-out">
          <ProfileCard />
        </div>

        {/* Card 3: Payroll Card (Right/Back layer) */}
        <div className="absolute right-[-20px] top-[50px] sm:right-[-50px] sm:top-[40px] transform rotate-6 scale-90 sm:scale-95 z-20 hover:z-40 hover:-translate-y-4 hover:rotate-0 hover:scale-100 transition-all duration-500 ease-out">
          <PayrollCard />
        </div>
      </div>
    </div>
  );
};

const LeavePipelinePreview = () => {
  return (
    <div className="w-full max-w-md p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl shadow-xl space-y-6 hover:border-amber-500/30 transition-colors duration-500 select-none">
      <div className="flex justify-between items-center text-left">
        <h4 className="font-heading font-bold text-sm text-zinc-100 flex items-center space-x-2">
          <span>Leave Approval Pipeline</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono uppercase">Pending Admin</span>
        </h4>
        <span className="text-[10px] font-mono text-zinc-500">ID: #LV-9382</span>
      </div>

      <div className="flex items-center space-x-3.5 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/50 text-left">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-heading font-extrabold text-amber-500 text-sm">
          AD
        </div>
        <div>
          <h5 className="font-heading font-semibold text-zinc-200 text-xs">Alex Danvers</h5>
          <p className="text-[10px] text-zinc-500 font-mono">Requested: Annual Paid Vacation (5 days)</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 border-l border-zinc-800/80 ml-4 py-2 text-left">
        {/* Step 1: Checked */}
        <div className="relative">
          <span className="absolute left-[-29px] top-0 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 text-[8px] font-bold">
            ✓
          </span>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-zinc-200 block">1. Employee Submission</span>
            <span className="text-[9px] text-zinc-500 font-mono">Submitted by Alex on Aug 21, 09:30 AM</span>
          </div>
        </div>

        {/* Step 2: Checked */}
        <div className="relative">
          <span className="absolute left-[-29px] top-0 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 text-[8px] font-bold">
            ✓
          </span>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-zinc-200 block">2. Manager Policy Validation</span>
            <span className="text-[9px] text-zinc-500 font-mono">Approved by Sarah Miller (Tech Manager) - Aug 21, 02:15 PM</span>
          </div>
        </div>

        {/* Step 3: Pending */}
        <div className="relative">
          <span className="absolute left-[-29px] top-0 w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-500 text-[8px] font-bold animate-pulse">
            ●
          </span>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-zinc-300 block">3. HR / Payroll Allocation Offset</span>
            <span className="text-[9px] text-zinc-500 font-mono">Pending final calculation update by Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsOverlappingCards = () => {
  return (
    <div className="relative w-full max-w-xl h-96 flex items-center justify-center select-none overflow-visible">
      {/* Background radial ambient light */}
      <div className="absolute w-64 h-64 rounded-full bg-amber-500/5 blur-[70px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative w-full max-w-md h-full flex items-center justify-center scale-95 sm:scale-100">
        {/* Card A: Team Attendance Rate (Left/Back layer) */}
        <div className="absolute left-[-10px] top-[30px] sm:left-[-30px] sm:top-[20px] transform -rotate-3 hover:scale-105 hover:-translate-y-4 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/30 transition-all duration-500 z-10 border border-zinc-200 bg-white w-60 sm:w-64 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-3 text-left">
            <span className="text-[10px] font-mono tracking-wide text-zinc-400 uppercase">Attendance Metric</span>
            <span className="text-[9px] font-bold text-emerald-600 font-mono">+1.2% MoM</span>
          </div>
          <div className="space-y-1 mb-4 text-left">
            <span className="text-xs text-zinc-500 block">Weekly Attendance Rate</span>
            <span className="text-2xl font-bold font-heading text-zinc-800">94.8%</span>
          </div>
          <div className="flex items-end justify-between h-12 pt-2 px-1">
            <div className="w-6 bg-zinc-100 rounded-t h-[70%]"></div>
            <div className="w-6 bg-zinc-100 rounded-t h-[80%]"></div>
            <div className="w-6 bg-zinc-200 rounded-t h-[65%]"></div>
            <div className="w-6 bg-amber-500 rounded-t h-[94.8%]"></div>
          </div>
        </div>

        {/* Card B: Absence Breakdown (Right/Front layer) */}
        <div className="absolute right-[-10px] bottom-[30px] sm:right-[-30px] sm:bottom-[20px] transform rotate-3 hover:scale-105 hover:-translate-y-4 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-500 z-20 border border-zinc-200 bg-white w-60 sm:w-64 p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-3 text-left">
            <span className="text-[10px] font-mono tracking-wide text-zinc-400 uppercase">Absence Analytics</span>
            <span className="text-[9px] font-bold text-blue-600 font-mono">This Month</span>
          </div>
          <div className="space-y-1 mb-3 text-left">
            <span className="text-xs text-zinc-500 block">Active Leave Breakdown</span>
            <span className="text-lg font-bold font-heading text-zinc-800">3 Employees Out</span>
          </div>
          <div className="space-y-2 text-[9px] font-mono text-zinc-500 pt-1 text-left">
            <div className="flex justify-between">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>Engineering</span>
              <span className="text-zinc-800 font-semibold">2 Requests</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>Marketing</span>
              <span className="text-zinc-800 font-semibold">1 Request</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mr-1.5"></span>Finance</span>
              <span className="text-zinc-800 font-semibold">0 Requests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  
  // Skeletal contact form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="landing-wrapper min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-body selection:bg-amber-500 selection:text-black">
      
      {/* 1. Header / Navigation */}
      <header className="bg-zinc-950/70 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-900 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {/* Minimal Logo */}
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-base">
              D
            </div>
            <span className="font-heading font-bold text-lg tracking-wider text-white">
              dayflow
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded text-sm font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-zinc-950 pt-20 pb-32 overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#3f3f46_1px,transparent_1px),linear-gradient(to_bottom,#3f3f46_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Soft Radial Ambient Glow */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-900/10 blur-[120px] top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-white max-w-3xl leading-tight mb-8">
            Build and optimize <br />your workforce.
          </h1>
          
          {/* Layered Floating Workspace Dashboard Preview */}
          <HeroWorkspacePreview />

          <p className="text-zinc-400 max-w-xl text-base md:text-lg mb-10 leading-relaxed">
            The automated, centralized workspace to streamline your organization's daily directory structure, check-in schedules, leaves approvals, and payroll distributions.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded transition-all cursor-pointer hover:scale-105 shadow-md"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-200 font-bold rounded transition-all cursor-pointer hover:scale-105"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </section>

      {/* 3. Light Feature Section 1 */}
      <section className="bg-zinc-50 text-zinc-900 py-24 border-t border-zinc-200">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-zinc-950">
              A better way to <br />people operations.
            </h2>
            <p className="text-zinc-600 text-base md:text-lg leading-relaxed max-w-lg">
              Automate the administrative overhead so you can focus on building a high-performing team. Dayflow tracks attendance logs, compiles salary parameters, and updates leave applications dynamically.
            </p>
          </div>

          {/* Leave Request Pipeline Workflow Preview */}
          <div className="flex justify-center items-center">
            <LeavePipelinePreview />
          </div>

        </div>
      </section>

      {/* 4. Statement Typography Section */}
      <section className="bg-zinc-50 text-zinc-900 py-16 flex flex-col items-center justify-center overflow-hidden">
        {/* Floating Circle Shield Logo */}
        <div className="mb-12 animate-float" style={{ animationDuration: '8s' }}>
          <div className="central-logo-shield">
            <span className="text-gradient-gold font-heading font-extrabold text-2xl tracking-wider select-none">
              D
            </span>
          </div>
        </div>

        <div className="container mx-auto px-6 text-center max-w-5xl leading-tight">
          <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tight space-y-4">
            <span className="text-gradient-gold block">Focus on your growth</span>
            <span className="text-zinc-950 block">instead</span>
            <span className="text-gradient-blue block">of administrative distractions.</span>
          </h2>
        </div>
      </section>

      {/* 5. Features Grid Section */}
      <section className="bg-zinc-50 text-zinc-900 py-24 relative overflow-hidden">
        
        {/* Soft colorful blur blobs behind cards */}
        <div className="absolute w-80 h-80 rounded-full bg-amber-400/5 blur-[80px] top-1/3 left-1/4"></div>
        <div className="absolute w-80 h-80 rounded-full bg-blue-400/5 blur-[80px] bottom-1/3 right-1/4"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-4xl">
          {/* Rounded White Glassmorphism Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-zinc-200 p-8 md:p-12 rounded-3xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Feature 1 */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-amber-600 font-bold">
                  ◯
                </div>
                <h3 className="font-heading text-lg font-bold text-zinc-950">Holistic Directory</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Consolidate complete employee files, designation metrics, and structural departments into a singular registry.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-amber-600 font-bold">
                  ◑
                </div>
                <h3 className="font-heading text-lg font-bold text-zinc-950">Personal Portals</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Provide custom read-only access for staff to review their payroll structure components, check-in history, and leave logs.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-amber-600 font-bold">
                  ⚭
                </div>
                <h3 className="font-heading text-lg font-bold text-zinc-950">Efficient Automation</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Single-click clock-in and check-out tracking, coupled with direct validation formulas that normalize daily logs.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-amber-600 font-bold">
                  ⧈
                </div>
                <h3 className="font-heading text-lg font-bold text-zinc-950">Transparent Workflows</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Establish a secure leave pipeline with real-time approvals, reject triggers, and structured payroll calculations.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Overlapping Analytics Previews */}
      <section className="bg-zinc-50 py-20 border-b border-zinc-200 flex justify-center items-center">
        <AnalyticsOverlappingCards />
      </section>

      {/* 7. Dark Intersection Section */}
      <section className="bg-zinc-950 pt-24 pb-16 border-t border-zinc-900 relative overflow-hidden">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] bottom-10 left-1/2 -translate-x-1/2"></div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight mb-4">
            Living at the intersection of human talent and automated systems.
          </h2>
          <p className="text-zinc-500 text-sm max-w-md mb-12">
            DayFlow integrates core organizational records, making the workflow simple to audit, scale, and adjust.
          </p>

          {/* Interactive Glow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left mb-20">
            {/* Card 1 */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl glow-card-gold flex flex-col justify-between h-48">
              <div>
                <span className="text-amber-500 text-xs font-bold font-mono tracking-widest uppercase">01 / Directory</span>
                <h4 className="font-heading text-base font-bold text-white mt-2">Unified Files</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Connect designation files and department structures to profile entities.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl glow-card-cyan flex flex-col justify-between h-48">
              <div>
                <span className="text-cyan-500 text-xs font-bold font-mono tracking-widest uppercase">02 / Logs</span>
                <h4 className="font-heading text-base font-bold text-white mt-2">Clocking Schedules</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Log check-in, check-out, and calculate attendance logs in real-time.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl glow-card-blue flex flex-col justify-between h-48">
              <div>
                <span className="text-blue-500 text-xs font-bold font-mono tracking-widest uppercase">03 / Payroll</span>
                <h4 className="font-heading text-base font-bold text-white mt-2">Salary Calculations</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Define monthly base salary, allowance additions, and deduction formulas.
              </p>
            </div>
          </div>

          {/* 8. Skeletal Inquiry Form (Inside the Dark Section) */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl shadow-xl w-full max-w-lg text-left relative z-20">
            <h3 className="font-heading text-lg font-bold text-white mb-2">Connect with DayFlow HR</h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Have questions about deploying this MVP scaffold? Send us an inquiry.
            </p>
            
            {submitted ? (
              <div className="bg-amber-500/10 text-amber-400 p-4 rounded border border-amber-500/20 text-xs font-medium leading-relaxed">
                ✓ Inquiry successfully submitted. We will connect soon to enhance this layout.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@organization.com"
                      className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">HR / Organization Inquiry</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your organization requirements..."
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 text-white rounded h-24 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold rounded cursor-pointer transition-colors"
                >
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-8 text-center text-xs text-zinc-600 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>© 2026 DayFlow HRMS. Hackathon MVP Scaffold.</span>
          <div className="flex space-x-6 text-zinc-500">
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">Security</span>
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">API Docs</span>
            <span className="hover:text-zinc-300 transition-colors cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
