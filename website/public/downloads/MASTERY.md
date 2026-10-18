# Mastery: understand, verify, debug, adapt

## The session learning loop

1. **Study a small example.** Trace its mechanism and predict a meaningful boundary case. Use the worked reasoning when needed; do not turn every line into a compulsory quiz.
2. **Repair or complete code.** Start with the session-specific repair task. Use a supplied or AI-generated attempt and explain why the change is correct.
3. **Probe the core selectively.** Where a Core probe is specified, implement only that small function or decision with a provided signature/harness. Compiler, rust-analyzer, and API documentation are allowed. First try the key reasoning yourself; if AI supplies the answer, use a fresh variation to diagnose what you understand. Other sessions use a reasoning probe rather than an unaided code exercise.
4. **Build with AI.** Use AI for scaffolding, integration, tests, refactoring, and implementation proposals. Define the contract, inspect consequential changes, run meaningful checks, and explain the result. There is no requirement to rebuild the project from a blank file.
5. **Defend, debug, and adapt.** Explain ownership, failure behavior, evidence, and a tradeoff; investigate a defect and handle one changed constraint. Code and docs may remain open. For a short diagnostic, your reviewer may ask you to predict or explain before consulting AI.
6. **Check retention later.** Revisit one conceptual decision, bug, or small variation in the next study block and about a week later. Adjust timing to your needs. Rebuilding an entire project from memory is unnecessary.

Use these activities within the existing hours. Skip familiar boilerplate and shorten optional reading when needed. The session route in LEARNING_PATHS.md identifies the actual probe and collaboration work.

## Review standard

Independent means you control the engineering decisions and can verify, debug, and adapt the implementation, including AI-assisted code. It does not mean every line was typed unaided. Keep the existing lab rubric and require evidence in all four dimensions:

| Evidence | Ready | Needs revision |
| --- | --- | --- |
| Explain | Traces mechanism, assumptions, and a counterexample in unfamiliar code | Repeats an explanation without checking behavior |
| Build and decide | Owns the contract, evaluates generated proposals, and implements the session's focused probe where specified | Accepts changes without understanding or cannot apply the core concept |
| Verify and debug | Uses boundary/failure tests and independently checks a proposed repair against evidence | Accepts green tests or an AI explanation as sufficient proof |
| Transfer | Adapts to a changed constraint and defends the resulting cost | Cannot maintain the implementation when assumptions change |

Record evidence levels in notes: **Practicing**, **Verified**, **Independent**, or **Retained**. Verified means the declared checks pass; Independent additionally means you can explain, diagnose, and adapt with normal tools; Retained adds a later fresh variation. Record AI assistance separately (what was generated, reviewed, changed, and tested). AI use does not automatically lower the level. These labels are self-recorded, not automatic scores; the completion button is self-assessed progress.

## Submission and tutor agreement

Submit the contract, code/diff, test commands and outputs, decisions, and assistance used. For performance work include environment and raw measurements. State uncertainties and failed attempts.

Teacher: use a worked example and a targeted question for the current misconception; offer a skeleton or explanation when useful. Avoid repetitive questions on familiar syntax. Teammate: help implement the project with AI while keeping decisions and verification explicit; reserve unaided work for the stated short Core probe. Reviewer: assess all four dimensions, inspect a meaningful defect or test gap, and ask one changed-constraint question. Give full examples when requested, then use a fresh focused diagnostic when necessary. Do not equate generated code with lack of mastery, or fluent explanation with proof of mastery.

Applied challenges below allow AI collaboration. Their acceptance cases remain contracts, not exhaustive tests or promises of measured performance. The per-session learning route specifies how to approach them.

## 01 — Telemetry contracts in practice

**Applied challenge:** write `summarize(&[u64], threshold: u64)` returning count, optional approximate mean, optional maximum, and count strictly above the threshold. Choose a result struct. The caller retains the input. State units and numerical limits.

