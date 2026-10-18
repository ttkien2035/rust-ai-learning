# Assessment and study method

## How to study each module

1. Predict a small example's output or compiler error before running it.
2. Read the lecture and only the assigned external topic.
3. Use the session learning route: repair an example, attempt its focused probe, then implement the lab with AI collaboration and explicit verification.
4. Test normal, boundary, and failure cases.
5. Explain who owns the important data and what happens on failure.
6. Record one mistake, its cause, and the evidence that corrected your understanding.

Use AI assistance as a tutor: request hints, compiler-error explanations, and review. Before accepting generated code, explain its ownership and failure behavior yourself. A passing test suite with an unexplained design does not pass the mastery gate.

## Initial diagnostic — 30 minutes

Without Rust, sketch answers using your existing experience:

- A FastAPI handler launches a background task; what should happen if its client disconnects?
- Ten thousand requests arrive but inference handles four concurrently. Where does the remainder live?
- A tool call times out after changing external state. Is retry safe?
- A dataset is larger than RAM. Which pipeline stages might accidentally retain it?
- A Python function spends most time in an optimized native library. What evidence would justify replacing it?

These questions identify systems topics to revisit; unfamiliar Rust syntax is not a diagnostic failure.

## Rubric for each lab: 100 points

| Area | Points | Evidence |
|---|---|---|
| Correct behavior | 35 | Stated contract and edge cases pass |
| Ownership and API design | 20 | Intentional moves, borrows, copies, and clear boundaries |
| Failure and resource handling | 20 | Errors propagate; work/memory/capacity bounds are explained |
| Verification | 15 | Reproducible tests with meaningful failure scenarios |
| Explanation | 10 | Concise design note and oral walkthrough |

Pass at 80 with no unresolved core contract violation. For early labs, resource handling means input and error policy rather than advanced async machinery. A benchmark improvement cannot compensate for incorrect results.

## Checkpoint answer guide

Read after attempting the lecture questions. These are reasoning anchors, not scripts to memorize.

| Module | Essential explanation |
|---|---|
| 01 | Absence is different from measured zero; slices borrow; final expressions determine block values. |
| 02 | Moving String transfers ownership without requiring a deep heap copy; borrowing shares access under restrictions; cloning creates independent owned data at a cost. |
| 03 | Enums constrain representable shapes, while transition legality and side-effect policy require additional logic. A timeout is ambiguous about remote completion. |
| 04 | Lifetimes describe reference validity relationships; they cannot extend a local allocation. Borrowed results depend on input storage. |
| 05 | Incremental reads are insufficient if a line, error list, or deduplication set grows without bound. UTF-8 boundaries and model-token boundaries differ. |
| 06 | Arc provides shared ownership, not unsynchronized mutation. Worker-local aggregation can reduce contention. Producer/consumer rate mismatch requires policy. |
| 07 | Futures need polling. Spawned tasks need suitable captures, and join errors differ from operation errors. Dropping a JoinHandle does not reliably cancel its task. |
| 08 | Active concurrency, queued work, and ingress body allocation are separate limits. Cancellation is not transaction rollback. |
| 09 | Validate before scarce work; reuse clients; distinguish process liveness from service readiness. HTTP errors require a stable mapping. |
| 10 | HTTP status is committed once sent; capacity spans the body lifetime. Network chunks need not align with application events. |
| 11 | Boundary conversions and batch size may dominate native execution. Equivalent behavior is a prerequisite for benchmarking. |
| 12 | Rust enforces certain memory/type properties, not availability or application correctness. Adoption should follow workload evidence and maintenance costs. |

## Reference-code review

Exercise 01 converts to floating point before summing. This avoids integer overflow but accepts approximation. Exercise 02 returns a trimmed slice into the input; its pointer test checks that it is borrowed. Exercise 03 checks configuration validity before request comparison. The tests express these contracts, but passing them does not prove every possible implementation correct; review the implementation too.

## Spaced review

Revisit ownership one day after module 02, one week later, and before module 07. Revisit one earlier bug or focused function with a changed input or constraint. At the end of each module, explain a compiler error you once misunderstood without looking at notes.

## Tutor prompts

> Teach module 02 from this course. Ask me to predict ownership behavior before explaining it. Give hints in stages and do not reveal the solution immediately.

> Review my Lab D implementation against its stated acceptance criteria. Trace task and permit lifetimes on timeout, cancellation, and shutdown. Separate demonstrated problems from assumptions.

> Assess my capstone using the course rubric. Ask me to defend the Python–Rust boundary using correctness and benchmark evidence.

## Advanced checkpoint anchors

For sessions 13–22, use the same 100-point rubric and require a completed [performance report](PERFORMANCE_REPORT.md). There is no required speedup percentage. Incorrect results, unbounded resource growth, or unsupported portability claims fail the contract even if the fastest measured case improves.

| Session | What a strong explanation establishes |
|---|---|
| 13 | Bottleneck evidence, timed boundaries, Amdahl assumptions, and measurement uncertainty. |
| 14 | Owner lifetimes, copies at queue boundaries, capacity retention, and outlier behavior. |
| 15 | Hot-field access, cache-sized versus larger workloads, bandwidth estimates, and false sharing versus true contention. |
| 16 | Scheduling overhead, task granularity, pool interactions, and exact top-k merge reasoning. |
| 17 | Precision/error contract, feature checks, safe tail handling, and stable fallback. |
| 18 | A deterministic total ordering, worst-retained heap root, k-dependent costs, and quality disclosure for approximation. |
| 19 | Queue/batch wait, fixed offered load, all outcomes, and deadline/resource recovery. |
| 20 | Storage ownership, layout/dtype policy, interpreter constraints, and the complete Python-call baseline. |
| 21 | Held-out workload results, build/deployment assumptions, and proof obligations not established by tests alone. |
| 22 | Equal objective scaling and stopping targets, gradient verification, convergence failures, and scheduling-independent randomness. |
# Workshop review protocol

Use the Practice studio attached to the current session before marking it complete. Submit: (1) the exact contract and assumptions, (2) code or a focused diff, (3) commands, environment and relevant outputs, (4) edge/failure tests, and (5) one tradeoff or unresolved limitation. For performance work, also attach PERFORMANCE_REPORT.md with equivalent-work comparisons and correctness evidence. A faster incorrect result does not pass.

Teacher mode uses a worked example and targeted questions to diagnose the current misconception. Teammate mode can help generate and integrate code, while reserving the specified short Core probe for focused learner practice. Reviewer mode checks the declared contract first, reports concrete findings with evidence, and asks for a correction plus a new regression case where appropriate. Predictions are formative practice; the existing three saved checkpoints remain the durable reflection record.

Use three review outcomes: **Ready** (contract and evidence satisfied), **Revise** (specific correctness or evidence gap), and **Stretch** (optional improvement beyond the contract). Do not gate completion on an arbitrary speedup. At the next study block, explain one previous mistake without notes; revisit it about a week later. When a resource disagrees with your implementation, check versions and reduce the disagreement to a small reproducible example.



## AI collaboration policy

Use [LEARNING_PATHS.md](LEARNING_PATHS.md) and [MASTERY.md](MASTERY.md) for the current learning and review policy. AI-assisted implementations can reach Independent when you can explain, verify, debug, and adapt them. No whole-project blank-file requirement applies. Assess a short unaided Core probe only where the session route specifies one; other probes assess reasoning. Record assistance separately from demonstrated mastery.
