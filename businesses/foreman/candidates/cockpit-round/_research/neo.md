# NEO research notebook

*Agent: NEO (Learning Agent). Cluster: intelligence. Researched by Hank on 2026-04-18. Raw findings, not a pitch.*

## Mission restated

Analyze reply patterns from ECHO's outbound campaigns. Embed and cluster replies. Train a lightweight scorer that labels each reply as hot / warm / cold / decline. Track which outreach angles convert per trade (HVAC vs plumbing vs electrical). Feed insights back to ECHO as a "use angle X on HVAC, angle Y on plumbing" loop.

Revenue mechanism for NEO: conversion multiplier. Every percentage point of reply-rate lift on ECHO's outbound maps directly to more Starter ($297/mo) and Growth ($497/mo) sales. Secondary monetization: sell the trained model or the "reply playbook" as a Gumroad product to other local-service agencies.

## Capability shortlist (6-platform sweep)

### 1. @huggingface/transformers (Transformers.js) + Xenova/all-MiniLM-L6-v2
- URL: https://github.com/huggingface/transformers.js
- License: Apache 2.0, commercial use allowed
- Stars: 15.9k+, actively maintained by HuggingFace
- NPM: `@huggingface/transformers`
- Model: Xenova/all-MiniLM-L6-v2 (ONNX-quantized, 384-dim, 22M params, ~22MB download)
- Fit: runs 100% locally inside the existing Node yard, zero API key, zero per-call cost, works offline. Same pattern the yard already uses elsewhere
- Cost: $0 after first-time model download. Runs in ~50ms per reply on a typical node server
- Gap: not the smartest model. For pure embedding + cosine similarity + simple classifier it is perfect. For generative reasoning, Claude Sonnet is called separately

### 2. scikit-learn LogisticRegression / SGDClassifier
- URL: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- License: BSD-3, commercial allowed
- Fit: the scorer on top of the embeddings. 100 labeled replies is enough to train a v1 classifier. Scales via `partial_fit` as ECHO generates more data
- Cost: $0. Runs in Python subprocess or via a pure-JS alternative (ml-logistic-regression on npm, smaller but fine for this)
- Alternative considered: logistic regression in pure JS via `ml-logistic-regression` (no Python dependency)

### 3. HuggingFace hosted inference API
- URL: https://huggingface.co/docs/api-inference
- Pricing: free tier generous for embeddings, $9/mo Pro tier for higher throughput
- Fit: fallback if local inference is too slow at volume
- Gap: network dependency, rate limits, requires key. Reject as primary because local is free and fast enough

### 4. OpenAI text-embedding-3-small
- Pricing: $0.02 per 1M tokens, cheap but not free
- Fit: higher embedding quality than MiniLM, but for reply-intent classification on short cold-email replies, MiniLM is proven sufficient
- Gap: paid, API key required, network dependency
- Reject as primary for cost/autonomy reasons

### 5. Vercel AI SDK / LangChain output parsers
- Fit: useful orchestration wrappers, not primary classifiers
- Gap: adds dependency weight for a job two open libs already do

### 6. Sentence-transformers via Python
- URL: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- License: Apache 2.0
- Fit: reference implementation. Same model weights as Transformers.js version
- Gap: Python dependency. Yard is Node-native. Transformers.js gives us the same model in Node

## Revenue evidence and monetization angle

- Sales-reply classifiers and "cold email intent scorers" are a quiet but real Gumroad category. Similar products (LinkedIn scrapers, cold email templates, "AI reply detection kits") sell for $49-$297 and indie builders report $1k-$10k/month revenue on Gumroad
- The MachineLearningMastery writeup (https://machinelearningmastery.com/feature-engineering-with-llm-embeddings-enhancing-scikit-learn-models/) documents exactly this pattern: embeddings + scikit-learn classifier for email-type tasks. Proven recipe
- Real direct ROI: the industry consensus on cold outbound is that a 1 percentage-point improvement in reply-to-meeting conversion moves an agency's revenue materially. If ECHO sends 500 emails/week and NEO's scoring raises the meeting-rate from 2% to 3%, that is ~5 extra calls/week. Even at Brewington's 30% close rate, that is 1.5 additional Starter clients/week = $446/week = ~$1,900/month in MRR added per month of continuous operation

## Decision

Primary skill: **Transformers.js (@huggingface/transformers) + Xenova/all-MiniLM-L6-v2 + pure-JS logistic regression (ml-logistic-regression on npm)**.

Why: 100% local, zero API cost, Apache-2.0 licensing, Node-native so it drops into the existing yard, the model is tiny enough to run on the same box the scheduler runs on, the stack is the proven canonical recipe (MiniLM embeddings → cosine similarity → logistic regression head), and there are no blockers to installation today.

Runner-up A: OpenAI text-embedding-3-small if MiniLM proves too weak after 500 labeled replies (unlikely).
Runner-up B: HuggingFace hosted inference API as a network fallback.

Rejected: Yelp-style paid APIs, Clearbit, anything requiring credentials beyond the yard's existing env.

## Autonomy check

Score 4. NEO runs a weekly tick that:
1. Reads ECHO's reply log from the previous 7 days
2. Embeds each reply via MiniLM
3. Auto-labels obvious replies using regex and keyword heuristics (unsubscribes, out-of-office, positive interest)
4. For ambiguous replies, uses Claude Sonnet to assign the label (small cost, hundreds of tokens per reply)
5. Retrains the logistic regression classifier on the accumulated labeled corpus
6. Writes `neo/reply-classifier.json` (vocab + weights) and `neo/angle-performance.md` (which subject lines and opening lines convert best per trade)
7. Pushes a ranked angle list into ECHO's next-campaign config

Lando's touchpoint: weekly review of the angle performance report. Not required for the tick to run.

## Monetization check

YES as product: once NEO has 500+ labeled replies and a trained classifier with usable precision, the playbook can be packaged as "Local Service Cold Email Angle Kit" on Gumroad at $49-$99. Not primary revenue, but a cheap secondary channel that runs from NEO's own exports.

Primary revenue: multiplier on ECHO's conversions. Attribution flows through ECHO's MRR line.
