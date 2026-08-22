import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

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
          
          {/* Centered Spline 3D/CSS Sphere Placeholder */}
          <div className="my-12 flex justify-center items-center w-full min-h-[360px]">
            {/* CSS Glossy Sphere representing the 3D ribbon mesh */}
            <div className="glass-sphere-hero animate-float flex items-center justify-center text-center">
              <span className="text-white/20 text-xs font-mono select-none tracking-widest uppercase">
                [ Spline 3D Placeholder ]
              </span>
            </div>
          </div>

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

          {/* Right Gold Mesh Sphere Placeholder */}
          <div className="flex justify-center items-center">
            <div className="glass-sphere-gold animate-float flex items-center justify-center text-center" style={{ animationDelay: '-2s' }}>
              <span className="text-black/20 text-xs font-mono select-none tracking-widest uppercase">
                [ Spline 3D Placeholder ]
              </span>
            </div>
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

      {/* 6. Overlapping Spheres Section */}
      <section className="bg-zinc-50 py-20 border-b border-zinc-200 flex justify-center items-center">
        <div className="flex -space-x-12 relative select-none">
          <div className="glass-sphere-overlapping-1 animate-float" style={{ animationDelay: '-1s' }}></div>
          <div className="glass-sphere-overlapping-2 animate-float" style={{ animationDelay: '-3.5s' }}></div>
        </div>
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