**Acceptance cases:** empty input has count 0, no mean/maximum, and slow count 0; `[0,100,100,300]` at threshold 100 has count 4, mean 125, maximum 300, and slow count 1. A singleton at the threshold is not slow. Test large values without overflowing an integer accumulator.

**Defend:** explain why a slice accepts multiple owning containers and why `Some(0.0)` differs from `None`.

**Transfer at review:** replace “strictly above” with an inclusive interval counter; specify reversed bounds. **If stuck:** return to expressions, slices, and Option; retry with different fixtures.

## 02 — Borrow now, own when queued

**Applied challenge:** implement `trimmed(&str) -> &str` and a queued-record constructor that owns the trimmed text after the original String is dropped. Avoid an allocation in the first function; justify the ownership cost in the second.

**Acceptance cases:** empty, whitespace-only, Vietnamese text, and emoji. Demonstrate the returned view while the source lives. In a separate intentionally failing example, retain a view across conflicting source mutation; predict and explain the diagnostic before repairing it.

**Defend:** trace the storage owner and final borrow use. Explain why a lifetime annotation cannot retain dropped storage.

**Transfer at review:** replace trimming with a borrowed first-word view that respects UTF-8 boundaries. **If stuck:** draw the allocation and borrows, then retry a new text-processing function without cloning away the issue.

## 03 — Valid requests and legal transitions

**Applied challenge:** create a private-field validated request with context limit, prompt tokens, and reserved output tokens. Add `Pending → Running → Finished` execution transitions with explicit domain errors for forbidden transitions. You choose whether terminal failure is a separate variant or a finished outcome.

**Acceptance cases:** limit 10 with prompt 7/reserve 3 succeeds; reserve 4 fails; overflowing addition returns an error. Running twice or restarting a finished attempt fails. Document your zero-value policy.

**Defend:** distinguish representable arithmetic, domain validity, and legal state transitions. Explain what private fields enforce.

**Transfer at review:** add a new cancelled terminal state and update exhaustive handling. **If stuck:** separate arithmetic checks from transition rules; retry with a new budget domain.

## 04 — A borrowed retrieval winner

**Applied challenge:** select the best borrowed candidate using cosine similarity with a query. Require equal nonzero dimensions, finite inputs, nonzero norms, and finite computed scores; return a domain error otherwise. Define deterministic ID ties and the empty-candidate result.

**Acceptance cases:** query `[1,0]`, candidates ID 2 `[0,1]`, ID 1 `[1,0]` selects ID 1. Add equal scores, mismatched dimensions, a zero vector, and non-finite input. Check scores against a simple independent calculation.

**Defend:** trace the output lifetime; explain why `zip` alone does not validate shapes.

**Transfer at review:** return the top two IDs while preserving the ordering contract. **If stuck:** implement and validate one scalar score before adding selection.

## 05 — An ingestion pipeline with explicit limits

**Applied challenge:** read JSONL records with a configurable maximum line size enforced during reading. State whether the byte budget includes the newline, and choose fail-fast or skip-and-report behavior. Do not read the entire file first.

**Acceptance cases:** valid line, blank line, malformed JSON, exact byte limit, one byte beyond it, missing final newline, and an oversized line delivered in small reads. Assert how many records and diagnostics result under your policy.

**Defend:** account for parser buffers, queued records, and retained owners. Explain why bounded record count alone is insufficient.

**Transfer at review:** add a slow consumer without unbounded buffering. **If stuck:** separate bounded byte reading from JSON parsing and test each boundary before reconnecting them.

## 06 — Bounded work with complete accounting

**Applied challenge:** build a CPU worker pool whose contract bounds running and waiting work separately. Process deterministic jobs with IDs and report every accepted job as completed, failed, or explicitly abandoned during shutdown.

**Acceptance cases:** compare output with a serial implementation; test one and several workers, full queue, producer closure, and one injected worker failure. Use barriers or channels to control saturation rather than relying on short sleeps. Show every worker is joined.

**Defend:** explain Arc versus synchronization, lock scope, and the accounting invariant.

