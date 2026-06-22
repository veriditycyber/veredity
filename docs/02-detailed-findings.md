# Detailed Findings — Claim-by-Claim Evidence

> Companion to `01-factcheck-report.md`. Full evidence and vote records for each verified claim.

---

### Finding 1 — Deloitte GenAI Fraud Projection
- **Confidence:** High | **Vote:** 3-0 (merged from two claims)
- **Claim:** GenAI could enable US fraud losses to reach $40B by 2027 (up from $12.3B in 2023) at a 32% CAGR, with a ~$22B conservative-case estimate.
- **Evidence:** Verbatim match to Deloitte Center for Financial Services primary report; corroborated by Biometric Update, Quartz, ID Tech Wire. Math checks out (12.3 × 1.32^4 ≈ 37-40B). Thesis preserves Deloitte's hedged "could enable" and the base ($40B) vs conservative ($22B) distinction. Caveat: forward-looking single-firm projection, published May 2024 (~2 years old), not measured data.
- **Sources:**
  - https://www.deloitte.com/us/en/insights/industry/financial-services/deepfake-banking-fraud-risk-on-the-rise.html
  - https://www.biometricupdate.com/202406/deloitte-predicts-losses-of-up-to-40b-from-generative-ai-powered-fraud

### Finding 2 — Federal Reserve Mule-Account Survey
- **Confidence:** High | **Vote:** 3-0 (merged from four claims)
- **Claim:** The Fed Financial Services Risk Officer Survey (400+ institutions, fielded Q4 2025, released April 2026) confirms rising fraud across debit/check/ACH/wire channels, with mule-account activity a key driver of wire fraud tied to social engineering; mule fraud is hard to detect because funds are depleted before intervention (51% detect only after losses).
- **Evidence:** Verbatim support from primary frbservices.org report; corroborated by PYMNTS. Specific data: ~half report mule activity increasing (18%) or persistent (29%), up 12% over 2023; 51% identify mule activity only after losses. The thesis labels it a "2025 survey" — fielded Q4 2025 but published in the 2026 Risk Officer Report. Immaterial to the substance.
- **Sources:**
  - https://www.frbservices.org/news/fed360/issues/051426/risk-management-2026-risk-officer-report
  - https://www.pymnts.com/cybersecurity/fraud-prevention/2026/fed-report-puts-banks-on-alert-over-rising-fraud-threats

### Finding 3 — UK 500K-to-8M Deepfake Growth
- **Confidence:** Medium | **Vote:** 2-1
- **Claim:** The figure is officially endorsed by the UK government, but originates from a self-interested AI-detection vendor (DeepMedia), and the 8M is a projection, not a counted statistic.
- **Evidence:** GOV.UK case study ("Innovating to detect deepfakes," Feb 2026) states "8 million will be shared in 2025, up from 500,000 in 2023"; widely cited (Europol IOCTA 2025, European Parliament). However, GOV.UK attributes them to Reuters/DeepMedia and OpenFox, both tracing to vendor DeepMedia — not original government measurement, not peer-reviewed. "UK government figures estimate" overstates independence and rigor.
- **Sources:**
  - https://www.globalgovernmentforum.com/uk-government-launches-deepfake-detection-initiative-as-urgent-national-priority/

### Finding 4 — FATF October 2025 Horizon Scan
- **Confidence:** High | **Vote:** 3-0 (merged from two claims)
- **Claim:** FATF's Oct 2025 Plenary (Paris, 22-24 Oct) approved a "Horizon Scan" explicitly warning that criminals can exploit generative AI, AI agents, and deepfakes for illicit finance.
- **Evidence:** Primary FATF outcomes page + FATF's published "Horizon Scan: AI and Deepfakes" PDF; corroborated by ComplyAdvantage, ShuftiPro, TLT LLP, ICA, and others. FATF cites criminals using "a suite of generative and agentic AI systems" and "autonomous AI agents." Caveat: a Horizon Scan is informational risk-awareness guidance, not binding regulation — a "soft" catalyst. FATF's framing is criminals weaponizing AI (AML/CFT), narrower than the thesis's "agentic security" (defending deployed agents). FATF URL returned HTTP 403 to bots; verified via verbatim quotes in 6+ independent sources.
- **Sources:**
  - https://www.fatf-gafi.org/en/publications/Fatfgeneral/outcomes-FATF-plenary-october-2025.html

### Finding 5 — HKMA "D for Deepfake"
- **Confidence:** Low | **Vote:** Not verified
- **Claim:** HKMA adding "D for deepfake" to its e-banking security framework — UNVERIFIED.
- **Evidence:** No verified claim addresses this. A source exists (RegulationAsia) but no claim survived verification. Neither confirmed nor refuted; requires independent confirmation from HKMA primary sources.
- **Sources:** (candidate, unverified) https://www.regulationasia.com/articles/hkma-adds-deepfake-guidance-to-e-banking-rules

### Finding 6 — Technical "Arms Race"
- **Confidence:** High | **Vote:** 3-0 (merged from two claims)
- **Claim:** All evaluated detectors (XCeption, ResNet-50, VGG16) lose accuracy under adversarial FGSM perturbations; robust detection requires combining advanced generative modeling, adversarial defenses, and cross-dataset adaptation.
- **Evidence:** Peer-reviewed MDPI Applied Sciences 2025 (15(3):1225) reports all three CNNs degrade under FGSM (XCeption 79.1%, VGG16 74.3%, ResNet-50 64.2%). Corroborated by arXiv 2003.10596, 2312.08675, 2407.02670, and 2025 generalization literature. Caveat: underlying study tests only 3 CNNs with FGSM, but the multi-pronged-robustness conclusion is field consensus. A related claim that detectors fail zero-shot across unseen generators was REFUTED (1-2).
- **Sources:**
  - https://www.mdpi.com/2076-3417/15/3/1225

