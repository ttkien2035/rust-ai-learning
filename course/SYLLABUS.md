# Schedule and learning outcomes

Budget: approximately 96 hours, eight per module. At eight hours/week this is 12 weeks; allow up to 16 weeks for revision. Each module: two hours lecture/reference reading, four hours implementation, one hour tests, one hour explanation and review. The schedule is adjustable, not a promise of expertise.

| Module | Focus | Demonstrable outcome | Assignment |
|---|---|---|---|
| 01 | Cargo, expressions, scalar types, functions | Compute valid telemetry summaries | Practice 01 |
| 02 | Ownership, moves, borrowing, strings | Choose an owned or borrowed API deliberately | Practice 02; Lab A begins |
| 03 | Structs, enums, Option, Result | Represent valid state and classify failures | Practice 03; Lab A completes |
| 04 | Iterators, lifetimes, traits, modules | Build a testable retrieval core | Lab B |
| 05 | Serialization, file I/O, bounded processing | Ingest JSONL with useful diagnostics | Lab C |
| 06 | Threads, Arc, synchronization, CPU work | Explain and implement bounded parallel work | Lab C extension |
| 07 | Futures, Tokio, task ownership | Execute independent I/O operations correctly | Lab D, first half |
| 08 | Backpressure, cancellation, deadlines | Bound load and recover capacity after failure | Lab D, second half |
| 09 | Axum, HTTP contracts, application state | Serve validated requests through a gateway | Lab E, first half |
| 10 | Streaming, testing, tracing, shutdown | Preserve stream semantics and diagnose failures | Lab E, second half |
| 11 | Python interoperability, benchmarks | Measure a native extension end to end | Lab F |
| 12 | Integration and architecture review | Defend a gateway's operational tradeoffs | Capstone |

## Mastery gates

- After 03: explain moves and borrows, handle missing data without panic, pass the three foundation exercise suites.
- After 06: process a large generated file with bounded application buffering; justify synchronization and identify where copies occur.
- After 08: demonstrate overload rejection, deadline expiry, and permit recovery with deterministic mock work.
- After 10: run a local gateway against a mock inference service; demonstrate disconnect and mid-stream failure behavior.
- After 12: reproduce correctness tests and a benchmark report, and explain where Python remains the better engineering choice.

If a gate fails, spend the next session fixing the gap rather than adding another library.

## Advanced optimization track — sessions 13–22

The core remains 96 hours. The advanced track adds approximately 100 hours, for a total of 22 sessions and 196 hours. At eight hours/week, allow another 13–16 weeks for the advanced material and revision. Follow the [advanced lectures and lab contracts](ADVANCED.md) and use the [performance report template](PERFORMANCE_REPORT.md).

| Session | Focus | Evidence of mastery | Lab |
|---|---|---|---|
| 13 | Profiling and experimental design | Defensible baseline, bottleneck evidence, controlled experiment | G: Performance investigation |
| 14 | Allocation and buffer ownership | Allocation/retention measurements with correct lifetimes | H: Allocation-aware normalizer |
| 15 | Cache locality and memory layout | Layout comparison and bandwidth reasoning | I: Candidate scoring layouts |
| 16 | Rayon and CPU parallelism | Measured break-even batch size, exact results, bounded resources | J: Parallel scoring |
| 17 | Vectorization and SIMD | Numeric error bounds, tail handling, portable fallback | K: Similarity kernel |
| 18 | Exact top-k and retrieval | Algorithm comparisons against a deterministic oracle | L: Selection shootout |
| 19 | Async tail latency and batching | Open-loop load results including rejected/unfinished work | M: Gateway latency budget |
| 20 | Python–Rust numeric boundaries | End-to-end NumPy comparison with ownership/copy accounting | N: Batched scoring |
| 21 | Code generation and unsafe review | Held-out results, deployment assumptions, safety argument | O: Optimization review |
| 22 | Numerical optimization engines | Time-to-quality, gradient checks, reproducible population evaluation | P: Optimizer capstone |

### Advanced mastery gates

- After 15: reproduce a baseline and show that a representation change preserves correctness; account for retained memory.
- After 18: prove exact top-k parity, explain task granularity, and measure numerical error for any changed kernel.
- After 20: separate boundary overhead from native compute and demonstrate the gateway's overload behavior.
- After 22: defend an optimization using time-to-quality, reproducibility, deployment compatibility, and maintenance cost. A rejected optimization can pass when the evidence supports rejecting it.

### Additional directions after the advanced track

- Data engineering: Arrow/Parquet, lazy execution, and interoperability with the existing Python analytics stack.
- Agent infrastructure: durable job state, leases, idempotency storage, and tool adapters; a separate protocol study is required before claiming MCP compliance.
- Inference internals: tensor libraries, model formats, CPU/GPU boundaries, and profiling; do not assume rewriting a gateway accelerates GPU inference.
- Video systems: bounded frame queues, buffer ownership, and explicit frame-dropping policies.

These remaining directions are optional specializations; the advanced optimization sessions above are fully included as lectures and lab specifications. Learners implement the labs in their local environment.


## Learning design: selective core practice and AI collaboration

Each of the 22 sessions has a route in [LEARNING_PATHS.md](LEARNING_PATHS.md): study and repair an example, complete a short conceptual or implementation probe, build with AI, then defend evidence and adapt a constraint. Core probes target small functions in sessions 01–04, 08, 18, and 22; project scaffolding and integration can use AI throughout. The existing hours and checkpoint IDs remain unchanged. Mastery means engineering control of the result, including AI-assisted code, rather than unaided authorship of every line.