**Transfer at review:** preserve input-order output without serializing the work itself. **If stuck:** implement shutdown with one worker first; add parallelism only when all exits are accounted for.

## 07 — Async tasks with a responsible owner

**Applied challenge:** run delayed mock tools concurrently with a configured active limit. Preserve IDs, report completion-order outcomes, and make one owner responsible for observing every spawned task result. Keep the number of waiting tasks bounded as well.

**Acceptance cases:** active limit 2 is never exceeded; one failing tool does not hide other results; no jobs returns an empty result; shutdown has a documented behavior. Include a heartbeat observation when a CPU-heavy mock is introduced.

**Defend:** explain future creation, polling, suspension, join failures, and why async syntax does not move CPU execution off a runtime worker.

**Transfer at review:** route CPU work through a separately bounded path. **If stuck:** trace one future and its owner, then two concurrent futures, before scaling up.

## 08 — Deadlines survive queueing and retries

**Applied challenge:** extend the mock executor with one absolute deadline per job, bounded admission, cancellation, and at most two attempts for explicitly retryable side-effect-free mocks. Define cancellation of queued versus active jobs.

**Acceptance cases:** an expired queued job never starts; a permanent error never retries; queue wait and backoff consume the same deadline; cancellation releases capacity; every submitted ID receives a final disposition. Test controlled interleavings and time where supported.

**Defend:** explain what dropping a future does and why it cannot guarantee remote rollback. Identify cancellation-sensitive operations in your implementation.

**Transfer at review:** introduce a mock side effect and design an idempotency rule before enabling retry. **If stuck:** remove retries, prove deadline/accounting behavior, and then add one retry path.

## 09 — HTTP boundary without hidden work

**Applied challenge:** expose the validated mock executor through an Axum route. Specify status and JSON error schemas for malformed input, invalid requests, overload, and internal failure. Enforce a body-size bound before expensive execution.

**Acceptance cases:** router-level tests for each response category, correct content type, and an accepted request. Invalid or rejected requests must produce zero backend invocations. Test the actual extractor and middleware path, not only domain functions.

**Defend:** explain where extractor errors occur, how state is shared, and where admission is enforced.

**Transfer at review:** add an optional request field while keeping missing-field behavior explicit. **If stuck:** test the domain independently, then reconnect one HTTP error category at a time.

## 10 — Streaming under split input and disconnects

**Applied challenge:** stream deterministic events with a bounded buffer and a client-disconnect policy. Define shutdown admission, grace period, and final accounting. For your mock consumer, specify complete-frame and truncated-frame behavior.

**Acceptance cases:** split encoded events at every single byte boundary; combine several events in one chunk; include multibyte UTF-8; disconnect midway; use a slow reader; shut down during production. Assert bounded buffering and producer termination.

**Defend:** distinguish byte chunks, decoded text, and application events. Trace every task and permit of a disconnected stream.

**Transfer at review:** change event size dramatically without changing the memory bound. **If stuck:** implement the frame state machine synchronously before adding async I/O.

## 11 — An extension whose complete cost is visible

**Applied challenge:** expose a small validated computation and a batch form through PyO3/maturin. Choose and pin dependency versions. Convert domain errors to documented Python exceptions, and include reproducible build/import instructions.

**Acceptance cases:** Python tests compare scalar and batch outputs with an independent reference, including empty and invalid inputs. Measure call-only, conversion, and complete workload costs with equivalent work; do not claim gains from an unmeasured cost model.

**Defend:** explain input/output ownership and where Python object access is allowed.

**Transfer at review:** change output shape while keeping errors and ownership clear. **If stuck:** make a single-call module import and test correctly before adding batching or detached compute.

## 12 — Gateway defense and fault drill

**Applied challenge:** integrate the core capstone from your own module contracts. Keep deterministic mocks and a one-command demonstration. Draw each boundary from request arrival to stream completion and shutdown.

