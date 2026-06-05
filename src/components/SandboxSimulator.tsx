import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Transaction, SimulationLog } from '../types';
import { 
  CreditCard, 
  Smartphone, 
  Database, 
  Radio, 
  MessageSquare, 
  FileSpreadsheet, 
  Coins, 
  Play, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Lock, 
  Unlock, 
  CheckCircle, 
  ArrowRight, 
  Bell, 
  Terminal,
  Cpu,
  AlertCircle
} from 'lucide-react';

interface SandboxSimulatorProps {
  onStageActive?: (stageId: number) => void;
}

export default function SandboxSimulator({ onStageActive }: SandboxSimulatorProps) {
  // Initial states
  const [card, setCard] = useState<Card | null>(null);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Transaction formulation controls
  const [txAmount, setTxAmount] = useState<number>(500);
  const [txMerchant, setTxMerchant] = useState<string>("Amazon Prime");
  const [txType, setTxType] = useState<'POS' | 'ATM' | 'E-COMMERCE'>("E-COMMERCE");
  const [wrongPinSelected, setWrongPinSelected] = useState<boolean>(false);
  const [potentialFraudSelected, setPotentialFraudSelected] = useState<boolean>(false);

  // Active step counter for transaction playback
  const [simState, setSimState] = useState<'idle' | 'pos_sent' | 'check_balance' | 'debiting' | 'approved' | 'kafka_pub' | 'async_processing' | 'reconciled' | 'declined'>('idle');
  const [simMessage, setSimMessage] = useState<string>("Ready to test transactions.");
  
  // Custom interactive tutorial player
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [activeStepTimer, setActiveStepTimer] = useState<any>(null);

  // Kafka message queue simulated visualization state 
  const [kafkaMessages, setKafkaMessages] = useState<any[]>([]);
  const [smsNotificationMsg, setSmsNotificationMsg] = useState<string | null>(null);
  const [smsActive, setSmsActive] = useState<boolean>(false);
  const [clearingRecords, setClearingRecords] = useState<any[]>([]);
  const [reconciledCount, setReconciledCount] = useState<number>(0);

  // Auto scroll console helper
  const addLog = (
    source: SimulationLog['source'], 
    type: SimulationLog['type'], 
    message: string, 
    payload?: any
  ) => {
    const newLog: SimulationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      type,
      message,
      payload
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Limit to 50 logs of memory
  };

  const handleStageSelect = (stageId: number) => {
    if (onStageActive) {
      onStageActive(stageId);
    }
  };

  // 1. CARD REQUEST WORKFLOW
  const handleRequestCard = () => {
    handleStageSelect(1);
    addLog('API_GATEWAY', 'info', "POST /api/v1/customers/kyc-check - KYC identity check requested for Jane Doe");
    
    // Simulate background credit verification
    setTimeout(() => {
      addLog('DATABASE', 'success', "Row inserted: customer 'Jane Doe' approved. status: ACTIVE_KYC");
      
      const newCard: Card = {
        id: "card_" + Math.random().toString(36).substr(2, 9),
        cardNumber: "Generating...",
        cvv: "CVV",
        expiryDate: "MM/YY",
        pin: "----",
        balance: 5000,
        status: 'DRAFT',
        customerId: "cust_902183",
        customerName: "Jane Doe",
        customerKycStatus: 'APPROVED',
        pinGenerated: false,
      };

      setCard(newCard);
      addLog('CMS', 'info', "Card Request initialized in system. Card record created in DRAFT status.");
      setSimMessage("Card application approved. Step (1) completed. Navigate to Step (2) to issue the card.");
    }, 800);
  };

  // 2. CARD ISSUANCE WORKFLOW (CMS + HSM PIN Gen)
  const handleIssueCardDetails = () => {
    if (!card) return;
    handleStageSelect(2);
    addLog('CMS', 'info', "Card Issuance started: Allocating PAN index from BIN range 453271");

    setTimeout(() => {
      // Formulate card specs
      const pan = "4532 71" + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " 9924";
      const cvv = Math.floor(100 + Math.random() * 900).toString();
      const year = (new Date().getFullYear() + 5).toString().slice(-2);
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      addLog('HSM', 'info', `Acquired crypto variables from core vault. Requesting PIN Calculation Block for PAN: ${pan}`);
      
      setTimeout(() => {
        addLog('HSM', 'success', "PIN Block calculated: Hash Code (PVV) '9931' saved safely.");
        
        setCard(prev => {
          if (!prev) return null;
          return {
            ...prev,
            cardNumber: pan,
            cvv,
            expiryDate: `${month}/${year}`,
            pin: "1234", // Simulated plaintext PIN
            status: 'INACTIVE', // Safe starting lifecycle state
            pinGenerated: true
          };
        });

        addLog('DATABASE', 'success', "MySQL UPDATE matching card row info. Card is currently INACTIVE.");
        setSimMessage("Primary Account Number & CVV physical characteristics customized. PIN assigned through HSM securely. Code updated state to INACTIVE.");
      }, 700);
    }, 600);
  };

  // 3. SECURE ACTIVATION WORKFLOW
  const handleActivateCard = () => {
    if (!card) return;
    handleStageSelect(3);
    addLog('API_GATEWAY', 'info', "PUT /api/v1/cards/activate - User authenticated and triggered activation.");
    
    setTimeout(() => {
      setCard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'ACTIVE'
        };
      });

      addLog('DATABASE', 'success', "SQL Update: card status 'INACTIVE' ➔ 'ACTIVE' committed.");
      addLog('SMS_SERVICE', 'success', "SMS Transmitted: 'Dear Jane Doe, your prepaid card starting with 453271 has been successfully activated!'");
      setSimMessage("Card successfully activated! The card is now ACTIVE with an initial spending ledger limit of ₹5000. Ready for E-Commerce or POS debits.");
    }, 700);
  };

  // 4. TRANSACTION ENGINE (STEP-BY-STEP SIMULATOR)
  const playStepByStepTransaction = async () => {
    if (!card || card.status !== 'ACTIVE') {
      addLog('CLIENT', 'error', "Cannot complete transaction: Card is not in ACTIVE state.");
      return;
    }

    setIsPlayingAuto(true);
    setSimMessage("Launching real-time step transaction scenario...");
    
    // Step 1: POS Sends Transaction
    setSimState('pos_sent');
    handleStageSelect(4);
    addLog('CLIENT', 'info', `[POS Terminal] Sending payment authorization request for ₹${txAmount} at '${txMerchant}'`);
    await delay(1200);

    // Step 2: Authorization Service checks card status / PIN
    setSimState('check_balance');
    addLog('AUTH_SERVICE', 'info', `Verifying card characteristics. Locking database rows for Card ID: ${card.id}`);
    
    // Check if block or wrong pin options
    if (wrongPinSelected) {
      addLog('HSM', 'warn', "PIN Verification Failure: PIN Block from POS does not match PVV stored in DB.");
      setSimState('declined');
      addLog('API_GATEWAY', 'warn', `Transaction DECLINED: Incorrect PIN (Amount: ₹${txAmount})`);
      setSimMessage("Transaction Declined: HSM reported incorrect PIN block verification.");
      setIsPlayingAuto(false);
      return;
    }

    if (potentialFraudSelected) {
      addLog('AUTH_SERVICE', 'warn', "Fraud score triggered: High transaction speed deviation detected by risk engine.");
      setSimState('declined');
      addLog('API_GATEWAY', 'warn', `Transaction DECLINED: Fraud Block (Amount: ₹${txAmount})`);
      setSimMessage("Transaction Declined: Risk Management systems scored transaction above threshold (Suspected Fraud).");
      setIsPlayingAuto(false);
      return;
    }

    if (card.balance < txAmount) {
      addLog('AUTH_SERVICE', 'warn', `Insufficient funds: Required ₹${txAmount}, Balance ₹${card.balance}`);
      setSimState('declined');
      addLog('API_GATEWAY', 'warn', `Transaction DECLINED: Insufficient Balance (Amount: ₹${txAmount})`);
      setSimMessage("Transaction Declined: Insufficient funding balance on card.");
      setIsPlayingAuto(false);
      return;
    }

    await delay(1200);

    // Step 3: Deduct amount
    setSimState('debiting');
    const oldBalance = card.balance;
    const newBalance = oldBalance - txAmount;
    
    setCard(prev => {
      if (!prev) return null;
      return { ...prev, balance: newBalance };
    });

    addLog('DATABASE', 'success', `UPDATE cards SET balance = ${newBalance} WHERE id = '${card.id}' AND balance >= ${txAmount}`);
    addLog('DATABASE', 'success', `SQL Committed: Ledger deducted successfully. (${oldBalance} ➔ ${newBalance})`);
    await delay(1000);

    // Step 4: Approved
    setSimState('approved');
    addLog('API_GATEWAY', 'success', `Transaction APPROVED! Authorization Code: AUTH_0019`);
    
    const newTx: Transaction = {
      id: "tx_" + Math.random().toString(36).substr(2, 6),
      cardId: card.id,
      amount: txAmount,
      merchant: txMerchant,
      type: txType,
      timestamp: new Date().toLocaleTimeString(),
      status: 'APPROVED'
    };
    setTransactions(prev => [newTx, ...prev]);
    await delay(1000);

    // Step 5: Kafka Event Published
    setSimState('kafka_pub');
    handleStageSelect(5);
    const kafkaPayload = {
      eventId: "evt_" + Math.random().toString(36).substr(2, 9),
      transactionId: newTx.id,
      cardId: card.id,
      amount: txAmount,
      merchant: txMerchant,
      timestamp: new Date().toISOString()
    };
    
    addLog('KAFKA', 'success', `event-publisher: Published event to topic 'transaction-approved' (offset: ${Math.floor(Math.random() * 5000 + 40000)})`, kafkaPayload);
    setKafkaMessages(prev => [kafkaPayload, ...prev]);
    await delay(1200);

    // Step 6: Async Downstream Processing (SMS, Clearing, Reports)
    setSimState('async_processing');
    setSimMessage("Kafka brokers broadcasted offsets: Downstream consumers starting asynchronous workload processing.");
    
    // Simulate SMS notify
    setSmsNotificationMsg(`ALERT: Account debited ₹${txAmount} at ${txMerchant}. Card ending 9924. Balance remaining: ₹${newBalance}.`);
    setSmsActive(true);
    addLog('SMS_SERVICE', 'success', `SMS Consumer: Transmitted notification message regarding transaction: ${newTx.id}`);

    // Append clearing log entry
    setClearingRecords(prev => [...prev, {
      cycleDate: new Date().toISOString().split('T')[0],
      transactionId: newTx.id,
      amount: txAmount,
      merchant: txMerchant,
      status: 'CLEARED'
    }]);
    addLog('CLEARING_SERVICE', 'info', `Clearing Consumer: Saved clearing reconciliation register object for Tx: ${newTx.id}`);
    addLog('REPORTS_SERVICE', 'info', "Reports Consumer: Aggregate dashboard transaction counters incremented.");
    
    await delay(1500);

    setSimState('idle');
    setSimMessage(`Cycle fully completed. Ledger updated. Kafka event consumed. SMS alert notified.`);
    setIsPlayingAuto(false);
  };

  // Helper utility for artificial time latency
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // End of Day Settlement simulation
  const handleTriggerSettlement = async () => {
    if (clearingRecords.length === 0) {
      addLog('SETTLEMENT', 'warn', "No open clearing files logged for reconciliation today.");
      return;
    }
    handleStageSelect(6);
    addLog('SETTLEMENT', 'info', `Executing End Of Day [EOD] Scheme Cash Settlements (Visa/MC totals matching) for ${clearingRecords.length} records`);
    
    await delay(1200);
    
    setReconciledCount(prev => prev + clearingRecords.length);
    setClearingRecords([]);
    addLog('SETTLEMENT', 'success', "Visa/Mastercard reconciliation file matching: 100% SUCCESS. Outward cash flow batch settled to clearing accounts.");
    addLog('DATABASE', 'success', "SQL: Batch ledger table updated. status = RECONCILED");
    setSimMessage("End Of Day Settlement Complete. Cleared transactional registers processed. Payout funds cleared with Card Scheme networks.");
  };

  // Temporarily Block or Unblock Card
  const handleToggleBlock = () => {
    if (!card) return;
    
    const nextStatus = card.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    handleStageSelect(7);
    
    addLog('API_GATEWAY', 'info', `PUT /api/v1/cards/status/update - Set status to ${nextStatus}`);
    
    setTimeout(() => {
      setCard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: nextStatus
        };
      });
      addLog('DATABASE', 'success', `SQL UPDATE cards: status values mapped to ${nextStatus}.`);
      addLog('CMS', 'info', `Card memory cache invalidated for card: ${card.id}. POS transactions will fail instantly.`);
      setSimMessage(`Card status updated to ${nextStatus}. Sandbox will enforce these boundaries in subsequent auth steps.`);
    }, 500);
  };

  // Reset Simulator
  const handleResetSimulator = () => {
    setCard(null);
    setLogs([]);
    setTransactions([]);
    setKafkaMessages([]);
    setClearingRecords([]);
    setSmsNotificationMsg(null);
    setSmsActive(false);
    setSimState('idle');
    setSimMessage("Simulator reset. Request a Card to begin the interactive demonstration flow.");
    addLog('CLIENT', 'info', "Prepaid Card Sandbox fully re-initialized.");
  };


  return (
    <div className="bg-[#12141c] text-[#eaeaea] rounded-2xl border border-[#23273a] p-6 shadow-2xl relative mt-6" id="sandbox-simulator">
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
        <button
          onClick={handleResetSimulator}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sandbox</span>
        </button>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Banner header title */}
        <div>
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Prepaid Sandbox Terminal</span>
          </span>
          <h3 className="text-xl font-bold tracking-tight text-white mt-1">Live Transaction Sandbox & Flow Simulator</h3>
          <p className="text-xs text-[#a2a3b3]">
            Follow the real-world sequence. Execute customer balance modifications and see system logic transition in real-time.
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (5 cols): Interactive Credit Card Visualizer */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* VIRTUAL RECTANGLE CARD CONTAINER */}
            <div className="relative w-full aspect-[1.586/1] rounded-2xl p-5 overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between bg-gradient-to-br from-[#1d2243] via-[#0f1225] to-[#070810]">
              
              {/* Glassmorphic overlay sheen */}
              <div className="absolute -inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />

              {/* Physical Card Details Layout */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#a1a7cb]">Prepaid Ledger Gold</span>
                  <p className="text-[11px] font-mono text-indigo-400 mt-0.5">BIN 453271</p>
                </div>
                
                {/* Active card state indicator */}
                <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold font-mono border ${
                  !card ? 'bg-zinc-800 text-zinc-400 border-zinc-700' :
                  card.status === 'ACTIVE' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' :
                  card.status === 'BLOCKED' ? 'bg-rose-950/80 text-rose-400 border-rose-800' :
                  'bg-amber-950/80 text-amber-400 border-amber-800'
                }`}>
                  {!card ? 'NO CARD' : card.status}
                </div>
              </div>

              {/* EMV SIMULATION CHIP */}
              <div className="flex items-center space-x-3 z-10">
                <div className="w-9 h-7 rounded-md bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 border border-yellow-200/50 p-1 flex flex-col justify-between relative overflow-hidden">
                  <div className="h-full w-full opacity-35 bg-[linear-gradient(90deg,transparent_45%,#000_45%,#000_55%,transparent_55%)] absolute inset-0" />
                  <div className="h-0.5 w-full bg-zinc-800/20 absolute top-2 left-0" />
                  <div className="h-0.5 w-full bg-zinc-800/20 absolute top-4 left-0" />
                </div>
                <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wide">
                  Contactless Pay
                </div>
              </div>

              {/* Card Number string block */}
              <div className="z-10 mt-2">
                <span className="text-lg font-mono tracking-wider font-semibold text-white drop-shadow">
                  {card ? card.cardNumber : "•••• •••• •••• ••••"}
                </span>
                
                <div className="flex items-center space-x-6 mt-1 font-mono text-xs">
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase block">Exp Date</span>
                    <span className="text-zinc-300 font-medium">{card ? card.expiryDate : "MM/YY"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase block">CVV</span>
                    <span className="text-zinc-300 font-medium">{card ? card.cvv : "•••"}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-zinc-500 uppercase block">Secure PIN</span>
                    <span className="text-zinc-300 font-medium">{card ? `** (${card.pin})` : "••••"}</span>
                  </div>
                </div>
              </div>

              {/* Customer balance read bar */}
              <div className="flex justify-between items-end z-10 pt-3 border-t border-white/5">
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#727a9c] block">Jane Doe</span>
                  <span className="text-[9px] text-[#727fa1] font-mono leading-none">Customer ID: {card ? card.id.slice(0,8) : 'Pending'}</span>
                </div>
                
                <div className="text-right">
                  <span className="text-[8px] text-zinc-500 block font-mono">AVAILABLE CARD BALANCE</span>
                  <p className="text-lg font-mono font-bold text-white tracking-tight">
                    ₹{card ? card.balance.toLocaleString() : "5,000"}
                  </p>
                </div>
              </div>
            </div>

            {/* LIFECYCLE CONTROLLER WORKFLOW PANEL */}
            <div className="bg-[#191b2c] rounded-xl p-4 border border-[#272d47] space-y-3">
              <h4 className="text-xs font-bold font-mono tracking-wider text-[#a1a2b0] uppercase">
                ⚙️ Direct Lifecycle Operations
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={!!card}
                  onClick={handleRequestCard}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                    !card 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>1. Request Card</span>
                </button>

                <button
                  disabled={!card || card.status !== 'DRAFT'}
                  onClick={handleIssueCardDetails}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                    card && card.status === 'DRAFT'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>2. Issue Card</span>
                </button>

                <button
                  disabled={!card || card.status !== 'INACTIVE'}
                  onClick={handleActivateCard}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                    card && card.status === 'INACTIVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-[#eaeaea] shadow-md'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>3. Activate Card</span>
                </button>

                <button
                  disabled={!card || (card.status !== 'ACTIVE' && card.status !== 'BLOCKED')}
                  onClick={handleToggleBlock}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                    card && (card.status === 'ACTIVE' || card.status === 'BLOCKED')
                      ? card.status === 'ACTIVE'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  {card && card.status === 'BLOCKED' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{card && card.status === 'BLOCKED' ? 'Unblock Card' : 'Block Card'}</span>
                </button>
              </div>

              {card?.status === 'DRAFT' && (
                <p className="text-[10px] text-amber-300 font-mono italic">
                  💡 Card resides as customer database row, but missing PAN allocation. Click 'Issue Card' to generate.
                </p>
              )}
              {card?.status === 'INACTIVE' && (
                <p className="text-[10px] text-blue-300 font-mono italic">
                  💡 PAN and CVV populated. PIN PVV saved safely inside HSM. Click 'Activate Card' to flip status flag in DB.
                </p>
              )}
            </div>

            {/* LIVE SMS HANDSET NOTIFICATION SIMULATION */}
            {smsNotificationMsg && (
              <motion.div 
                initial={{ transform: 'scale(0.9)', opacity: 0 }}
                animate={{ transform: 'scale(1)', opacity: 1 }}
                className="bg-[#0b0c13] rounded-xl p-3 border border-[#3b53d0]/40 flex items-start space-x-3 shadow-lg shadow-[#3b53d0]/10"
              >
                <div className="p-2 rounded-full bg-emerald-950 text-emerald-400 mt-1">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold text-gray-500 font-mono">INCOMING SMS ALERT 💬</span>
                  <p className="text-xs text-[#b6eed0] font-mono leading-relaxed mt-0.5 italic">
                    &ldquo;{smsNotificationMsg}&rdquo;
                  </p>
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column (7 cols): Core Transaction simulator sandpit */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* TRANSACTION CONFIGURATION CONSOLE */}
            <div className="bg-[#141724] border border-[#272d47] rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold font-mono text-[#a1a5b8]">POS TRANSACTION DISPATCHER</span>
                <span className="text-[10px] font-mono text-zinc-500">Auto Sequence Playback Enabled</span>
              </div>

              {/* Simulator Options Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <div>
                  <label className="text-[10px] font-bold text-[#727a9c] uppercase font-mono block pl-1">Debit Amount (₹)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full bg-[#0b0c13] border border-[#2b314e] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#727a9c] uppercase font-mono block pl-1">Merchant Details</label>
                  <input
                    type="text"
                    value={txMerchant}
                    onChange={(e) => setTxMerchant(e.target.value)}
                    className="w-full bg-[#0b0c13] border border-[#2b314e] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white mt-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#727a9c] uppercase font-mono block pl-1">POS Channel Connection</label>
                  <select
                    value={txType}
                    onChange={(e: any) => setTxType(e.target.value)}
                    className="w-full bg-[#0b0c13] border border-[#2b314e] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white mt-1 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="POS">Retail POS Swipe</option>
                    <option value="E-COMMERCE">E-Commerce Web gateway</option>
                    <option value="ATM">ATM Teller Machine Cashout</option>
                  </select>
                </div>

              </div>

              {/* Edge Case Simulator Toggles */}
              <div className="flex flex-wrap gap-4 items-center bg-[#0d0e19] p-3 rounded-lg border border-[#1e223b]">
                <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Edge Scenarios:</span>
                
                <label className="flex items-center space-x-2 cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={wrongPinSelected}
                    onChange={(e) => {
                      setWrongPinSelected(e.target.checked);
                      if (e.target.checked) setPotentialFraudSelected(false);
                    }}
                    className="rounded border-[#292d3e] bg-zinc-950 text-indigo-600 focus:ring-0"
                  />
                  <span className={wrongPinSelected ? 'text-rose-400 font-bold' : 'text-gray-400'}>Incorrect PIN Block</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-xs font-mono">
                  <input
                    type="checkbox"
                    checked={potentialFraudSelected}
                    onChange={(e) => {
                      setPotentialFraudSelected(e.target.checked);
                      if (e.target.checked) setWrongPinSelected(false);
                    }}
                    className="rounded border-[#292d3e] bg-zinc-950 text-indigo-600 focus:ring-0"
                  />
                  <span className={potentialFraudSelected ? 'text-amber-400 font-bold' : 'text-gray-400'}>Score High Fraud Risk</span>
                </label>
              </div>

              {/* Dispatch Action Trigger */}
              <button
                disabled={isPlayingAuto || !card || card.status !== 'ACTIVE'}
                onClick={playStepByStepTransaction}
                className={`w-full py-3.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 ${
                  card && card.status === 'ACTIVE' && !isPlayingAuto
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-950/40 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 text-white" />
                <span>Authorize & Run Transaction Processing Flow</span>
              </button>

              {!card && (
                <p className="text-[10px] text-[#868ca2] text-center font-mono italic">
                  ⚠️ Request a Card from the 'Direct Lifecycle Operations' before starting payment validation simulations.
                </p>
              )}
              {card && card.status === 'INACTIVE' && (
                <p className="text-[10px] text-amber-300 text-center font-mono italic">
                  ⚠️ Your Card is issued but currently INACTIVE. You must trigger Card Activation (Step 3) to process merchant bills.
                </p>
              )}
              {card && card.status === 'BLOCKED' && (
                <p className="text-[10px] text-rose-300 text-center font-mono italic">
                  ⚠️ Your Card is currently BLOCKED. POS requests will be rejected immediately with a 91-system state code.
                </p>
              )}
            </div>

            {/* LIVE SYSTEM RECONCILIATION FLOW ANIMATION CARD */}
            <div className="bg-[#0b0c13] rounded-xl border border-[#212640] p-4 relative overflow-hidden">
              <h4 className="text-xs font-bold font-mono text-[#a1a5b8] mb-4">LIVE WORKFLOW ANIMATED GRAPH</h4>

              {/* Step Sequence Bar Nodes */}
              <div className="grid grid-cols-4 md:grid-cols-7 gap-1 mt-2 text-center text-[10px] font-mono select-none">
                
                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'pos_sent' ? 'bg-[#1d2243] border-indigo-500 text-white scale-105 shadow-md font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">POS</p>
                  <p>1. Transmit</p>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'check_balance' ? 'bg-[#111c38] border-blue-500 text-white scale-105 font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">AUTH</p>
                  <p>2. Audit PIN</p>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'debiting' ? 'bg-[#002f23] border-emerald-500 text-white scale-105 font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">DB LEDGER</p>
                  <p>3. Row Loc</p>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'approved' ? 'bg-[#1b2b1d] border-green-500 text-white scale-105 font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">CMS API</p>
                  <p>4. Approved</p>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'kafka_pub' ? 'bg-[#3d1225] border-pink-500 text-[#eaeaea] scale-105 font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">BROKER</p>
                  <p>5. Kafka Event</p>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'async_processing' ? 'bg-[#2a1738] border-violet-500 text-[#eaeaea] scale-105 font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">CONSUMER</p>
                  <p>6. Alert/Log</p>
                </div>

                <div className={`p-2 rounded-lg border transition-all ${
                  simState === 'idle' && reconciledCount > 0 ? 'bg-[#1a2d3c] border-sky-400 text-[#eaeaea] font-bold' : 'bg-transparent border-[#181a29] text-gray-500'
                }`}>
                  <p className="text-[8px] leading-tight mb-1">EOD CYCLE</p>
                  <p>7. Settle</p>
                </div>

              </div>

              {/* Status explanation label */}
              <div className="bg-[#11131f] mt-4 p-3 rounded-lg border border-[#1e2133] flex items-center space-x-3 text-xs">
                <div className="p-1 rounded bg-[#2a2d48] text-[#5e72e4]">
                  <Terminal className="w-4 h-4 animate-pulse text-[#00f2fe]" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold tracking-wide block">SIMULATOR OUTPUT MESSAGES</span>
                  <p className="font-mono text-[11px] text-[#eaeaea] font-semibold">
                    {simMessage}
                  </p>
                </div>
              </div>

              {/* Kafka broker simulation monitor queue */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#1e223b]">
                
                {/* Kafka Messages Topic */}
                <div className="bg-[#0b0c13] p-3 rounded-xl border border-[#191b2c] min-h-[140px] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase block tracking-wider">
                      📨 Kafka Topic: transaction-approved
                    </span>
                    <div className="mt-2 text-[10px] font-mono text-gray-400 max-h-[90px] overflow-y-auto space-y-1 pr-1">
                      {kafkaMessages.length === 0 ? (
                        <p className="text-zinc-600 italic">Topic is empty. No commits yet.</p>
                      ) : (
                        kafkaMessages.map((msg, idx) => (
                          <div key={idx} className="bg-[#131526] p-1.5 rounded border border-indigo-900/40 text-[9px]">
                            <span className="text-indigo-300">Offset Commit: {idx + 4192}</span> <br />
                            Tx: <span className="text-white">{msg.transactionId}</span> Amount: <span className="text-emerald-400">₹{msg.amount}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Clearing EOD register queue */}
                <div className="bg-[#0b0c13] p-3 rounded-xl border border-[#191b2c] min-h-[140px] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase block tracking-wider">
                      📁 Batch Clearing Records (Open) ({clearingRecords.length})
                    </span>
                    <div className="mt-2 text-[10px] font-mono text-gray-400 max-h-[80px] overflow-y-auto space-y-1">
                      {clearingRecords.length === 0 ? (
                        <p className="text-zinc-600 italic">All files reconciled or empty.</p>
                      ) : (
                        clearingRecords.map((rec, idx) => (
                          <div key={idx} className="bg-[#111] p-1.5 rounded border border-zinc-800 text-[9px] flex justify-between">
                            <span>Tx: {rec.transactionId}</span>
                            <span className="text-amber-400">₹{rec.amount} Clear Pending</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    disabled={clearingRecords.length === 0}
                    onClick={handleTriggerSettlement}
                    className={`w-full mt-2 py-1.5 rounded text-[10px] font-mono font-bold transition-all flex items-center justify-center space-x-1 ${
                      clearingRecords.length > 0 
                        ? 'bg-indigo-950 text-indigo-400 border border-indigo-700 hover:bg-indigo-900/60' 
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    }`}
                  >
                    <FileSpreadsheet className="w-3 h-3" />
                    <span>Run settlement (Visa/MC EOD matching)</span>
                  </button>
                </div>

              </div>
            </div>

            {/* LIVE CONSOLE DIAGNOSTIC FEED */}
            <div className="bg-[#0b0c12] rounded-xl border border-[#1d2134] overflow-hidden">
              <div className="bg-[#111422] px-4 py-2 border-b border-[#1c1f30] flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-[#b1b2cd] flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-time System Audit Console Logs</span>
                </span>
                <span className="text-[9px] bg-indigo-950 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-900">
                  PCI-DSS Log Scrubber Active
                </span>
              </div>

              <div id="sandbox-logs-frame" className="p-4 font-mono text-xs max-h-[180px] overflow-y-auto space-y-2 flex flex-col-reverse">
                {logs.length === 0 ? (
                  <p className="text-zinc-600 italic">Console is currently silent. Trigger actions above to view REST API payloads & relational commits.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-xs leading-relaxed border-b border-zinc-900 pb-1 mr-1">
                      <span className="text-[#64688a] mr-2">[{log.timestamp}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] mr-2 bg-[#121421] tracking-wider border font-bold ${
                        log.source === 'KAFKA' ? 'text-pink-400 border-pink-900' :
                        log.source === 'HSM' ? 'text-blue-300 border-blue-900' :
                        log.source === 'AUTH_SERVICE' ? 'text-indigo-400 border-indigo-900' :
                        log.source === 'DATABASE' ? 'text-amber-400 border-amber-900' :
                        log.source === 'CMS' ? 'text-violet-400 border-violet-900' :
                        'text-emerald-400 border-emerald-950'
                      }`}>
                        {log.source}
                      </span>
                      <span className={`${
                        log.type === 'error' ? 'text-red-400 font-bold' :
                        log.type === 'warn' ? 'text-amber-400 font-medium' :
                        log.type === 'success' ? 'text-emerald-400' : 'text-gray-300'
                      }`}>
                        {log.message}
                      </span>

                      {/* Display JSON objects payload cleanly in line if exists */}
                      {log.payload && (
                        <pre className="mt-1 bg-black/60 p-2 rounded text-[10px] text-gray-400 border border-zinc-900 max-h-[100px] overflow-y-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
