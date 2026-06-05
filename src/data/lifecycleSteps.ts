import { LifecyclePhase } from '../types';

export const LIFECYCLE_PHASES: LifecyclePhase[] = [
  {
    id: 1,
    title: "1. Card Request",
    techKeywords: ["REST APIs", "KYC Validation", "Customer Validation", "Spring Boot / Express"],
    description: "The prepaid card journey begins here. A customer requests a new physical or virtual prepaid card through the mobile app, web banking portal, or physically at a branch. The banking backend performs KYC (Know Your Customer) checks and risk rating calculations in real-time or asynchronously.",
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/customers/kyc-check",
        description: "Validates national identity data, address details, and financial risk profiles.",
        payload: `{ "nationalId": "ST-9021-X", "address": "123 Financial Blvd", "fullName": "Jane Doe" }`,
        response: `{ "kycStatus": "APPROVED", "riskScore": "LOW", "validationId": "val_92837482" }`
      },
      {
        method: "POST",
        path: "/api/v1/cards/request",
        description: "Submits a request for card issuance for approved customers.",
        payload: `{ "customerId": "cust_827364", "cardProductCode": "GOLD_PREPAID", "deliveryType": "DIGITAL_AND_PHYSICAL" }`,
        response: `{ "requestId": "req_112233", "status": "INACTIVE", "estimatedDeliveryDays": 5 }`
      }
    ],
    dbTables: [
      {
        tableName: "customers",
        columns: [
          { name: "id", type: "VARCHAR(50) PRIMARY KEY", desc: "Unique user identifier" },
          { name: "full_name", type: "VARCHAR(150)", desc: "Customer legal name" },
          { name: "kyc_status", type: "VARCHAR(20)", desc: "PENDING, APPROVED, FAILED" },
          { name: "created_at", type: "TIMESTAMP", desc: "Record registration date" }
        ]
      }
    ],
    interviewSnippet: "I developed secure, rate-limited REST APIs to handle customer card application submissions. I integrated external KYC third-party systems to calculate instant customer risk scoring, ensuring that card requests comply with AML (Anti-Money Laundering) requirements, before persisting details into our databases.",
    commonQuestions: [
      {
        q: "How do you handle KYC failures during application state?",
        a: "If the third-party credit check or identity verification fails, the customer record persists with status 'REJECTED' with an audit log. The Card request API immediately aborts and returns an appropriate regulatory error code, preventing any Card Creation workflow from launching."
      },
      {
        q: "Is KYC validation synchronous or asynchronous?",
        a: "We implemented a hybrid approach: fast database validation is synchronous, while deep background anti-money laundering database checks can execute asynchronously, updating the status via webhook callbacks."
      }
    ]
  },
  {
    id: 2,
    title: "2. CMS Card Issuance",
    techKeywords: ["CMS Integration", "PIN Generation / HSM", "Card Personalization", "MySQL Storage"],
    description: "The Card Management System (CMS) processes approved requests. The CMS securely assigns a 16-digit Primary Account Number (PAN), a CVV, and an expiry date. The PIN generation is delegated to a Hardware Security Module (HSM) using a PIN Block calculation algorithm to guarantee the secure generation and secure transfer.",
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/cms/cards/issue",
        description: "Internal command called by the orchestration gateway to initialize card records, allocate BIN pools, and generate PANs.",
        payload: `{ "customerId": "cust_827364", "binRange": "453271" }`,
        response: `{ "cardId": "card_098273", "panMasked": "4532 71XX XXXX 9924", "expiry": "06/31" }`
      },
      {
        method: "POST",
        path: "/api/v1/hsm/pin/generate",
        description: "Secure intranet call to the HSM to compute PIN Blocks. Outputs a mathematical secure hash (PIN Verification Value - PVV).",
        payload: `{ "pan": "4532718822939924" }`,
        response: `{ "pvv": "A9E24F", "pinBlock": "3B94E928374F2A" }`
      }
    ],
    dbTables: [
      {
        tableName: "cards",
        columns: [
          { name: "id", type: "VARCHAR(50) PRIMARY KEY", desc: "Internal card reference" },
          { name: "customer_id", type: "VARCHAR(50)", desc: "Foreign key referencing customer table" },
          { name: "pan_encrypted", type: "TEXT", desc: "PCI-DSS compliant encrypted 16-digit number" },
          { name: "pan_masked", type: "VARCHAR(19)", desc: "Visible PAN preview (e.g., 4000 12XX XXXX 3456)" },
          { name: "status", type: "VARCHAR(20)", desc: "INACTIVE (default until activated), ACTIVE, BLOCKED" },
          { name: "pvv", type: "VARCHAR(10)", desc: "PIN Verification Value for ATM/POS matching" },
          { name: "balance", type: "DECIMAL(15,2)", desc: "Default opening card ledger balance" }
        ]
      }
    ],
    interviewSnippet: "I worked on the core Card Management System integration, implementing PAN allocation logic from defined Bank Identification Number (BIN) pools. I engineered the secure internal integration with Hardware Security Modules (HSM) using ISO 9564 PIN block standards to format and generate the PIN Verification Values (PVV), safely encrypted and stored in our database.",
    commonQuestions: [
      {
        q: "How does the system ensure PCI-DSS security compliance?",
        a: "We never store raw PAN numbers or cleartext PINs in logs or standard databases. PANs are stored using AES-256 encryption with split-key management, HSM secures all crypto keys physically, and log scrubbers remove any sensitive data before they reach standard tracing lines."
      },
      {
        q: "What is an HSM and what is its role in PIN generation?",
        a: "An HSM (Hardware Security Module) is a physical, tamper-resistant cryptographic hardware appliance. It generates, stores, and manages secure crypto keys. When generating PINs, it outputs only the secure hash (PVV) or encrypted PIN offset, preventing any standard software process or database administrator from reading the plain-text PIN."
      }
    ]
  },
  {
    id: 3,
    title: "3. Card Activation",
    techKeywords: ["Activation API", "State Change (INACTIVE ➔ ACTIVE)", "Activation Events", "IVR Integrations"],
    description: "Once the card reaches the customer (digitally or physically), it can not be used until it is activated. The client triggers card activation via their mobile application, online portal, or via IVR (Interactive Voice Response) telephone banking. This transitions the card status from INACTIVE to ACTIVE.",
    apiEndpoints: [
      {
        method: "PUT",
        path: "/api/v1/cards/activate",
        description: "Activates the card after confirming security challenges (like entering the CVV and establishing or editing the PIN).",
        payload: `{ "cardId": "card_098273", "cvv": "382", "chosenPinHash": "9931..." }`,
        response: `{ "cardId": "card_098273", "status": "ACTIVE", "activationTimestamp": "2026-06-05T18:22:00Z" }`
      }
    ],
    dbTables: [
      {
        tableName: "card_lifecycle_events",
        columns: [
          { name: "id", type: "VARCHAR(50) PRIMARY KEY", desc: "Unique audit trace ID" },
          { name: "card_id", type: "VARCHAR(50)", desc: "ID of card being activated" },
          { name: "event_type", type: "VARCHAR(30)", desc: "ACTIVATED, BLOCK, UNBLOCK, EXPIRED" },
          { name: "triggered_by", type: "VARCHAR(50)", desc: "Channel identifier (e.g., MOBILE_APP, BACKOFFICE)" },
          { name: "created_at", type: "TIMESTAMP", desc: "Timestamp of event registration" }
        ]
      }
    ],
    interviewSnippet: "I developed the card activation endpoint, ensuring that status transitions from INACTIVE to ACTIVE are wrapped in secure atomic transactions. Upon matching card verification fields (CVV, expiry), the API initiates status updation and publishes an activation event, alerting fraud systems and letting downstream databases synchronize in real-time.",
    commonQuestions: [
      {
        q: "Why start cards as INACTIVE?",
        a: "This protects the banking institution and client from mail fraud or intercept theft. If physical card consignments are stolen from transit or delivery channels, the card remains completely useless up until the legitimate holder logs into the bank's secure interface to activate it."
      }
    ]
  },
  {
    id: 4,
    title: "4. Transaction Processing",
    techKeywords: ["Authorization Flow", "Balance Checking", "Fraud Validation", "ISO 8583 Messaging"],
    description: "When the cardholder uses the card at a POS terminal, ATM, or e-commerce gateway, the merchant sends a card authorization request. In standard banking architectures, this is formatted as a structured ISO 8583 message. The card processing platform checks the card status, verifies the security PIN block/CVV, runs fraud verification, and executes balance validation against the database ledger.",
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/transactions/authorize",
        description: "Process real-time authorization requests from card schemes (Visa/Mastercard) adapted into REST format or parsed from ISO 8583 standards.",
        payload: `{ "panMasked": "453271XXXXXX9924", "cvv": "382", "amount": 500.00, "merchantId": "MER_92837", "merchantName": "Supermarket Corp", "type": "POS" }`,
        response: `{ "authCode": "AUTH_9021", "transactionId": "tx_471829", "status": "APPROVED", "remainingBalance": 4500.00 }`
      }
    ],
    dbTables: [
      {
        tableName: "transactions",
        columns: [
          { name: "id", type: "VARCHAR(50) PRIMARY KEY", desc: "Unique transaction identifier" },
          { name: "card_id", type: "VARCHAR(50)", desc: "Reference to the operating card" },
          { name: "amount", type: "DECIMAL(15,2)", desc: "Value of transaction (debit amount)" },
          { name: "merchant_name", type: "VARCHAR(100)", desc: "The trading establishment" },
          { name: "transaction_type", type: "VARCHAR(20)", desc: "POS, ATM, ECOM" },
          { name: "status", type: "VARCHAR(20)", desc: "APPROVED, DECLINED, PARSED_FAILED" },
          { name: "auth_code", type: "VARCHAR(10)", desc: "Authorization code returned to scheme" },
          { name: "created_at", type: "TIMESTAMP", desc: "ISO execution timestamp" }
        ]
      }
    ],
    interviewSnippet: "I worked on the core transaction authorization engine, ensuring that dual-key read locks and transactional isolation levels check balances accurately under concurrent conditions. I structured calculations for remaining spending power, validated CVV checks with secure crypto sub-routines, and logged approvals under ISO 8583 constraints.",
    commonQuestions: [
      {
        q: "What is ISO 8583?",
        a: "It is an international standard for financial transaction card originated messages. It defines message formats for fields such as terminal IDs, transaction amounts, primary account numbers, and transaction codes, packaged in efficient bitmapped binary payloads suitable for fast network transmissions."
      },
      {
        q: "How do you handle double-spend race conditions?",
        a: "In the database schema, balance deductions must use atomic updates, like 'UPDATE cards SET balance = balance - :amount WHERE id = :id AND balance >= :amount'. Alternatively, table row-locking ('SELECT FOR UPDATE' in SQL) is utilized to lock card balance ledger rows during active verification stages, preventing concurrent transactions from leading to overdrafts."
      }
    ]
  },
  {
    id: 5,
    title: "5. Kafka Event Integration",
    techKeywords: ["Kafka Publisher/Consumer", "Message Streaming", "transaction-approved Topic", "Asynchronous Delivery"],
    description: "To avoid delaying merchant POS terminals, transaction authorization returns as fast as possible. Once approved, the authorization service publishes a 'transaction-approved' message to an Apache Kafka broker. Downstream consumer services ingest this event asynchronously without holding up the core payment transaction.",
    apiEndpoints: [
      {
        method: "POST",
        path: "Kafka Broker: Topic [transaction-approved]",
        description: "Event published by Auth Engine immediately following positive transaction ledger debit.",
        payload: `{ "eventId": "evt_99182", "transactionId": "tx_471829", "cardId": "card_098273", "customerId": "cust_827364", "amount": 500.00, "timestamp": "2026-06-05T18:22:10Z" }`,
        response: "[Kafka Partition Offset Committed: 92841]"
      }
    ],
    dbTables: [],
    interviewSnippet: "To reduce transaction response time, after approval we publish an event to Kafka. Downstream services like clearing, notifications (SMS/Push), and reporting consume the event asynchronously. This decouples our transaction validation engine from complex notification routing policies and high-latency message delivery partners, bringing authorization latency down.",
    commonQuestions: [
      {
        q: "What benefits does Kafka bring over standard synchronous REST calls?",
        a: "Decoupling and massive network resilience. If the SMS gateway company is having downtime, our core card payment authorized loop continues executing at full speed. Kafka retains events on disk persistently; when the customer notification service recovers, it simply catch-up reads missing indices without losing a single message."
      },
      {
        q: "How do you ensure message delivery guarantees (At-least-once / Exactly-once)?",
        a: "We configure Kafka producers with 'acks=all' and apply idempotent transaction properties on databases. Consumer operations are designed to be strictly idempotent, checking for duplicate event IDs in an event audit log before validating downstream credits or debits."
      }
    ]
  },
  {
    id: 6,
    title: "6. Settlement & Reconciliation",
    techKeywords: ["Visa / Mastercard Settlement", "EOD Reconciliation", "Clearing Records", "Settlement Files"],
    description: "Throughout the day, authorization transactions are accumulated in the card database ledger. At End of Day (EOD) or specific batch cycles, the clearing engine gathers all approved transactions. The files are formatted into card scheme standards (such as Visa Base II clearing files or Mastercard IPM files) and uploaded to secure networks for settlement of money accounts.",
    apiEndpoints: [
      {
        method: "POST",
        path: "/api/v1/settlement/trigger-reconciliation",
        description: "Triggers End-of-Day reconciliation batch files comparing bank records against card scheme clearing file totals.",
        payload: `{ "cycleDate": "2026-06-05", "scheme": "VISA" }`,
        response: `{ "status": "RECONCILED", "clearedCount": 12403, "totalClearedAmount": 620150.00, "discrepanciesCount": 0 }`
      }
    ],
    dbTables: [
      {
        tableName: "settlement_batches",
        columns: [
          { name: "id", type: "VARCHAR(50) PRIMARY KEY", desc: "Batch unique identifier" },
          { name: "cycle_date", type: "DATE", desc: "Current clearing cycle date" },
          { name: "total_amount_cleared", type: "DECIMAL(15,2)", desc: "Total aggregated processed amount value" },
          { name: "batch_status", type: "VARCHAR(20)", desc: "OPEN, CLOSED, SENT, RECONCILED" },
          { name: "discrepancies", type: "INT", desc: "Count of errors flag for immediate manual support audit" }
        ]
      }
    ],
    interviewSnippet: "I supported and maintained batch processes representing daily financial reconciliation. I developed automation jobs that process Visa and Mastercard end-of-day settlement files, matching incoming authorizations against actual clearing registers, flagging discrepancies, and committing total balance payouts.",
    commonQuestions: [
      {
        q: "What is reconciliation and what happens if a transaction is not found?",
        a: "Reconciliation is the process of comparing authorizations logged in our systems with actual clearing files reported by card networks. If a card scheme reports an authorization that isn't on our database, we log an immediate 'Unreconciled Exception' for physical back-office lookup to investigate for possible offline system transactions or integration failures."
      }
    ]
  },
  {
    id: 7,
    title: "7. Card Closure & Deactivation",
    techKeywords: ["Card Blocking APIs", "Expiry & Replacement", "Deactivation Workflows", "Lost / Stolen Scenarios"],
    description: "The card lifecycle concludes with deactivation or card closure. Card states can change temporarily (e.g., consumer temporarily 'FREEZING' the card in their app if misplaced), permanently as a result of manual blocks (from support staff reporting lost or stolen cards), or automatically upon passing the printed Expiry Date.",
    apiEndpoints: [
      {
        method: "PUT",
        path: "/api/v1/cards/status/update",
        description: "Updates card operational state triggered via customer preferences or corporate risk decisions.",
        payload: `{ "cardId": "card_098273", "status": "BLOCKED", "reason": "LOST_OR_STOLEN" }`,
        response: `{ "cardId": "card_098273", "status": "BLOCKED", "previousStatus": "ACTIVE", "updatedAt": "2026-06-05T18:22:20Z" }`
      }
    ],
    dbTables: [],
    interviewSnippet: "I designed the APIs for card block, freeze, and unfreeze. Transitioning cards to disabled states triggers a real-time command, forcing immediate expiration of any existing session tokens and updating our distributed card authorization cache (like Redis) within milliseconds so card transaction attempts at merchants are declined instantly.",
    commonQuestions: [
      {
        q: "How quickly does block take effect?",
        a: "Our card blocking mechanism writes instantly to the relational database and immediately updates the cached card profiles in Redis within milliseconds. This guarantees any authorization request arriving instantly afterward is rejected before it ever hits the main ledger balance checks."
      }
    ]
  }
];