**Acceptance cases:** valid request, invalid request, full admission, expired queued work, backend failure, client disconnect, and shutdown during execution. For each, show outcome, resource release, and relevant trace evidence. State what the mock cannot establish.

**Defend:** follow one cancelled request end to end with the code and diagram available. Explain a rejected design and its tradeoff.

**Transfer at review:** your reviewer changes one capacity or deadline constraint; predict the effect, implement the change, and verify it. **If stuck:** find the earliest boundary whose invariant fails and reduce it to a small module-level reproduction.

## 13 — A performance claim you can withdraw

**Applied challenge:** choose a measured bottleneck from your gateway or ingestion pipeline. Write a falsifiable hypothesis, correctness contract, baseline procedure, and rejection condition before implementing one optimization.

**Acceptance cases:** compare equivalent outputs and work; include small and representative inputs, repeated measurements, toolchain/CPU/build metadata, raw results, and end-to-end impact. Include a case where the change is neutral or worse if observed. Honest inconclusive results can pass.

**Defend:** explain the bottleneck evidence, confounders, and why the data supports only the stated claim.

**Transfer at review:** change the input distribution and re-evaluate whether your conclusion still holds. **If stuck:** remove competing changes and produce a reproducible baseline before tuning anything.

## 14 — Allocation policy with an outlier test

**Applied challenge:** implement a text normalization API with an unchanged borrowed path and a changed owned path, plus a separate reusable-buffer variant. State exact normalization semantics and a retained-capacity policy.

**Acceptance cases:** unchanged text, changed text, Unicode, empty text, and one huge item followed by many small items. Compare all outputs with the same oracle. Separate allocation traffic, retained capacity, and process memory measurements.

**Defend:** identify the owner of every output and explain why fewer allocations can still retain more memory.

**Transfer at review:** change the fraction of modified inputs and defend whether Cow remains useful. **If stuck:** first prove semantic equivalence with a simple owned implementation, then change one ownership path.

## 15 — Layout experiment including conversion

**Applied challenge:** score candidates using both a simple reference layout and a validated flat layout. Separate hot embedding data from cold metadata where your experiment justifies it. Include packing and result lookup in total-cost measurements.

**Acceptance cases:** empty candidates, mismatched dimensions, small and large working sets, and equality against the declared score oracle. Record bytes, shape, layout, and conversion costs. Avoid relying on unspecified struct layout.

**Defend:** draw the addresses/indices accessed by one query and explain the traffic estimate's assumptions.

**Transfer at review:** make the workload require metadata for every candidate; reassess the layout choice. **If stuck:** trace a tiny 3-by-2 matrix by hand before changing representations.

## 16 — Parallel scoring with a numerical contract

**Applied challenge:** parallelize the exact scorer with a controlled Rayon pool and worker-local intermediate results. Define score tolerance, tie behavior, and a reproducible fixture policy.

**Acceptance cases:** compare sequential and parallel outputs for several worker counts, tiny and large inputs, awkward chunk boundaries, and tied scores. Record scaling and all active thread pools; do not assume more threads must help.

**Defend:** explain reduction-order effects, contention, and bandwidth as competing limits.

**Transfer at review:** run alongside another CPU workload and revise the concurrency setting from evidence. **If stuck:** eliminate shared mutation, validate one independent chunk, and only then join results in parallel.

## 17 — A portable kernel with a tested tail

**Applied challenge:** optimize a scalar similarity kernel, starting with compiler auto-vectorization. Inspect generated code. An explicit-intrinsics extension is optional and must retain a documented scalar fallback and feature policy.

**Acceptance cases:** dimensions 0, 1, width−1, width, width+1, and several nonmultiples of the chosen width; invalid shapes and non-finite values follow your contract. Compare with a higher-precision reference under stated tolerances. Exercise fallback directly if provided.

**Defend:** explain each remaining element, numerical difference, and target compatibility assumption. State unsafe preconditions if applicable.

**Transfer at review:** change dimension and deployment CPU assumptions. **If stuck:** return to a correct scalar tail and a portable build before investigating instruction selection.