### Finding 7 — ID.me Funding
- **Confidence:** High | **Vote:** 3-0 (merged from two claims)
- **Claim:** ID.me raised $340M in Sept 2025 (Series E led by Ribbit Capital + credit facility) at >$2B valuation, framed around AI-driven/deepfake fraud per CEO Blake Hall.
- **Evidence:** Primary ID.me press release + Finovate, Axios Pro, PYMNTS, Biometric Update. Structure: ~$65M Series E equity + ~$275M credit facility = $340M; valuation >$2B. **IMPORTANT:** the related claim that ID.me "prevented $270 billion in pandemic fraud" was REFUTED (0-3) — do not include that figure.
- **Sources:**
  - https://network.id.me/press-releases/id-me-raises-340-million-to-combat-ai-driven-fraud-and-expand-secure-digital-identity/

### Finding 8 — Persona Deepfake Blocking
- **Confidence:** High | **Vote:** 3-0
- **Claim:** Persona blocked 75M+ AI face-spoofing/deepfake attempts — but this is a FULL-YEAR 2024 figure (~50x increase), NOT June 2025 as the thesis implies.
- **Evidence:** Persona's PR Newswire release (Jan 22, 2025): "In 2024 alone... over 75 million fraud attempts leveraging AI-based face spoofs" and "50x increase in deepfakes." Corroborated by VentureBeat and 5+ outlets. The 75M and 50x are self-reported, unaudited vendor metrics. The thesis's "$200M Series D" and "June 2025" framing is partly inaccurate on timing.
- **Sources:**
  - https://venturebeat.com/ai/75-million-deepfakes-blocked-persona-leads-the-corporate-fight-against-hiring-fraud

### Finding 9 — NeuralTrust / Agentic Security
- **Confidence:** High | **Vote:** 3-0 / 2-1 (merged from two claims)
- **Claim:** NeuralTrust raised a $20M seed (led by Alstin Capital, claimed largest EU cybersecurity seed) with a three-product agentic-AI suite — TrustGate (agent gateway brokering every LLM/MCP/tool call), TrustGuard (runtime threat detection), TrustLens (posture management).
- **Evidence:** PR Newswire (June 17, 2026) + Tech.eu, TechFundingNews, EU-Startups, citybiz. $20M and Alstin Capital lead independently confirmed; product descriptions near-verbatim. Caveats: "largest EU cybersecurity seed" superlative is company marketing, not independently verified (neutral Tech.eu omits it); product capabilities are vendor descriptions, not audited efficacy. The thesis's "doubled ARR Q1 2026" detail was not separately verified.
- **Sources:**
  - https://www.prnewswire.com/news-releases/neuraltrust-raises-20m-to-secure-the-growing-swarm-of-ai-agents-in-the-enterprise-302802926.html

### Finding 10 — Fake Image Detection Market Sizing (WEAKEST)
- **Confidence:** High | **Vote:** 3-0 (merged from four claims)
- **Claim:** The thesis's fake-image-detection numbers ($1.5B 2025 → $28.01B 2034 at 38.45% CAGR) match NO identifiable research firm; competing estimates diverge enormously.
- **Evidence:** Only the ~$1.5B 2025 base is broadly plausible.
  - SNS Insider: $1.48B (2025) → $4.84B (2033), 15.99% CAGR
  - Astute Analytica: $928M (2024) → $12.9B (2033), 38.95% CAGR (CAGR near thesis, but absolute sizes ~half)
  - Market Research Future: $1.436B (2025) → $48.63B (2035), 42.22% CAGR
  - The exact $28.01B/38.45% combo returned no matching source. Marketing-driven estimates with false precision and no consensus; treat as soft/partly unverifiable.
- **Sources:**
  - https://www.snsinsider.com/reports/fake-image-detection-market-8488
  - https://www.astuteanalytica.com/industry-report/fake-image-detection-market
  - https://www.marketresearchfuture.com/reports/fake-image-detection-market-22192

### Finding 11 — Identity Verification Market Sizing
- **Confidence:** High | **Vote:** 3-0 / 2-1 (merged from three claims)
- **Claim:** The thesis's IDV sizing ($14.86B 2025 → $43.38B 2034) is vendor-divergent: IMARC gives $15.8B → $50.2B at 13.28% CAGR.
- **Evidence:** IMARC primary page confirms $15.8B/$50.2B/13.28% (2026-2034). Thesis figures (~$14.86B/$43.38B) likely derive from a different firm (~Precedence Research, ~12.6% CAGR — slightly below IMARC). IMARC itself publishes internally inconsistent numbers across pages. Inter-firm variance is routine; IDV grows more conservatively (~12-14% CAGR) than the explosive fake-image-detection CAGRs.
- **Sources:**
  - https://www.imarcgroup.com/identity-verification-market

### Finding 12 — Reality Defender / Sensity AI / Pindrop
- **Confidence:** Low | **Vote:** Not verified
- **Claim:** Their specific competitive-landscape milestones were not addressed by any surviving claim.
- **Evidence:** Verification produced confirmed claims for ID.me, Persona, NeuralTrust, but none for Reality Defender, Sensity AI, or Pindrop. Their inclusion is plausible (well-known players in voice/visual deepfake detection) but their specific milestones are unverified here.
- **Sources:** (none verified)

---

## Refuted Claims (Do Not Use)

| Claim | Vote | Source |
|---|---|---|
| Seven states credited ID.me with preventing >$270 billion in pandemic unemployment fraud | 0-3 | id.me press release |
| No fine-tuning method achieved zero-shot generalization across unseen generative models (in-domain strong) | 1-2 | berkeley ischool |
