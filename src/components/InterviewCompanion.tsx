import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Play, 
  Pause, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Volume2, 
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  BookmarkCheck,
  Award
} from 'lucide-react';

export default function InterviewCompanion() {
  const [pitchTimer, setPitchTimer] = useState<number>(120); // 2 minutes elevator pitch timer
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [activeSpeechSector, setActiveSpeechSector] = useState<number>(0);
  const [customRoleFocus, setCustomRoleFocus] = useState<'default' | 'database' | 'kafka' | 'security'>('default');

  // Flashcards concept quiz
  const [activeFlashcard, setActiveFlashcard] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Speech helper timer loop
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && pitchTimer > 0) {
      interval = setInterval(() => {
        setPitchTimer(prev => prev - 1);
        
        // Stagger visual highlighter based on time blocks
        if (pitchTimer === 105) setActiveSpeechSector(1);
        if (pitchTimer === 85) setActiveSpeechSector(2);
        if (pitchTimer === 60) setActiveSpeechSector(3);
        if (pitchTimer === 35) setActiveSpeechSector(4);
        if (pitchTimer === 15) setActiveSpeechSector(5);
      }, 1000);
    } else if (pitchTimer === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, pitchTimer]);

  const handleToggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setPitchTimer(120);
    setActiveSpeechSector(0);
  };

  // Customizable talking point texts
  const getSpeechScript = () => {
    switch (customRoleFocus) {
      case 'database':
        return [
          {
            title: "1. Applet Overview & KYC State [0:00 - 0:20]",
            text: "Let me explain the complete prepaid card lifecycle. First, the customer requests a card. We perform standard KYC and customer data validation. My contribution here was optimizing MySQL relational tables to support atomic ledger updates and establishing strong audit logging protocols."
          },
          {
            title: "2. Issuance, Offsets, and Relational Store [0:20 - 0:40]",
            text: "Once approved, CMS issues and personalizes the card. We integrated with Hardware Security Modules to generate PIN verification blocks. To guarantee ACID properties under massive multi-transaction loads, we designed double-entry transactional schemas using database row locks."
          },
          {
            title: "3. Activation State Changes [0:40 - 1:00]",
            text: "Customers activate cards through their phone apps or IVR systems. The backend translates these endpoints directly, updating card status states from INACTIVE to ACTIVE securely. This transition is fully isolated to prevent duplicate swipe vulnerabilities."
          },
          {
            title: "4. Fast Authorization and Kafka decoupled events [1:00 - 1:30]",
            text: "During live transactions, the authorization service checks available balance and performs status verification. To dramatically reduce transaction response time, after approved validations we publish an event to Kafka. Downstream services like clearing, notification, and reporting consume the event asynchronously."
          },
          {
            title: "5. Settlement and Backoffice [1:30 - 2:00]",
            text: "Finally, settlement and reconciliation are performed daily using Visa/Mastercard Base files. The cards can be blocked, frozen, or deactivated if flagged. This complete architecture balances security database safeguards with event-driven scale, which I supported through system design and support."
          }
        ];
      case 'kafka':
        return [
          {
            title: "1. Application Introduction [0:00 - 0:20]",
            text: "Let me explain the complete prepaid card lifecycle. First, customers submit card requests via mobile app or physical branches. My primary focus was the event stream integration, decoupling payment processing with Apache Kafka to guarantee zero-loss message logging."
          },
          {
            title: "2. Core CMS & HSM PIN Calculation [0:20 - 0:40]",
            text: "CMS personalizes and issues cards matching appropriate BIN codes, computing unique PIN verification blocks using standard HSM equipment. I designed the Kafka event topology to track audit blocks across this critical generation cycle."
          },
          {
            title: "3. App activation [0:40 - 1:00]",
            text: "The activation API performs validation checks before changing state. Once a card changes from INACTIVE to ACTIVE, an activation stream message is published instantly to Kafka, preparing fraud detection systems to parse subsequent merchant swipe attempts."
          },
          {
            title: "4. Transaction Validation & Async Kafka decupling [1:00 - 1:30]",
            text: "During e-commerce payment checkouts, transaction processors execute immediate balance validation. To reduce transaction response time, after approval we publish an event to Kafka. Downstream services like clearing, notification, and reporting consume the event asynchronously."
          },
          {
            title: "5. Daily Reconciliation batch settlement [1:30 - 2:00]",
            text: "Ultimately, downstream clearing consumers write to settlement registers for Visa/Mastercard processing. This event-driven design means core settlement or high-latency SMS deliveries can undergo severe networks lag without impacting transaction success speeds or authorization latencies."
          }
        ];
      case 'security':
        return [
          {
            title: "1. Safe Card Request [0:00 - 0:20]",
            text: "Let me explain the complete prepaid card lifecycle. First, customers apply for products. We perform secure identity validation checking against AML blacklists. My focus was on architectural security compliance, ensuring client data remains PCI-DSS compliant."
          },
          {
            title: "2. CMS & Hardware Security Modules (HSM) [0:20 - 0:40]",
            text: "When personalizing card PANs, security is key. PIN generation is completed physically inside HSM bounds using cleartext PIN blocks that never exit crypto boundaries. The database only retains decimal PVV offsets for POS matching verification."
          },
          {
            title: "3. Inactive Handover and Activation [0:40 - 1:00]",
            text: "To mitigate transit mail theft, cards initialize in INACTIVE state. Customers trigger activation through secure double-factor mobile validation channels, transitioning status values to ACTIVE only inside authorized session scopes."
          },
          {
            title: "4. Transaction Auth & Kafka Events [1:00 - 1:30]",
            text: "During real-world payments, the authorization service calculates fraud risk levels. To reduce transaction response time, after approval we publish an event to Kafka. Downstream services like clearing, notification, and reporting consume the event asynchronously, maintaining network boundary isolation."
          },
          {
            title: "5. Safe Deactivation [1:30 - 2:00]",
            text: "Finally, cards can be immediately blocked, frozen, or permanently deactivated when reported lost or stolen. The cache invalidation is synchronized within milliseconds. Daily settlement reconciliation completes this highly fortified payment banking system."
          }
        ];
      default:
        return [
          {
            title: "1. Phase 1 - Card Request & KYC [0:00 - 0:20]",
            text: "Let me explain the complete prepaid card lifecycle. First, the customer requests a card. CMS issues and personalizes the card, generates the PIN, and stores card details. The customer activates the card through the app or IVR."
          },
          {
            title: "2. Phase 2 - Authorization Checks [0:20 - 0:45]",
            text: "During a transaction, our authorization service validates the card, checks balance, performs fraud checks, and approves the transaction. The database updates are performed atomically to handle concurrent transactions."
          },
          {
            title: "3. Phase 3 - Decoupling via Kafka Event [0:45 - 1:15]",
            text: "To reduce transaction response time, after approval we publish an event to Kafka. Downstream services like clearing, notification, SMS/Push, and reporting consume the event asynchronously."
          },
          {
            title: "4. Phase 4 - Backoffice Settlement [1:15 - 1:40]",
            text: "Finally, settlement and reconciliation are performed daily through Visa/Mastercard Base matching files. Clear records are finalized and processed at End-of-Day."
          },
          {
            title: "5. Phase 5 - Card Closure & Contribution [1:40 - 2:00]",
            text: "And the card can later be blocked, expired, or deactivated. My contribution was mainly in REST API development, transaction authorization, Kafka integration, card lifecycle management, and production support."
          }
        ];
    }
  };

  const flashcards = [
    {
      q: "Explain how you reduce transaction response times for customers.",
      a: "To reduce transaction response time, after approval we publish an event to Kafka. Downstream services like clearing, notification, and reporting consume the event asynchronously. This decouples the real-time authorization loop from high-latency external APIs."
    },
    {
      q: "What is the purpose of starting a card in the INACTIVE state?",
      a: "Starting cards as INACTIVE prevents security breaches during shipping or physical transit. Stolen cards cannot execute transactions until activated through the customer's authenticated secure mobile application or bank IVR verification."
    },
    {
      q: "How does Hardware Security Module (HSM) secure PIN generation?",
      a: "The HSM generates decimal PIN Verification Values (PVV) from seed values using hardware-based cryptographic keys. Only encrypted blocks or offset codes are passed to our databases, keeping plain PIN numbers invisible to system microservices."
    },
    {
      q: "How do database levels prevent transaction concurrency issues?",
      a: "We implement atomic SQL balance debits (UPDATE cards SET balance = balance - :amount WHERE id = :id AND balance >= :amount) or use SELECT FOR UPDATE queries to lock the card record row during available balance valuation checks."
    }
  ];

  const speechScript = getSpeechScript();

  return (
    <div className="bg-[#12141c] text-[#eaeaea] rounded-2xl border border-[#23273a] p-6 shadow-2xl relative mt-6" id="interview-coach">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Elevator Pitch Practice Zone (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#00f2fe] uppercase font-mono flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span>Interview Practice Trainer</span>
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white mt-1">2-Minute Pitch Simulator</h3>
              <p className="text-xs text-[#a2a3b3]">
                Practice speaking clearly. Use the timeline clock to practice matching sentence lengths inside professional interview parameters.
              </p>
            </div>
            
            {/* Countdown timer */}
            <div className="bg-[#191d32] border border-[#3b53d0]/30 px-3 py-1.5 rounded-xl text-center font-mono">
              <span className="text-[9px] uppercase tracking-wider text-[#a1a7cb] block">TIMER CLOCK</span>
              <span className="text-xl font-extrabold text-white">
                {Math.floor(pitchTimer / 60)}:{String(pitchTimer % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Scenario Pivot Buttons */}
          <div className="flex flex-wrap gap-2 items-center bg-[#0d0e19] p-3 rounded-lg border border-[#1d2136]">
            <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">Select Pivot Focus:</span>
            {[
              { id: 'default', label: 'Balanced Generalist' },
              { id: 'database', label: 'Database & Ledger Expert' },
              { id: 'kafka', label: 'Kafka & High-Throughput' },
              { id: 'security', label: 'PCI Compliant Security' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setCustomRoleFocus(btn.id as any);
                  setPitchTimer(120);
                  setActiveSpeechSector(0);
                  setTimerRunning(false);
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer border ${
                  customRoleFocus === btn.id
                    ? 'bg-[#1a2342] text-[#00f2fe] border-[#2c3d77]'
                    : 'bg-transparent text-gray-400 border-[#1a1e35] hover:border-gray-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Playback controller */}
          <div className="flex items-center space-x-3 bg-[#11131e] p-3 rounded-xl border border-[#1e223b]">
            <button
              onClick={handleToggleTimer}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center space-x-1.5 cursor-pointer ${
                timerRunning 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/20'
              }`}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{timerRunning ? 'Pause Practice' : 'Start Reading Coach'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              className="px-3 py-2 rounded-lg text-xs font-bold font-mono bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] text-gray-400 font-mono pl-2">
              {timerRunning ? "🎙️ Recording visual speech pacing..." : "⏱️ Click start to launch timer pacing indicators."}
            </div>
          </div>

          {/* SCRIPT TIMELINE PANEL HIGHLIGHTER */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {speechScript.map((sector, idx) => {
              const isActive = activeSpeechSector === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSpeechSector(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-[#1d2243] border-[#3b53d0] text-white shadow shadow-indigo-950/30' 
                      : 'bg-[#11131f] border-[#181d33] text-gray-400 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-mono ${isActive ? 'text-[#00f2fe] font-bold' : 'text-zinc-600'}`}>
                      {sector.title}
                    </span>
                    {isActive && (
                      <span className="text-[9px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded font-mono animate-pulse">
                        Active Speaking segment
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-1.5 leading-relaxed font-sans ${isActive ? 'text-gray-100 font-medium' : 'text-gray-500'}`}>
                    {sector.text}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Hand: Flashcard Practice Quizzes (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#5e72e4] uppercase font-mono flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#5e72e4]" />
                <span>Conceptual Flash Cards</span>
              </span>
              <h3 className="text-xl font-bold tracking-tight text-white mt-1">Architect Q&A Cards</h3>
              <p className="text-xs text-[#a2a3b3]">
                Test your architectural knowledge of limits, Kafka decoupling, concurrency solutions, and PCI compliance rules.
              </p>
            </div>

            {/* Flashcard View Box */}
            <div className="bg-[#111424] rounded-2xl border border-[#232a48] p-5 min-h-[220px] flex flex-col justify-between relative overflow-hidden shadow-lg shadow-black/30">
              
              {/* Background watermark */}
              <HelpCircle className="absolute right-4 bottom-4 w-16 h-16 text-[#171c33]/40 pointer-events-none" />

              <div>
                <span className="text-[9px] font-bold font-mono tracking-widest text-indigo-400 uppercase">
                  CARD {activeFlashcard + 1} OF {flashcards.length}
                </span>

                <h4 className="text-sm font-semibold text-white mt-2 leading-relaxed">
                  {flashcards[activeFlashcard].q}
                </h4>

                <AnimatePresence mode="wait">
                  {showAnswer ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-[#1d233d]/80 text-xs text-[#9eeac5] font-mono leading-relaxed"
                    >
                      <span className="font-bold text-emerald-400 text-[10px] block uppercase font-mono mb-1">💡 Architecture Answer:</span>
                      {flashcards[activeFlashcard].a}
                    </motion.div>
                  ) : (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="px-4 py-2 cursor-pointer bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-[#5e72e4] hover:text-white font-mono text-xs rounded-xl transition"
                      >
                        Reveal Architectural Answer
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#1a1c2d] mt-2 text-xs font-mono">
                <button
                  disabled={activeFlashcard === 0}
                  onClick={() => {
                    setActiveFlashcard(prev => prev - 1);
                    setShowAnswer(false);
                  }}
                  className={`text-[10px] cursor-pointer ${activeFlashcard === 0 ? 'text-zinc-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'}`}
                >
                  ◀ Previous Card
                </button>

                <button
                  onClick={() => {
                    setActiveFlashcard((prev) => (prev + 1) % flashcards.length);
                    setShowAnswer(false);
                  }}
                  className="text-[10px] text-[#00f2fe] hover:underline cursor-pointer"
                >
                  Next Card ▶
                </button>
              </div>

            </div>
          </div>

          {/* Quick Checklist for interview confidence */}
          <div className="bg-[#191b2b] p-4 rounded-xl border border-[#262d4c] mt-4 space-y-3">
            <h5 className="text-xs font-bold font-mono tracking-wide text-white uppercase flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-[#00f2fe]" />
              <span>Architect Verification Score</span>
            </h5>
            
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
              To pass senior payments engineering rounds, make sure to detail how your architecture maintains database consistency and ledger stability, specifically emphasizing standard network isolations.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
