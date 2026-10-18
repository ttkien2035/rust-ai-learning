# Learning with AI: session-specific routes

Use these routes inside the existing session budget. Study the worked example, explain or repair it, implement a small core where specified, then use AI for integration and review. A core probe is a short diagnostic, not a requirement to rebuild the whole project unaided. Compiler, rust-analyzer, and API docs remain available throughout. AI assistance is allowed on applied challenges; keep a record of what you accepted, rejected, and verified.

## 01 — Types and telemetry

**Study and repair:** trace the lecture's latency classifier; change `>` to `>=` and predict the boundary change. Repair a mean that performs integer division or returns a fabricated zero for no observations.

**Core probe:** implement only `mean_latency(&[u64]) -> Option<f64>` yourself after the example. A provided signature and test harness are allowed; no blank Cargo project is required. Explain empty input and conversion before running it.

**AI collaboration:** ask AI to scaffold the summary struct and CLI. Inspect units and error paths before accepting the diff.

**Review artifact:** your repaired mean, boundary tests, and one generated suggestion you evaluated. Pass by explaining and changing the behavior, not by recalling Cargo boilerplate.

## 02 — Ownership and text

**Study and repair:** draw the owner and views in the lecture's `trim` example. Repair the conflicting `clear` fragment in two ways and compare their allocation/lifetime contracts.

**Core probe:** write only a borrowed first-word function with a supplied signature. API lookup is allowed. Test empty and multibyte text; explain why the source must remain alive.

**AI collaboration:** let AI propose the owned queued-record wrapper. Identify the intentional copy and demonstrate that queued data survives the source being dropped.

**Review artifact:** ownership trace, compiler diagnostic, tests, and a changed-lifetime variation. Memorizing a particular repair does not establish understanding.

## 03 — Domain types and errors

**Study and repair:** inspect the execution enum. Repair a budget validator that adds before checking overflow and a transition function that restarts a terminal execution.

**Core probe:** implement just the checked budget decision with a supplied signature and tests. Explain arithmetic overflow separately from an over-budget request.

**AI collaboration:** generate constructors, error formatting, and transition-test scaffolding. Review private fields and exhaustive handling; add one missing transition case yourself.

**Review artifact:** invariant list, checked arithmetic tests, and an adapted cancelled state. Acceptance depends on correct rules and evidence, regardless of who typed the constructor.

## 04 — Retrieval and lifetimes

**Study and repair:** trace a scalar similarity example. Repair an implementation whose `zip` hides a dimension mismatch and one that clones the winning document unnecessarily.

**Core probe:** implement the dimension check and borrowed-winner selection around a provided scorer. Explain ties and output lifetime. The scorer and data types may be supplied.

**AI collaboration:** use AI to propose iterator or trait alternatives; compare them with the simple reference. Keep only abstraction that solves a concrete variation.

**Review artifact:** shape/tie/zero-vector tests, a borrow explanation, and a top-two adaptation verified against the reference.

## 05 — Bounded ingestion

**Study and repair:** inspect the lab reader; locate where a full line can allocate before its size is checked. Reproduce with an oversized record delivered in small reads.

**Focused reasoning probe:** sketch the bounded-reading state machine and memory budget yourself. A diagram or pseudocode is enough at this stage; no unaided parser rewrite is required.

**AI collaboration:** implement the ingestion path with AI, auditing limit enforcement, EOF behavior, and buffer ownership. Use generated fixtures only after inspecting their expected outcomes.

**Review artifact:** failing-then-passing oversized-line test, byte-accounting policy, and a slow-consumer adaptation. Explain the fix rather than accepting an unexplained patch.

## 06 — Worker pool lifecycle

**Study and repair:** trace a two-worker schedule; identify a lock held through computation or an unobserved worker failure. Explain which operation owns shutdown.

**Focused reasoning probe:** write the accepted/completed/failed/abandoned accounting equation and a shutdown sequence. Trace one producer-closure case without AI supplying the explanation.

**AI collaboration:** scaffold the pool and channels with AI. Review lock scope, capacity, joins, and every exit path using a tiny deterministic workload.

**Review artifact:** controlled saturation test, join evidence, and an input-order output variation. Reuse your pool; rebuilding threading scaffolding is unnecessary.

## 07 — Futures and task ownership

**Study and repair:** compare sequential awaits with bounded concurrent mocks. Diagnose a missing await, an ignored JoinHandle, and CPU work that delays a heartbeat.

**Focused reasoning probe:** trace creation, first poll, suspension, and completion for two tasks. Predict which owner observes failure.

