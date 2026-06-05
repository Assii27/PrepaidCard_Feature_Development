import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LIFECYCLE_PHASES } from '../data/lifecycleSteps';
import { 
  CreditCard, 
  Settings, 
  ToggleLeft, 
  Activity, 
  Send, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  Database, 
  FileCode, 
  HelpCircle, 
  ArrowRight,
  Sparkles,
  Quote
} from 'lucide-react';

interface InteractiveFlowchartProps {
  onSelectPhase?: (phaseId: number) => void;
  sandboxActivePhase?: number;
}

export default function InteractiveFlowchart({ onSelectPhase, sandboxActivePhase }: InteractiveFlowchartProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'api' | 'db' | 'interview' | 'qa'>('details');

  const selectedPhase = LIFECYCLE_PHASES.find(p => p.id === selectedPhaseId) || LIFECYCLE_PHASES[0];

  const getPhaseIcon = (id: number) => {
    switch (id) {
      case 1: return <CreditCard className="w-5 h-5" />;
      case 2: return <Settings className="w-5 h-5" />;
      case 3: return <ToggleLeft className="w-5 h-5" />;
      case 4: return <Activity className="w-5 h-5" />;
      case 5: return <Send className="w-5 h-5" />;
      case 6: return <RefreshCw className="w-5 h-5" />;
      case 7: return <ShieldAlert className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const selectPhase = (id: number) => {
    setSelectedPhaseId(id);
    if (onSelectPhase) {
      onSelectPhase(id);
    }
  };

  return (
    <div className="bg-[#12141c] text-[#eaeaea] rounded-2xl border border-[#23273a] p-6 shadow-2xl relative overflow-hidden" id="interactive-flowchart">
      {/* Decorative background grid element */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e243a_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Grid Container */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Horizontal/Vertical Timeline Navigation */}
        <div className="lg:col-span-4 flex flex-col justify-start space-y-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#5e72e4] uppercase font-mono">Interactive Blueprint</span>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">Prepaid Card Lifecycle</h3>
            <p className="text-xs text-[#a2a3b3] mt-2">
              Select any stage below to analyze backend system routing, API payloads, database schemas, and interview talk points.
            </p>
          </div>

          <div className="flex flex-col space-y-2 mt-4 max-h-[480px] overflow-y-auto pr-1">
            {LIFECYCLE_PHASES.map((phase) => {
              const isSelected = phase.id === selectedPhaseId;
              const isSandboxActive = sandboxActivePhase === phase.id;

              return (
                <button
                  key={phase.id}
                  id={`phase-nav-btn-${phase.id}`}
                  onClick={() => selectPhase(phase.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden flex items-center space-x-3 group ${
                    isSelected 
                      ? 'bg-[#1a1f36] border-[#3b53d0] text-white shadow-lg shadow-[#1a1f36]/40' 
                      : 'bg-[#151824]/60 border-[#1c2033] hover:border-[#2b3558] hover:bg-[#151824]'
                  }`}
                >
                  {/* Active highlight bar on left border */}
                  {isSelected && (
                    <motion.div 
                      layoutId="activeBorder"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-[#5e72e4]"
                    />
                  )}

                  {/* Active background glow */}
                  {isSandboxActive && (
                    <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}

                  {/* Icon Frame */}
                  <div className={`p-2 rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-[#3b53d0] text-white' 
                      : 'bg-[#1c2033] text-[#cfd1e3] group-hover:bg-[#252c48]'
                  }`}>
                    {getPhaseIcon(phase.id)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-none truncate ${isSelected ? 'text-white' : 'text-[#eaeaea]'}`}>
                      {phase.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {isSandboxActive && (
                        <span className="text-[10px] font-semibold text-emerald-400 font-mono flex items-center">
                          ● Running Sandbox
                        </span>
                      )}
                      <span className="text-[10px] text-[#a2a3b2] truncate font-mono">
                        {phase.techKeywords[0]} • {phase.techKeywords[1]}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 text-[#525f7f] transition-transform ${
                    isSelected ? 'translate-x-1 text-[#5e72e4]' : 'group-hover:translate-x-1'
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stage Detail Explorer Panel */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
          {/* Section Headers Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-[#0b0c13] rounded-xl border border-[#1b1e2e]">
            {(['details', 'api', 'db', 'interview', 'qa'] as const).map((tab) => {
              const label = {
                details: 'Overview',
                api: 'API Specs',
                db: 'DB Schema',
                interview: 'Interview Script',
                qa: 'Q&A Prep'
              }[tab];

              const icon = {
                details: <CreditCard className="w-3.5 h-3.5" />,
                api: <FileCode className="w-3.5 h-3.5" />,
                db: <Database className="w-3.5 h-3.5" />,
                interview: <Terminal className="w-3.5 h-3.5" />,
                qa: <HelpCircle className="w-3.5 h-3.5" />
              }[tab];

              return (
                <button
                  key={tab}
                  id={`tab-btn-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    activeTab === tab 
                      ? 'bg-[#1e243a] text-white shadow' 
                      : 'text-[#888baf] hover:text-white'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents Frame */}
          <div className="flex-1 bg-[#151724]/90 rounded-2xl border border-[#21263d] p-5 mt-4 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedPhaseId}-${activeTab}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 h-full"
              >
                {/* 1. OVERVIEW DETAIL PANEL */}
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#5e72e4] tracking-widest font-mono block">STATED PROCESS DESCRIPTION</span>
                        <h4 className="text-xl font-bold text-white mt-1">{selectedPhase.title}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-xs justify-end">
                        {selectedPhase.techKeywords.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[#252a44] border border-[#33395b] text-[10px] font-mono text-indigo-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-[#cacbdc] leading-relaxed">
                      {selectedPhase.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-[#11131e] rounded-xl p-4 border border-[#1e2133]">
                        <h5 className="text-xs font-bold font-mono tracking-wide text-[#777aa0] uppercase flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Core Operations & Actions</span>
                        </h5>
                        <ul className="text-xs text-[#b8b9cb] mt-3 space-y-2">
                          {selectedPhaseId === 1 && (
                            <>
                              <li>💳 Customer creates record digitally</li>
                              <li>🔍 REST API forwards national identity card to check systems</li>
                              <li>🤖 Internal system checks AML whitelist matches</li>
                              <li>📬 Card product type selection mapped instantly</li>
                            </>
                          )}
                          {selectedPhaseId === 2 && (
                            <>
                              <li>🛡️ Standard HSM decrypts seed variables</li>
                              <li>📦 Primary Account Number formatted under BIN range</li>
                              <li>🔑 Formulates unique decimal PVV and PIN values</li>
                              <li>💾 Relational values stored utilizing strict encryption</li>
                            </>
                          )}
                          {selectedPhaseId === 3 && (
                            <>
                              <li>📱 User inputs physical card parameters in secure dashboard</li>
                              <li>🔐 CVV is generated on HSM and checked against the card record</li>
                              <li>🟢 Card transitions state instantly to ACTIVE in ledger</li>
                              <li>🚀 Broadcasts event triggers to notify microservice engines</li>
                            </>
                          )}
                          {selectedPhaseId === 4 && (
                            <>
                              <li>🛒 POS machine sends encrypted bitmapped payment block</li>
                              <li>🔒 Decrypts PIN block within HSM bounds synchronously</li>
                              <li>💰 Performs strict relational table locks to verify balances</li>
                              <li>✏️ Deducts exact transaction amount securely</li>
                            </>
                          )}
                          {selectedPhaseId === 5 && (
                            <>
                              <li>🌐 Fast payment execution bypasses synchronous reporting calls</li>
                              <li>📬 Publishes rich JSON metadata to specific Kafka topics</li>
                              <li>🔔 Consumer nodes process messaging alerts asynchronously</li>
                              <li>🛡️ Guarantees ultra low merchant processing response delays</li>
                            </>
                          )}
                          {selectedPhaseId === 6 && (
                            <>
                              <li>💼 Clears authorization logs from local relational tables</li>
                              <li>📁 Generates standard Visa/Mastercard reconciliation text files</li>
                              <li>📈 Reconciles daily counts with physical scheme files</li>
                              <li>🏦 Triggers end-of-day bank level book settlement payouts</li>
                            </>
                          )}
                          {selectedPhaseId === 7 && (
                            <>
                              <li>🚫 Locks incoming payment authorizations in milliseconds</li>
                              <li>⛔ State changes to BLOCKED, restricting scheme validations</li>
                              <li>❌ Evicts cached card objects from high speed active structures</li>
                              <li>🔑 Supports customer temporary freeze/unfreeze controls</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="bg-[#11131e] rounded-xl p-4 border border-[#1e2133] flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold font-mono tracking-wide text-[#777aa0] uppercase flex items-center space-x-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#5e72e4]" />
                            <span>System Context & Tech</span>
                          </h5>
                          <div className="text-xs text-[#cacbdc] mt-3 space-y-2.5">
                            <p>
                              This stage utilizes high-security {selectedPhase.techKeywords[1]} and ensures strict consistency standards, satisfying financial auditing limits.
                            </p>
                            <div className="flex items-center space-x-2 p-2 bg-[#171a2b] rounded-lg border border-[#21263f]">
                              <Terminal className="w-4 h-4 text-indigo-400" />
                              <span className="font-mono text-[10px] text-gray-300">
                                {selectedPhase.apiEndpoints.length > 0 ? selectedPhase.apiEndpoints[0].path : 'Internal DB Process'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#1a1c2a] flex justify-between items-center text-[10px] font-mono text-[#74789d]">
                          <span>Status Target:</span>
                          <span className="font-bold text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                            {selectedPhaseId === 1 ? 'INACTIVE (init)' : selectedPhaseId === 2 ? 'INACTIVE (issued)' : selectedPhaseId === 3 ? 'ACTIVE' : selectedPhaseId === 7 ? 'BLOCKED/EXPIRED' : 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. API SPECIFICATIONS PANEL */}
                {activeTab === 'api' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white flex items-center space-x-2">
                        <FileCode className="w-4 h-4 text-indigo-400" />
                        <span>System REST Endpoints & Handlers</span>
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400">Content Type: application/json</span>
                    </div>

                    {selectedPhase.apiEndpoints.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-[#11131e] rounded-xl border border-[#1e2133] text-center">
                        <Database className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-xs text-gray-400">This stage does not expose direct public REST APIs. It is handled by background batch schedulers or broker transactions.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {selectedPhase.apiEndpoints.map((endpoint, idx) => (
                          <div key={idx} className="bg-[#0b0c13] rounded-xl border border-[#1c1f30] overflow-hidden">
                            {/* Path Indicator Banner */}
                            <div className="flex items-center justify-between bg-[#11131e] px-3 py-2 border-b border-[#1c1f30]">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono ${
                                  endpoint.method === 'POST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                                  endpoint.method === 'PUT' ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                                }`}>
                                  {endpoint.method}
                                </span>
                                <span className="font-mono text-xs text-gray-300 font-semibold">{endpoint.path}</span>
                              </div>
                              <span className="text-[10px] text-gray-400">{endpoint.description}</span>
                            </div>

                            {/* Payload Visualizer Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 font-mono text-[11px]">
                              {endpoint.payload && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-500 block font-bold tracking-wider">REQUEST BODY</span>
                                  <pre className="bg-[#08090e] p-2.5 rounded-lg border border-[#181a29] text-[#7ce0ff] max-h-[140px] overflow-y-auto">
                                    {endpoint.payload}
                                  </pre>
                                </div>
                              )}
                              {endpoint.response && (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-gray-500 block font-bold tracking-wider">RESPONSE PAYLOAD (200 OK)</span>
                                  <pre className="bg-[#08090e] p-2.5 rounded-lg border border-[#181a29] text-[#71ef99] max-h-[140px] overflow-y-auto">
                                    {endpoint.response}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. DATABASE SCHEMA PANEL */}
                {activeTab === 'db' && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center space-x-2">
                      <Database className="w-4 h-4 text-[#5e72e4]" />
                      <span>MySQL Relational Ledger Schemas</span>
                    </h4>

                    {selectedPhase.dbTables.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 bg-[#11131e] rounded-xl border border-[#1e2133] text-center">
                        <Terminal className="w-8 h-8 text-gray-500 mb-2 animate-pulse" />
                        <p className="text-xs text-gray-400 font-mono">
                          This stage utilizes external Kafka brokers or local caches (like Apache Redis memory profiles). No raw DB schema updates are written here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto">
                        {selectedPhase.dbTables.map((table, idx) => (
                          <div key={idx} className="bg-[#10121e] rounded-xl border border-[#1c1f30] overflow-hidden">
                            <div className="bg-[#161a2c] px-4 py-2 border-b border-[#212642] flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5">
                                <Database className="w-3.5 h-3.5 text-blue-400" />
                                <span>Table: {table.tableName}</span>
                              </span>
                              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-900">
                                InnoDb Engine
                              </span>
                            </div>

                            <table className="w-full text-left font-mono text-xs">
                              <thead>
                                <tr className="bg-[#08090e] border-b border-[#131726] text-gray-400 font-semibold">
                                  <th className="p-2.5">Column Name</th>
                                  <th className="p-2.5">SQL Type</th>
                                  <th className="p-2.5">Data Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#131726]">
                                {table.columns.map((col, cIdx) => (
                                  <tr key={cIdx} className="hover:bg-[#151828] text-gray-300">
                                    <td className="p-2.5 font-bold text-blue-200">{col.name}</td>
                                    <td className="p-2.5 text-indigo-300 text-[11px]">{col.type}</td>
                                    <td className="p-2.5 text-gray-400 text-[11px]">{col.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. INTERVIEW PREPARATION SCRIPT PANEL */}
                {activeTab === 'interview' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span>Interactive Interview Talking Points</span>
                      </h4>
                      <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono px-2 py-0.5 rounded">
                        Recommended Answer
                      </span>
                    </div>

                    <div className="bg-[#0b0c13] rounded-xl border border-[#1b1e2e] p-5 relative">
                      <Quote className="absolute right-4 top-4 w-12 h-12 text-[#1c1f30] pointer-events-none" />

                      <p className="text-xs font-mono text-[#a5abbf] uppercase tracking-widest">
                        How should you explain your contribution?
                      </p>

                      <blockquote className="mt-3 text-sm text-[#00f2fe] italic font-medium leading-relaxed border-l-2 border-[#00f2fe] pl-4">
                        &ldquo;{selectedPhase.interviewSnippet}&rdquo;
                      </blockquote>

                      {selectedPhaseId === 5 && (
                        <div className="mt-4 p-3.5 bg-indigo-950/50 rounded-lg border border-indigo-900/60">
                          <p className="text-[11px] font-mono text-indigo-200">
                            💡 <span className="font-bold underline text-white">Pro Tip for explaining Kafka:</span> <br />
                            &ldquo;To reduce transaction response time, after approval we publish an event to Kafka. Downstream services like clearing, notification, and reporting consume the event asynchronously.&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#11131e] rounded-xl p-4 border border-[#1e2133] space-y-2">
                      <h5 className="text-xs font-semibold text-white">Suggested Context Additions:</h5>
                      <p className="text-xs text-[#a2a3b3] leading-relaxed">
                        Mentioning the use of <span className="text-white font-semibold">Row-level locking</span>, <span className="text-white font-semibold">PCI-DSS standards</span>, or <span className="text-white font-semibold">HSM integrations</span> demonstrates you understand the physical security demands of production banking architectures.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. INDEPTH QUESTIONS & ANSWERS PREP */}
                {activeTab === 'qa' && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Deep Dive Architect Q&A</span>
                    </h4>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {selectedPhase.commonQuestions.map((qa, idx) => (
                        <div key={idx} className="bg-[#111422] p-4 rounded-xl border border-[#21263d] space-y-2">
                          <p className="text-xs font-bold text-amber-300 font-mono">
                            Q: {qa.q}
                          </p>
                          <p className="text-xs text-[#cad1e5] leading-relaxed">
                            <span className="font-bold text-emerald-400 font-mono">A:</span> {qa.a}
                          </p>
                        </div>
                      ))}

                      <div className="bg-[#0b0c13] p-4 rounded-xl border border-[#171926] flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-indigo-950 text-[#5e72e4]">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Need customization help?</p>
                          <p className="text-[10px] text-[#868ca2] mt-0.5">Use the Intersect Interview Coach tab to design custom response maps.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
