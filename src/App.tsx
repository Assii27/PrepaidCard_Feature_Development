/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InteractiveFlowchart from './components/InteractiveFlowchart';
import SandboxSimulator from './components/SandboxSimulator';
import InterviewCompanion from './components/InterviewCompanion';
import { 
  CreditCard, 
  Terminal, 
  HelpCircle, 
  Radio, 
  CheckCircle,
  FileText,
  BookmarkCheck,
  BookOpen,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'flow' | 'sandbox' | 'coach'>('flow');
  const [sandboxActivePhase, setSandboxActivePhase] = useState<number>(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className={`min-h-screen bg-[#08090f] text-gray-100 flex flex-col font-sans transition-all duration-300 ${theme === 'light' ? 'theme-light' : ''}`} id="app-root">
      
      {/* Visual background grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e243a_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      {/* Aesthetic Top Navigation Header */}
      <header className="relative z-10 border-b border-[#1b1e2f] bg-[#0c0d15]/90 backdrop-blur sticky top-0" id="app-header">
        <div className="w-full max-w-7xl mx-auto px-4 py-4 flex flex-col xl:flex-row items-center justify-between gap-4">
          
          {/* Logo Name & Slogans */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#3b53d0] to-[#00f2fe] p-2 flex items-center justify-center text-white shadow-lg shadow-[#3b53d0]/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold tracking-tight text-white uppercase font-sans">
                  Prepaid Card Lifecycle Visualizer
                </h1>
                <span className="text-[9px] bg-indigo-950/80 text-indigo-400 font-extrabold font-mono px-2 py-0.5 rounded border border-indigo-900 leading-none">
                  INTERACTIVE STUDY DECK
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                Developed By <span className="text-emerald-400 font-bold">Asif Maner</span> • Walkthroughs, API Specs, and Kafka Simulator
              </p>
            </div>
          </div>

          {/* Interactive Mode Switches & Actions */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Nav Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-[#07080d] rounded-xl border border-[#1b1f32]">
              {(['flow', 'sandbox', 'coach'] as const).map((tab) => {
                const label = {
                  flow: 'Lifecycle Map',
                  sandbox: 'Transaction Sandbox',
                  coach: 'Interview Coach'
                }[tab];

                const icon = {
                  flow: <BookOpen className="w-3.5 h-3.5" />,
                  sandbox: <Radio className="w-3.5 h-3.5 animate-pulse" />,
                  coach: <BookmarkCheck className="w-3.5 h-3.5" />
                }[tab];

                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    id={`nav-tab-btn-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#1d2243] to-[#252a4f] text-white shadow border border-[#3b53d0]/30' 
                        : 'text-gray-400 hover:text-white hover:bg-[#131726]/40'
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions (CV and Theme Toggler) */}
            <div className="flex items-center space-x-2">
              <a
                href="https://assii27.github.io/Asif_Portfolio/"
                target="_blank"
                rel="noopener noreferrer"
                id="asif-portfolio-link"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-950/60 text-indigo-400 hover:bg-indigo-900/40 hover:text-white border border-indigo-900/50 text-xs font-bold transition-all shadow-sm shadow-[#3b53d0]/10"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Asif Maner CV</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                id="theme-toggler"
                className="p-2.5 rounded-xl bg-[#07080d] text-gray-400 hover:text-white border border-[#1b1f32] hover:bg-[#131726]/40 transition-all cursor-pointer"
                title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3b53d0]" />}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Work Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 relative z-15 flex flex-col justify-between" id="app-main-content">
        
        {/* Visual interactive header notice */}
        <div className="mb-6 bg-[#111322]/80 border border-[#212642] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-950 text-indigo-400 mt-0.5">
              <CheckCircle className="w-5 h-5 text-[#00f2fe]" />
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-gray-300">How to explain this architecture in junior or senior-level interview rounds:</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-3xl mt-0.5 font-sans">
                &ldquo;First, our customer requests cards. CMS issues details, generates plain PIN blocks inside physical Hardware Security Modules, and stores details. Once activated, live merchant purchases check balances atomically. Post-approval, we decouple asynchronous work by publishing to Kafka, alerting clearing/reporting topics asynchronously.&rdquo;
              </p>
            </div>
          </div>
          <div className="flex self-end md:self-auto gap-2">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900">
              ● Sandbox Online
            </span>
          </div>
        </div>

        {/* Tab View Presentation Assembly */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'flow' && (
              <InteractiveFlowchart 
                onSelectPhase={(id) => setSandboxActivePhase(id)}
                sandboxActivePhase={sandboxActivePhase}
              />
            )}

            {activeTab === 'sandbox' && (
              <SandboxSimulator 
                onStageActive={(stageId) => setSandboxActivePhase(stageId)}
              />
            )}

            {activeTab === 'coach' && (
              <InterviewCompanion />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Informative Footnote bar */}
        <footer className="mt-12 py-6 border-t border-[#131622] flex flex-col md:flex-row justify-between items-center text-[11px] text-[#636881] font-mono gap-4">
          <div>
            <span>Prepaid Card Payment System Architecture Series • Developed By <span className="text-white font-bold">Asif Maner</span></span>
          </div>
          <div className="flex items-center space-x-6">
            <span>Server State: Mock HSM Virtualized</span>
            <span>Est. Auth Latency: &lt; 45ms</span>
            <span>Version 1.2.0</span>
          </div>
        </footer>

      </main>
    </div>
  );
}