**AI collaboration:** use AI to assemble orchestration and a bounded CPU path. Challenge any proposal that creates an unlimited number of waiting tasks.

**Review artifact:** task trace, failure propagation tests, and heartbeat measurements. Adapt the design when the CPU and I/O limits differ; syntax memorization is not assessed.

## 08 — Deadline and cancellation decisions

**Study and repair:** inspect an executor that resets timeout on every retry. Trace a queued job whose remaining budget has already expired, then inspect cancellation-sensitive reads.

**Core probe:** implement only the remaining-budget/attempt-admission decision in a provided harness. API lookup is allowed; explain its inputs and edge cases before testing.

**AI collaboration:** integrate timers, cancellation, and retries with AI. Validate one controlled interleaving at a time and audit remote-side-effect assumptions separately.

**Review artifact:** queue-inclusive deadline trace, cancellation test, and an idempotency design variation. A passing timeout test alone is insufficient.

## 09 — HTTP contracts

**Study and repair:** read a generated Axum route and identify validation after backend invocation or an extractor rejection bypassing the error schema.

**Focused reasoning probe:** define the HTTP/domain boundary and expected outcome for malformed, invalid, overloaded, and successful requests yourself.

**AI collaboration:** generate routes, configuration, and router-test scaffolding. Review each rejection path and request-size limit with actual requests.

**Review artifact:** status/schema table, zero backend calls for rejected input, and an optional-field variation. You may retain the generated router if you can explain and verify it.

## 10 — Streaming and shutdown

**Study and repair:** inspect a decoder that assumes one chunk equals one event. Trace split UTF-8 bytes and a slow reader; identify buffers and tasks retained after disconnect.

**Focused reasoning probe:** describe the frame state machine and a disconnected stream's resource-release sequence without delegating that explanation.

**AI collaboration:** implement protocol and async wiring with AI. Review byte bounds, cancellation propagation, and the shutdown grace policy.

**Review artifact:** split-point regression test, disconnect trace, and an event-size variation. Assess resource behavior through evidence, not how many streaming lines you typed.

## 11 — Python extension workflow

**Study and repair:** read a small PyO3 example and trace input conversion, native computation, error mapping, and return ownership. Diagnose a benchmark that excludes conversion costs.

**Focused reasoning probe:** state the boundary contract and draw the cost model. Explain where Python object access must occur for your pinned library version.

**AI collaboration:** use AI for maturin scaffolding, bindings, and packaging. Inspect generated version-specific API calls and compare scalar/batch outputs with Python.

**Review artifact:** reproducible wheel/import steps, boundary tests, cost breakdown, and a changed-output-shape adaptation. No unaided package setup is required.

## 12 — AI-assisted gateway capstone

**Study and repair:** inspect your integrated request path. Choose a failed lifecycle invariant and reduce it to a small reproduction before asking for a patch.

**Focused reasoning probe:** independently explain one request from parse to resource release and predict overload behavior. Code and architecture diagrams may remain open.

**AI collaboration:** use AI throughout integration, tests, and refactoring. Own admission/deadline decisions, inspect diffs, and verify the deterministic mock's failure matrix.

**Review artifact:** working demonstration, evidence for every failure category, and one changed capacity/deadline requirement. This capstone assesses engineering control of an AI-assisted implementation.

## 13 — Performance investigation

**Study and repair:** audit a benchmark that changes work, mixes profiles, or reports only its best run. Separate a measured result from an explanation or hypothesis.

**Focused reasoning probe:** write the hypothesis, baseline, correctness guard, and abandonment criterion before asking AI for optimizations.

**AI collaboration:** generate benchmark harnesses and candidate changes with AI. Inspect the timing boundary and choose one change at a time.

**Review artifact:** raw measurements, equivalent-work checks, and an input-distribution variation. Correctly concluding that a proposed optimization is unhelpful is a valid pass.

## 14 — Allocation and retention

**Study and repair:** trace Cow's borrowed and owned paths. Diagnose a normalizer that changes Unicode semantics or retains an outlier buffer indefinitely.

**Focused reasoning probe:** draw output ownership and distinguish allocation traffic from retained capacity. Predict the huge-then-small case before running.

**AI collaboration:** generate alternative buffer policies and instrumentation. Verify semantic parity and inspect where each implementation allocates or keeps storage alive.

**Review artifact:** outlier test, ownership explanation, measured tradeoff, and changed modification-rate experiment. A copy is allowed when it serves the documented contract.

## 15 — Layout and useful traffic

**Study and repair:** map a tiny matrix's indices in both representations. Fix a flat index calculation and a benchmark that excludes packing.