## 18 — Top-k with identical semantics

**Applied challenge:** implement full-sort and one alternative exact top-k selector. Use descending finite score and ascending unique ID for ties; reject non-finite scores. Define `k>n` as returning all candidates and `k=0` as empty.

**Acceptance cases:** `(2,0.5),(1,0.5),(3,0.1)` with `k=1` returns ID 1; `k=2` returns IDs 1 then 2. Add no candidates, oversized k, NaN rejection, generated fixtures, and ordered output checks.

**Defend:** explain heap orientation or partition boundaries and why the selected region may still need sorting.

**Transfer at review:** require a different deterministic tie rule and update both methods consistently. **If stuck:** keep the comparator as a separately tested unit and use full sort as the oracle.

## 19 — A load experiment with an honest denominator

**Applied challenge:** evaluate the mock gateway using a declared arrival model. Separate offered, submitted, admitted, completed, rejected, and timed-out work; define whether latency begins at scheduled or actual submission.

**Acceptance cases:** light load, saturation, a server stall, and a batching configuration. Report generator lag, observation window, sample counts, outcome counts, queue wait, and latency percentiles. Check accounting without double-counting outcomes or assuming all submitted work completes during the window.

**Defend:** explain how a response-paced generator can hide a stall and why successful-response p99 alone is incomplete.

**Transfer at review:** tighten the deadline and predict the batching tradeoff before rerunning. **If stuck:** validate the generator and event accounting against a deterministic tiny schedule first.

## 20 — Array boundaries that survive strided inputs

**Applied challenge:** provide a batched numerical Python–Rust interface with explicit dtype, shape, stride, copy, mutation, and return-ownership rules. Use binding APIs appropriate to pinned versions.

**Acceptance cases:** contiguous, transposed, every-other-column, empty, wrong-dtype, and wrong-shape arrays. Reject or convert according to the written policy. Compare with an equivalent NumPy reference and include conversion/return costs in timing.

**Defend:** explain why shape does not imply contiguous storage and what makes detached computation safe for your chosen buffers.

**Transfer at review:** forbid input copies and redesign which layouts can be accepted. **If stuck:** establish a correct explicit-copy path before claiming zero-copy behavior.

## 21 — Compiler and safety change review

**Applied challenge:** propose one compiler-profile optimization against a reproducible release baseline. Optional PGO must separate profile-training and held-out evaluation workloads. Prefer a safe implementation unless unsafe has a defensible purpose.

**Acceptance cases:** unchanged contract tests, target/CPU compatibility statement, repeatable build commands, and representative evaluation. If unsafe is retained, document preconditions, wrapper validation, relevant tests, and the limits of any Miri run. Record unsupported tooling honestly.

**Defend:** explain why profile-data gains and passing dynamic checks cannot alone prove general performance or memory safety.

**Transfer at review:** remove the local CPU assumption or change the workload distribution. **If stuck:** isolate one flag or boundary and establish its effect before combining changes.

## 22 — Optimizer correctness before throughput

**Applied challenge:** implement ridge objective and gradient with `J=||Xw-y||²/(2n)+λ||w||²/2`, explicit shape/finite checks, and a solver with documented stopping and failure reasons. Then optimize one measured component.

**Acceptance cases:** with `X=[[1],[2]]`, `y=[1,2]`, `w=[0]`, `λ=0`, objective is 1.25 and gradient is −2.5. At `w=[1]`, `λ=1`, objective is 0.5 and gradient is 1. Add finite-difference checks, invalid shapes, non-finite detection, iteration cap, and a convergence fixture. Compare time to the same quality target, including setup/boundary costs.

**Defend:** derive the gradient and distinguish faster evaluations from fewer evaluations or changed accuracy.

**Transfer at review:** change regularization scaling or exclude an intercept from regularization; rederive before coding. **If stuck:** validate a one-parameter analytical example before adding matrix storage, parallelism, or solver abstraction.