**Focused reasoning probe:** derive the indexing and useful-byte traffic estimate yourself. State the assumptions instead of treating estimates as observations.

**AI collaboration:** build layout variants and benchmark infrastructure with AI. Validate shape checks and include conversion plus metadata access.

**Review artifact:** mapping diagram, differential tests, complete-cost results, and a metadata-heavy workload adaptation. Keep the reference implementation supplied or generated if independently checked.

## 16 — Parallel work and reductions

**Study and repair:** inspect a Rayon change with shared locking or unspecified floating-point tolerance. Trace which state is local and which results need merging.

**Focused reasoning probe:** explain why a reduction can differ without a data race and predict when extra threads may hurt.

**AI collaboration:** generate parallel variants and worker-count sweeps. Control all relevant thread pools and compare with a trusted sequential oracle.

**Review artifact:** scaling data, numerical contract, and competing-workload adaptation. Do not rebuild Rayon or require bitwise equivalence unless the contract calls for it.

## 17 — Vectorization and portability

**Study and repair:** inspect a kernel with an omitted tail or unsupported CPU assumption. Trace lengths below and above a candidate vector width.

**Focused reasoning probe:** account for every index and state dispatch/safety preconditions. Explain what assembly inspection can and cannot establish.

**AI collaboration:** let AI propose loop restructuring and optional intrinsics. Treat unsafe code as a proposal requiring an argument, tests, and a supported-target policy.

**Review artifact:** tail tests, numerical comparison, assembly evidence, and changed-target adaptation. A correct measured safe implementation can pass without explicit SIMD.

## 18 — Exact selection semantics

**Study and repair:** trace a heap with an inverted comparator or a partition with an invalid `k=0` pivot. Compare both against a full-sort oracle.

**Core probe:** implement only the score/ID comparator and edge-case dispatch in a provided harness. Explain finite-value policy and tie order before testing.

**AI collaboration:** generate heap or partition variants, then verify ordered IDs over generated and adversarial cases.

**Review artifact:** comparator tests, differential evidence, complete-result timing, and a new tie-rule adaptation. Algorithm understanding matters more than recreating container boilerplate.

## 19 — Load testing and latency

**Study and repair:** audit a response-paced load test and a report that drops timed-out requests. Reconstruct the missing denominator and timing boundary.

**Focused reasoning probe:** define offered/submitted/admitted/outcome counts and predict behavior during a server stall.

**AI collaboration:** generate instrumentation, schedules, and plots. Inspect generator lag and verify count reconciliation before trusting latency summaries.

**Review artifact:** outcome counts, queue-inclusive latency, and a tighter-deadline batching experiment. Evaluate your measurement decisions and conclusions, not unaided load-tool implementation.

## 20 — Numerical arrays across Python and Rust

**Study and repair:** trace a transposed or strided array. Diagnose a binding that assumes contiguous storage from shape alone or silently excludes copying from its benchmark.

**Focused reasoning probe:** specify dtype, shape, strides, aliases, and ownership; choose reject/copy/stride-aware access explicitly.

**AI collaboration:** generate binding and batch paths using pinned rust-numpy/PyO3 APIs. Inspect safe access and detached-compute assumptions.

**Review artifact:** array-layout test matrix, NumPy parity, full boundary costs, and a no-input-copy constraint adaptation. Generated bindings are acceptable when you can validate and maintain them.

## 21 — Compiler and unsafe change review

**Study and repair:** inspect a tuning proposal evaluated only on PGO training data or a local CPU. Identify unstated unsafe preconditions and unsupported tooling claims.

**Focused reasoning probe:** separate performance, safety, portability, and reproducibility evidence. Form a decision before asking AI for supporting implementation.

**AI collaboration:** generate profile configurations and optional PGO scripts. Review flags and toolchain matching; reject changes unsupported by evidence.

**Review artifact:** held-out comparison, safety/target argument, and a changed-deployment adaptation. Keeping safe code and default profiles can be the correct outcome.

## 22 — Optimizer engineering with AI

**Study and repair:** inspect objective and gradient implementations with mismatched mean/sum regularization scaling. Calculate the one-dimensional fixtures by hand and identify the discrepancy.

**Core probe:** derive and implement only the tiny objective/gradient pair in a supplied test harness. Docs and compiler are allowed; validate the derivation before requesting generated solver code.

**AI collaboration:** generate solver scaffolding, buffer reuse, parallel population evaluation, and plotting. You own stopping rules, reference parity, seed policy, and time-to-quality comparisons.

**Review artifact:** gradient checks, convergence/failure evidence, complete-cost results, and an intercept-regularization variation. A faster loop with a changed objective fails even if AI produced convincing explanations.
