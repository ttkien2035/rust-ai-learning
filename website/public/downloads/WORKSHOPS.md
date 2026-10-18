# Session workshops: predict, build, defend

Original course activities, researched 18 October 2026. Read each prediction before revealing the hint. These workshops supplement the existing lectures and lab contracts. They fit within the existing session budget; external courses are optional practice, not additional required courses.

For an eight-hour core session, budget roughly 20 minutes for retrieval of prior learning, 80 for explanation and examples, 240 for implementation, 80 for testing and review, and 60 for the checkpoint and corrections. For a ten-hour advanced session, add two hours for experiments and interpretation. Split this across several study blocks. Revisit one mistake in your next session and again a week later. These timings are a course design choice, not a claim about an experimentally optimal schedule.

Code below is illustrative unless explicitly described as a complete program. Compile fragments inside a suitable function or test. Rust execution is local; the website does not run code. Keep dependencies and toolchain versions in your lab report. Use stable Rust by default; advanced tools may require separate nightly or platform-specific setup.

## 01 — Make telemetry assumptions executable

### Observable goals

- Write a function accepting both borrowed arrays and vectors through a slice.
- Specify empty-input behavior and units before implementing statistics.
- Explain a compiler type error using the expected and actual types.

### Predict and inspect

For latencies `[0, 500, 501]` and the rule `latency > 500`, predict the slow count and mean. Now predict the result for an empty input. Which answer represents missing observations without inventing a measurement?

### Worked reasoning

The count is 1; the approximate mean is `1001.0 / 3.0`. A function returning `Option<f64>` can distinguish `None` from `Some(0.0)`. Converting each `u64` before summation avoids integer-sum overflow, but does not provide exact arithmetic for all large integers. Write that limitation in your contract. In Python, an empty NumPy reduction may produce a warning or NaN; here the return type makes the choice visible to callers.

### Practice studio

1. **Reproduce:** implement mean, maximum, and threshold count; test the three-element input above.
2. **Change:** accept a threshold argument and test equality at 500. Run the same functions on an array and a vector.
3. **Transfer:** design a `LatencyMs` wrapper and explain which mistakes it prevents and which values still require validation.

<details><summary>Hint — start with the contract</summary><p>Return early on an empty slice. Maximum naturally returns an Option too. A domain wrapper distinguishes milliseconds from token counts; it does not prove the sensor measured correctly.</p></details>

**Review evidence:** function signatures, empty/singleton/boundary tests, and one compiler error you can now explain. Revisit this contract when measuring latency in Session 19.

**Targeted reading:** [Rust Book: functions](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html), especially expressions; [Rustlings repository](https://github.com/rust-lang/rustlings), variables and functions, for optional short drills.

## 02 — Trace owners before repairing code

### Observable goals

- Identify the owner and final use of each borrow in a short program.
- Repair a borrow conflict without an unnecessary clone.
- Distinguish UTF-8 byte length from a token or character count.

### Predict and inspect

```rust
let mut prompt = String::from("  agent  ");
let view = prompt.trim();
prompt.clear();
println!("{view}");
```

Predict whether this compiles. Mark the allocation, the owner, and the last use of `view` before asking the compiler.

### Worked reasoning

`view` refers into `prompt` and is used after `clear`, so mutation conflicts with the active shared borrow. Printing `view` before clearing removes that overlap. Creating an owned copy also works, but has a different allocation contract. A lifetime annotation cannot make the conflicting accesses safe. Use the compiler's span information to compare your predicted last use with the actual one.

### Practice studio

1. **Reproduce:** compile the failing fragment, then repair it by reordering uses.
2. **Change:** make a queued job own the trimmed text; explain why an allocation is now intentional.
3. **Transfer:** add Vietnamese text and an emoji to your chunker tests. Define boundaries with `char_indices`; do not equate character counts with model tokens.

<details><summary>Hint — draw two different designs</summary><p>A temporary view can borrow existing storage. A job retained after its source is dropped must own its text or retain an appropriate owner. Those are different API requirements.</p></details>

**Review evidence:** ownership diagram, failing diagnostic, two repairs with cost explanations, UTF-8 tests. Retrieve Session 01's slice contract from memory first.

**Targeted reading:** [Rust Book: borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html); [Brown ownership chapter](https://rust-book.cs.brown.edu/ch04-00-understanding-ownership.html) for visual explanations and diagnostic quizzes.

## 03 — Test domain invariants at construction

### Observable goals

- Represent agent execution alternatives without contradictory flags.
- Propagate an expected error through `Result` rather than panicking.
- Check a token-budget calculation without overflow.

### Predict and inspect

A request has a context limit of 8,192, a prompt of 8,000, and reserves 256 output tokens. Is it valid? What if prompt plus reserve exceeds the integer type's range before comparison?

### Worked reasoning

The total 8,256 exceeds the limit by 64. `checked_add` distinguishes arithmetic overflow from an ordinary over-budget result. Use a constructor returning a domain error so callers cannot accidentally construct a validated request through public fields. An enum such as `Execution::Failed { reason }` couples the failure state to its explanation. `Result` does not automatically enforce valid transitions; transition methods still need rules.

### Practice studio

1. **Reproduce:** implement validation for exact fit, one over, and arithmetic overflow.
2. **Change:** distinguish invalid configuration from a valid request that exceeds a budget.
3. **Transfer:** define allowed agent transitions and test that a finished execution cannot become running again without an explicit new attempt.

<details><summary>Hint — separate two decisions</summary><p>First establish that arithmetic is representable. Then compare the representable total with the limit. Keep validation fields private if every value of the type must satisfy the invariant.</p></details>

**Review evidence:** error variants, a transition table, tests for all three arithmetic boundaries. Explain why `unwrap` in a test has a different purpose from `unwrap` on untrusted service input.

**Targeted reading:** [Rust Book: recoverable errors](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html); [Comprehensive Rust](https://google.github.io/comprehensive-rust/) sections on enums, pattern matching, and error handling. Optional drills: [100 Exercises repository](https://github.com/mainmatter/100-exercises-to-learn-rust).

## 04 — Make retrieval ownership and ranking precise

### Observable goals

- Explain a returned reference's relationship to its input lifetime.
- Implement a deterministic scalar similarity reference.
- State a policy for dimension mismatch, zero norms, and non-finite values.

### Predict and inspect

Would `fn best<'a>(items: &'a [Document]) -> Option<&'a Document>` keep documents alive after their owner is dropped? Does a lifetime annotation allocate or extend storage?

### Worked reasoning

The annotation describes a relationship checked at compile time; it does not retain the owner. For a similarity calculation, `zip` alone silently stops at the shorter input. Check equal dimensions before accumulation. For equal scores, choose a stable document-ID tie rule so two valid implementations have comparable outputs. Decide whether zero vectors produce a domain error or a documented special score before optimizing.

### Practice studio

1. **Reproduce:** write scalar dot product and cosine reference functions with explicit validation.
2. **Change:** return a borrowed winning document rather than cloning its content.
3. **Transfer:** compare an iterator implementation and a loop on the same generated fixtures. Add an optional [Proptest](https://proptest-rs.github.io/proptest/intro.html) property: valid top-1 scores are no lower than any candidate score under the chosen ordering.

<details><summary>Hint — correctness before abstraction</summary><p>Start with one concrete Document type and a loop. Generalize with a trait only after identifying which behavior actually varies. Keep the simple reference for later differential tests.</p></details>

**Review evidence:** dimension/zero/non-finite/tie tests, ownership explanation, scalar oracle. Reuse this oracle in Sessions 15–18.

**Targeted reading:** [Rust Book: lifetime syntax](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html); [Iterator documentation](https://doc.rust-lang.org/std/iter/trait.Iterator.html), including `zip`.

## 05 — Bound ingestion by bytes as well as records

### Observable goals

- Define an ingestion memory budget including the largest record.
- Report line-level errors while following a documented stop/skip policy.
- Test parser behavior on malformed and oversized input.

### Predict and inspect

A JSONL queue holds at most 16 records. Is memory bounded if a single record may contain a 1 GB string? Does reading one line at a time itself enforce a line-size limit?

### Worked reasoning

A count bound needs a size bound. Reading a full line into a reusable buffer can still grow that buffer to an oversized line before validation. For hostile input, use a bounded reading strategy that detects the limit while reading, then fail or drain according to policy. A zero-copy parsed view may also prevent reusing the buffer until consumers finish. Ownership, throughput, and retention must be designed together.

### Practice studio

1. **Reproduce:** ingest valid, blank, and malformed lines with line-numbered diagnostics.
2. **Change:** enforce a byte limit during reading and test exactly-at-limit and one-byte-over cases.
3. **Transfer:** simulate a slow downstream consumer; record queue depth, buffer capacity, and peak resident memory separately. Optional parser fuzzing follows the [Rust Fuzz Book](https://rust-fuzz.github.io/book/cargo-fuzz.html); check its toolchain/platform requirements first.

<details><summary>Hint — write the memory equation</summary><p>Estimate queue capacity × maximum retained record bytes, plus parser buffers and in-flight work. This is a design budget, not an exact RSS prediction; allocator and runtime overhead remain.</p></details>

**Review evidence:** limit enforcement test, error policy, memory-budget calculation, and reproducible input fixture. Recall Session 02 before choosing borrowed records.

**Targeted reading:** [BufRead API](https://doc.rust-lang.org/std/io/trait.BufRead.html), especially `read_line` and `fill_buf`; [Serde JSON documentation](https://docs.rs/serde_json/latest/serde_json/).

## 06 — Prove work is accounted for

### Observable goals

- Separate shared ownership from synchronized mutation.
- Account for accepted, completed, failed, and abandoned jobs.
- Explain shutdown behavior when producers or consumers disappear.

### Predict and inspect

Two threads each load an atomic counter, add one locally, and store the result. Can the final count be one even if every operation uses sequential consistency?

### Worked reasoning

Both threads may load zero before either store. Strong ordering does not turn a multi-operation sequence into one indivisible update. An atomic read-modify-write such as `fetch_add` addresses this particular counter; a multi-field invariant may need a lock or another design. Likewise, `Arc<T>` shares ownership but does not make arbitrary `T` mutations safe. Prefer worker-local results merged at a clear boundary when possible.

### Practice studio

1. **Reproduce:** implement the bounded worker pool with one and several workers; compare results with the sequential oracle.
2. **Change:** inject a worker failure and close a sender early. Ensure shutdown cannot wait forever for an impossible event.
3. **Transfer:** model a tiny accounting primitive with [Loom](https://docs.rs/loom/latest/loom/). Replace relevant primitives with Loom equivalents; limit the model to two threads and a few operations. A passing bounded model does not prove the entire service correct.

<details><summary>Hint — list every exit path</summary><p>Define accepted = completed + failed + explicitly abandoned at shutdown. Join workers and propagate failures. Do not hold a global result lock while doing CPU work.</p></details>

**Review evidence:** job-accounting assertions, sequential comparison, shutdown tests, and an ownership diagram. Revisit the Session 03 error model.

**Targeted reading:** [Rust Book: shared-state concurrency](https://doc.rust-lang.org/book/ch16-03-shared-state.html); [atomic ordering API](https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html).

## 07 — Separate waiting from CPU execution

### Observable goals

- Explain why creating a future does not execute it to completion.
- Choose between async I/O and a bounded CPU execution path.
- Observe task results and failures instead of detaching them accidentally.

### Predict and inspect

An async handler performs a long scalar embedding computation without reaching an await point. Will unrelated timers on the same runtime worker necessarily remain responsive?

### Worked reasoning

Cooperative async scheduling relies on yielding. An `async` declaration does not turn CPU work into nonblocking work. Measure a heartbeat task while running the workload. A blocking-task facility moves execution, but unrestricted submissions can simply move the resource problem to another queue. Establish a concurrency bound, and remember that already-running blocking work generally cannot be stopped by dropping its awaiting future.

### Practice studio

1. **Reproduce:** run concurrent deterministic delayed tool calls and gather every result.
2. **Change:** add a CPU-heavy mock and compare heartbeat lag before and after moving it to a bounded execution path.
3. **Transfer:** define separate limits for external I/O requests and CPU jobs. Test failure propagation and shutdown with pending jobs.

<details><summary>Hint — observe the executor</summary><p>Log task start, first poll, completion, and join outcome. A returned JoinHandle should have an explicit owner responsible for observing or cancelling it.</p></details>

**Review evidence:** task lifecycle trace, heartbeat measurement method, concurrency-bound test. Recall Session 06's distinction between ownership and synchronization.

**Targeted reading:** [Tokio: async in depth](https://tokio.rs/tokio/tutorial/async); [Tokio spawn_blocking](https://docs.rs/tokio/latest/tokio/task/fn.spawn_blocking.html).

## 08 — Treat cancellation as a protocol event

### Observable goals

- Carry one end-to-end deadline across queueing and attempts.
- Explain cancellation safety for each operation raced in `select!`.
- Prevent retries from duplicating non-idempotent effects.

### Predict and inspect

A read operation consumes part of a message, then loses a `select!` race. If you recreate the read future, can you assume no bytes were consumed? What happens to an upstream tool invocation after your local timeout?

### Worked reasoning

Dropping a future stops polling that future; it does not roll back previously performed work. Cancellation behavior depends on the specific operation. A framed protocol can retain partial bytes in an owned buffer across waits. A deadline should include queue delay: a 100 ms budget with 80 ms already queued leaves roughly 20 ms, not another fresh 100 ms per retry. Remote side effects require protocol-level idempotency or reconciliation.

### Practice studio

1. **Reproduce:** test a bounded queue with deadline expiry while waiting for admission.
2. **Change:** cancel at several framing boundaries; verify the next message is not corrupted.
3. **Transfer:** build a retry table for connection failure, timeout after submission, and explicit rejection. State maximum attempts and remaining-budget checks.

<details><summary>Hint — read operation-specific guarantees</summary><p>Consult the cancellation-safety section of the exact API. Store protocol progress outside a disposable future when required. A timeout response alone cannot establish that a remote operation never ran.</p></details>

**Review evidence:** deadline trace, cancellation test matrix, bounded retries and idempotency policy. First retrieve the lifecycle from Session 07.

**Targeted reading:** [Tokio select cancellation safety](https://docs.rs/tokio/latest/tokio/macro.select.html#cancellation-safety); [Tokio channels](https://tokio.rs/tokio/tutorial/channels).

## 09 — Make HTTP boundaries testable

### Observable goals

- Separate transport validation from domain validation.
- Map expected failures to consistent status codes and bodies.
- Apply request-size and concurrency limits before expensive work.

### Predict and inspect

How should malformed JSON, a well-formed over-budget request, and an overloaded gateway differ? If JSON extraction fails before your handler body, does the handler's error mapping run?

### Worked reasoning

Extraction and domain execution are distinct stages. A consistent service contract may need explicit rejection handling at the extractor boundary. Validate cheap constraints before scheduling inference. Define responses for malformed input, invalid domain values, overload, and internal failures without leaking sensitive internals. Share immutable configuration or deliberately synchronized state rather than cloning a large mutable model per request.

### Practice studio

1. **Reproduce:** test the router in process with a deterministic mock backend.
2. **Change:** add malformed JSON, missing fields, oversized bodies, and domain-invalid requests; check both status and response schema.
3. **Transfer:** saturate admission and verify rejected requests never invoke the backend. Count accepted and rejected work separately.

<details><summary>Hint — test the real boundary</summary><p>Calling a domain function cannot test extractor rejection or middleware limits. Exercise the router with request bodies and inspect its actual response.</p></details>

**Review evidence:** HTTP contract table, router tests, and backend invocation counts. Reuse Session 03's validated request type and Session 08's deadline.

**Targeted reading:** [Axum extractors](https://docs.rs/axum/latest/axum/extract/index.html), rejection handling and body limits; [Axum examples repository](https://github.com/tokio-rs/axum/tree/main/examples), choose testing and error-handling examples matching your pinned version.

## 10 — Design streaming across arbitrary chunks

### Observable goals

- Distinguish transport chunks from complete application events.
- Bound buffering for slow clients.
- Demonstrate a shutdown sequence that accounts for active streams.

### Predict and inspect

An SSE event contains an emoji. Can one network chunk end in the middle of its UTF-8 bytes? Can several events arrive in one chunk? What happens if the consumer stops reading?

### Worked reasoning

Transport boundaries do not define event boundaries. A decoder must retain incomplete bytes and frames until it has a complete valid event. For output, backpressure and disconnect propagation should stop unnecessary production. A shutdown policy needs an admission stop, a grace period, and a defined action when work outlives that period. A final log line is not proof that all producers and consumers terminated.

### Practice studio

1. **Reproduce:** encode a known event stream and decode it with each possible single split point.
2. **Change:** test multiple events per chunk, a truncated final frame, and a slow reader.
3. **Transfer:** disconnect a client during generation, then trigger shutdown. Verify producer termination and bounded retained events without logging private prompts.

<details><summary>Hint — keep protocol state explicit</summary><p>Use a byte buffer until decoding is valid; do not assume each chunk is independently valid text. Trace stream ID and lifecycle transitions, with a separate policy for incomplete final frames.</p></details>

**Review evidence:** split-point tests, slow-consumer test, disconnect trace, and shutdown accounting. Retrieve Session 05's byte-bound argument.

**Targeted reading:** [Axum SSE API](https://docs.rs/axum/latest/axum/response/sse/index.html); [Tokio graceful shutdown](https://tokio.rs/tokio/topics/shutdown); [tracing documentation](https://docs.rs/tracing/latest/tracing/).

## 11 — Choose a Python boundary deliberately

### Observable goals

- Package a small extension with repeatable build instructions.
- Translate domain errors into appropriate Python exceptions.
- Measure call, conversion, compute, and return costs separately.

### Predict and inspect

A Rust kernel takes 2 microseconds per item, but each Python call adds 10 microseconds of boundary work. What is the approximate single-item cost? What changes if one call processes 100 items and has the same fixed overhead?

### Worked reasoning

The simplified costs are 12 microseconds for one item and 210 for a batch of 100, or 2.1 per item. This calculation assumes fixed overhead and unchanged compute cost; it is a hypothesis to test, not a benchmark result. Python attachment and safe access to Python objects are API- and version-dependent. Keep Python object access outside detached numerical work, and never assume releasing interpreter attachment makes shared mutable buffers safe.

### Practice studio

1. **Reproduce:** expose one validated scalar function and test it from Python.
2. **Change:** add a batch function and compare equivalent outputs with the Python reference.
3. **Transfer:** measure empty-call overhead, conversion-only cost, and end-to-end processing; include wheel build and import instructions for your platform.

<details><summary>Hint — hold the workload constant</summary><p>Compare the same inputs and amount of useful work. A NumPy reference should use its intended vectorized path rather than an artificially slow Python loop.</p></details>

**Review evidence:** Python tests, error mapping, pinned PyO3/maturin versions, and a cost breakdown. Revisit ownership before storing borrowed Python data.

**Targeted reading:** [PyO3 performance guide](https://pyo3.rs/main/performance); [maturin user guide](https://www.maturin.rs/). Use documentation matching your pinned release; `main` may describe unreleased behavior.

## 12 — Defend an integrated AI gateway

### Observable goals

- Integrate request validation, admission, deadlines, and streaming.
- Demonstrate predictable behavior during overload and shutdown.
- Explain architectural tradeoffs using evidence from a reproducible mock.

### Predict and inspect

The backend becomes slow while new requests continue arriving. Which resource reaches its bound first? Which metric would distinguish queue waiting from model execution?

### Worked reasoning

Draw the request path: parse → validate → admit → queue → execute → stream → release. Assign an owner, a bound, a deadline rule, and an observable event to each stage. A shared permit retained until a stream ends bounds something different from one released after response headers. Decide which resource your permit represents. A deterministic mock makes overload, cancellation, and shutdown reproducible without a paid model API.

### Practice studio

1. **Reproduce:** finish the capstone's happy path with a fixed-seed mock backend.
2. **Change:** inject slow execution, backend failure, client disconnect, and shutdown during work.
3. **Transfer:** propose one production extension and identify what your mock cannot validate, such as real provider rate limits or model-specific tokenization.

<details><summary>Hint — review one lifecycle end to end</summary><p>Pick a single cancelled request and follow every task, permit, queue item, and buffer it owns. Then repeat for successful completion.</p></details>

**Review evidence:** architecture diagram, run instructions, failure matrix, representative traces, bounded-resource tests, and a short tradeoff memo. Explain one rejected design. Review Sessions 08–10 without opening your notes first.

**Targeted reading:** [Tokio mini-redis repository](https://github.com/tokio-rs/mini-redis) for lifecycle design; [Axum examples](https://github.com/tokio-rs/axum/tree/main/examples) for framework-specific patterns. Do not treat an example server as a complete production specification.

## 13 — Make an optimization claim falsifiable

### Observable goals

- State a measurable performance hypothesis and correctness guard.
- Separate microbenchmark evidence from end-to-end impact.
- Record enough context to reproduce and challenge a claim.

### Predict and inspect

A function accounts for 20% of baseline time and becomes twice as fast. Can the complete workload become twice as fast?

### Worked reasoning

With the remaining 80% unchanged, normalized time is `0.8 + 0.2/2 = 0.9`, giving about 1.11× overall speedup. This assumes the workload and other costs stay constant. A faster microbenchmark can have no meaningful system effect when I/O or queueing dominates. Profile a representative workload, change one variable, and compare multiple input sizes rather than selecting the most flattering case.

### Practice studio

1. **Reproduce:** establish a release-build baseline and record toolchain, target, CPU, dataset seed, and commands.
2. **Change:** implement one change behind an equivalent interface; validate outputs before timing.
3. **Transfer:** compare isolated-kernel and complete-pipeline results, including a case that does not improve. Report uncertainty and repeatability, not just the fastest run.

<details><summary>Hint — define a rejection condition</summary><p>Before running, write what would make you abandon the optimization: incorrect output, a memory regression, unstable gains, or no relevant end-to-end improvement.</p></details>

**Review evidence:** completed PERFORMANCE_REPORT, profiler observation, baseline/variant commands, raw measurements, and correctness comparison. Retrieve the gateway bottleneck map from Session 12.

**Targeted reading:** [Rust Performance Book](https://nnethercote.github.io/perf-book/) on profiling and benchmarking; [Criterion input benchmarks](https://bheisler.github.io/criterion.rs/book/user_guide/benchmarking_with_inputs.html). Use `std::hint::black_box` where appropriate; it is not a proof of realistic workload behavior.

## 14 — Trade allocations against retention

### Observable goals

- Identify allocation sites and distinguish length from retained capacity.
- Use borrowed output only while its owner remains valid.
- Evaluate reuse and `Cow` using a realistic input distribution.

### Predict and inspect

A reusable buffer sees one huge document followed by thousands of tiny documents. Does `clear()` return its capacity to the allocator? Would shrinking on every item necessarily improve throughput?

### Worked reasoning

Clearing removes contents while keeping capacity for reuse. This can reduce repeated allocations and also retain a large outlier allocation. A retention policy might cap reusable capacity or replace unusually large buffers after use; test the churn this creates. `Cow` can avoid owning output on an unchanged path, but changed text still needs owned storage. A borrowed view also ties output lifetime to its source.

### Practice studio

1. **Reproduce:** compare always-owned normalization with an unchanged-input borrowed path.
2. **Change:** reuse a buffer and add an outlier-size policy. Track allocation counts/bytes with suitable tooling and RSS separately.
3. **Transfer:** vary the fraction of changed documents and size distribution; measure throughput and retained memory, including the huge-then-small case.

<details><summary>Hint — two budgets, two measurements</summary><p>Allocation traffic measures work over time; retained capacity measures storage kept alive. Neither alone establishes process memory usage.</p></details>

**Review evidence:** ownership diagram, Unicode-equivalence tests, allocation evidence, and the chosen retention rule. Review Session 02's borrowed output and Session 05's memory budget.

**Targeted reading:** [String capacity API](https://doc.rust-lang.org/std/string/struct.String.html#method.clear); [Cow API](https://doc.rust-lang.org/std/borrow/enum.Cow.html); [Performance Book: heap allocations](https://nnethercote.github.io/perf-book/heap-allocations.html).

## 15 — Match layout to the access pattern

### Observable goals

- Explain the bytes read by a candidate-scoring loop.
- Compare layouts while including conversion and metadata access.
- Keep bounds and dimensional invariants explicit.

### Predict and inspect

Each candidate contains a 768-element `f32` embedding plus a large text payload. A scoring pass uses only embeddings and IDs. Which fields need to be touched, and what is the minimum embedding data volume for one million candidates?

### Worked reasoning

The embedding payload alone is `1,000,000 × 768 × 4` bytes, about 3.072 GB in decimal units. This is a traffic model, not a measured bandwidth result: caches, repeated passes, and representation affect actual traffic. Separating embeddings from cold metadata can help a scan, but transposition or packing adds costs and may harm other operations. Keep a plain layout as the oracle.

### Practice studio

1. **Reproduce:** implement scoring over nested vectors and a flat row-major buffer with validated dimensions.
2. **Change:** separate metadata and vary candidate count and dimension across working-set sizes.
3. **Transfer:** include packing and top-k metadata lookup in an end-to-end benchmark. Estimate effective useful-byte throughput and explain its assumptions.

<details><summary>Hint — optimize the measured loop</summary><p>Draw the indices accessed by one query. Array-of-structures versus structure-of-arrays is a workload decision; neither layout wins universally.</p></details>

**Review evidence:** layout diagram, shape tests, memory-size accounting, kernel and conversion-inclusive results. Reuse Session 04's oracle and Session 13's experiment contract.

**Targeted reading:** [Performance Book: type sizes](https://nnethercote.github.io/perf-book/type-sizes.html); [Rust Reference: type layout](https://doc.rust-lang.org/reference/type-layout.html). Do not assume unspecified struct layout or use packed representations as a casual performance fix.

## 16 — Parallelize useful work, then measure scaling

### Observable goals

- Keep mutable state local to parallel work where possible.
- Compare worker counts and task granularity against a scalar reference.
- Describe numerical changes introduced by reduction order.

### Predict and inspect

Can a parallel floating-point sum differ from a sequential sum without a data race? Why might doubling worker count make a memory-heavy scan slower?

### Worked reasoning

Floating-point addition is not associative, so a different reduction tree can change rounding. Decide whether your contract requires exact ordering, a tolerance, or a higher-precision reference. Parallel speed depends on useful work per task, synchronization, available bandwidth, and competing thread pools. A Python caller, BLAS, and Rayon can each create workers; total runnable threads matter more than one library's setting.

### Practice studio

1. **Reproduce:** parallelize independent candidate scoring using a controlled Rayon pool.
2. **Change:** sweep worker count and chunk size; compare small and large datasets.
3. **Transfer:** compare a global-lock accumulator with local partial results merged afterward. Test result equivalence under the declared floating-point/tie policy.

<details><summary>Hint — benchmark the crossover</summary><p>Include workloads small enough that parallel overhead dominates. Run one benchmark configuration at a time and record other active thread pools.</p></details>

**Review evidence:** scaling curve, thread configuration, correctness tolerances, and a justified sequential fallback threshold if one is useful. Review Session 06's accounting and Session 15's traffic model.

**Targeted reading:** [Rayon parallel iterators](https://docs.rs/rayon/latest/rayon/iter/index.html); [ThreadPoolBuilder](https://docs.rs/rayon/latest/rayon/struct.ThreadPoolBuilder.html).

## 17 — Vectorization with an explicit portability contract

### Observable goals

- Inspect generated code before claiming vectorization.
- Validate tails, alignment assumptions, and numerical differences.
- Preserve a portable scalar path for unsupported machines.

### Predict and inspect

A vector kernel handles eight `f32` values per iteration. Which elements are processed when dimension is 10? Can a binary compiled for your local CPU be assumed safe to run on every deployment machine?

### Worked reasoning

One vector-sized group covers indices 0–7; a tail must handle 8–9. Test lengths below, equal to, and above the vector width, plus zero length. Compiler auto-vectorization should be the first investigation. Explicit target instructions require a deployment or runtime-dispatch contract. Portable SIMD's `std::simd` remains experimental and nightly-only in the documentation checked for this course; it is an optional branch, not a stable-course prerequisite.

### Practice studio

1. **Reproduce:** compare a clean scalar loop with compiler-generated assembly under the chosen release profile.
2. **Change:** try one vectorization-friendly restructuring and test awkward lengths against an `f64` reference with declared tolerances.
3. **Transfer:** if using architecture intrinsics, add feature detection and scalar fallback; document every unsafe precondition and test the fallback directly.

<details><summary>Hint — separate correctness from dispatch</summary><p>Kernel tests should cover every length category. Dispatch tests should prove unsupported features choose a valid fallback. A benchmark on one CPU tests neither universal portability nor all unsafe inputs.</p></details>

**Review evidence:** assembly excerpt, tail tests, tolerance report, and supported-target policy. Retrieve Sessions 13 and 15 before changing compiler flags.

**Targeted reading:** [std::simd status](https://doc.rust-lang.org/std/simd/); [std::arch guidance](https://doc.rust-lang.org/std/arch/index.html).

## 18 — Optimize selection without changing retrieval semantics

### Observable goals

- Define total ordering, ties, and non-finite handling for scored IDs.
- Compare full sort, bounded heap, and partition-based exact top-k.
- Distinguish exact selection from approximate search quality.

### Predict and inspect

For scores `(A,0.9), (B,0.9), (C,0.2)` and `k=1`, what should the output be? What about `k=0`, `k>n`, or a NaN score?

### Worked reasoning

Define descending finite score followed by ascending ID, for example. Reject non-finite scores if that is your contract; `total_cmp` provides an ordering but does not decide the domain policy for you. Partition can identify a selected region without sorting it, so a final sort is needed if the API promises ordered output. Handle `k=0` and `k>=n` before calculating a pivot index. This optimization preserves exact scores; ANN changes the search problem and needs recall evaluation.

### Practice studio

1. **Reproduce:** implement full-sort top-k as the oracle.
2. **Change:** compare heap and partition approaches across `n`, `k`, ties, and already ordered input.
3. **Transfer:** use generated fixtures to assert identical ordered IDs across all exact methods; separately describe an ANN recall@k experiment without presenting it as exact equivalence.

<details><summary>Hint — reuse the comparator everywhere</summary><p>A heap may need an inverted comparator. Test which candidate sits at its root before trusting replacement logic.</p></details>

**Review evidence:** ordering contract, differential tests, complete-result benchmarks including final sorting. Review Session 04's zero-vector policy and Session 17's score tolerance.

**Targeted reading:** [slice selection API](https://doc.rust-lang.org/std/primitive.slice.html#method.select_nth_unstable_by); [BinaryHeap API](https://doc.rust-lang.org/std/collections/struct.BinaryHeap.html).

## 19 — Measure overload, queueing, and tails honestly

### Observable goals

- Distinguish offered, admitted, completed, rejected, and timed-out requests.
- Measure end-to-end latency including queue time.
- Evaluate a batching policy under both light and heavy load.

### Predict and inspect

A client sends the next request only after the previous reply. When the server stalls, does this client maintain the same offered arrival rate? Could low completed-request p99 hide many timeouts?

### Worked reasoning

A response-paced generator reduces its offered rate during a stall. Use a scheduled-arrival workload when testing a fixed offered rate, and report generator lag so client saturation is visible. Define latency start at the scheduled or actual submission time explicitly. Track failures alongside successful latencies. Batch waiting can improve compute efficiency and consume the same deadline budget a request needs for useful execution.

### Practice studio

1. **Reproduce:** instrument queue wait, execution, and end-to-end duration in the mock gateway.
2. **Change:** sweep offered load through saturation and report counts, throughput, p50/p95/p99, and queue depth.
3. **Transfer:** compare fixed-size batching with a maximum-wait rule at low and high load. Include rejection and timeout rates in every comparison.

<details><summary>Hint — preserve the denominator</summary><p>Record how many arrivals were scheduled and submitted, not just how many responses arrived. Include sample count and observation window; a percentile without these is difficult to interpret.</p></details>

**Review evidence:** arrival method, generator-lag report, full outcome counts, latency distributions, and bounded-queue behavior. Reuse Sessions 08 and 12's lifecycle model.

**Targeted reading:** [wrk2 repository](https://github.com/giltene/wrk2) for constant-throughput load generation and coordinated-omission discussion; [HdrHistogram repository](https://github.com/HdrHistogram/HdrHistogram) for histogram concepts. Check platform support before choosing a local tool.

## 20 — Validate numerical buffers at the language boundary

### Observable goals

- Specify dtype, shape, stride, ownership, and mutation policy.
- Compare batching with equivalent NumPy work including conversion.
- Keep detached native computation independent of Python object access.

### Predict and inspect

A NumPy matrix is sliced with every other column. Does its logical shape imply contiguous storage? Can you safely reinterpret its data as one contiguous Rust slice?

### Worked reasoning

Shape describes logical indices; strides describe how those indices reach storage. A strided view may require stride-aware access, an explicit contiguous copy, or a clear rejection. Document which path the API takes. Read-only access through one wrapper does not by itself justify assumptions about every possible external alias; follow the pinned binding library's borrowing and thread-safety guarantees. Keep output ownership explicit when returning arrays to Python.

### Practice studio

1. **Reproduce:** expose a batched scorer and compare it with a vectorized NumPy reference.
2. **Change:** test contiguous, transposed, strided, empty, wrong-dtype, and wrong-shape inputs according to your contract.
3. **Transfer:** measure conversion, compute, and return costs for each supported layout; compare one-row calls with batch calls.

<details><summary>Hint — make copies observable</summary><p>State when an input copy occurs and include it in end-to-end timing. Do not label an interface zero-copy based only on one favorable contiguous input.</p></details>

**Review evidence:** boundary contract, Python differential tests, copy policy, and complete-cost benchmark. Review Sessions 11, 15, and 16 for attachment, layout, and thread-pool interactions.

**Targeted reading:** [rust-numpy documentation](https://docs.rs/numpy/latest/numpy/), follow array and readonly APIs for your version; [PyO3 performance](https://pyo3.rs/main/performance).

## 21 — Review compiler tuning and unsafe code as engineering changes

### Observable goals

- Compare profile changes on training and held-out workloads.
- Explain target compatibility and build reproducibility.
- Write and test a safety argument for any unsafe boundary.

### Predict and inspect

PGO improves the dataset used to collect its profile. Is that sufficient evidence for production? If Miri passes your tests, have you proved all unsafe executions valid?

### Worked reasoning

Profile-guided optimization reflects the exercised workload. Keep a separate evaluation workload and report profile-generation and instrumented-build steps. CPU-specific flags can restrict deployment compatibility. Miri can find classes of undefined behavior on executed paths, but passing tests is not a universal proof. Unsafe code still needs invariants covering pointer validity, alignment, bounds, aliasing, initialization, and lifetime as applicable.

### Practice studio

1. **Reproduce:** compare default release with one profile change, retaining correctness tests and build metadata.
2. **Change:** optionally perform PGO using representative training data and a held-out workload; record toolchain compatibility and profile warnings.
3. **Transfer:** review an unsafe optimization proposal. Reject it if the safe implementation is sufficient or the safety argument cannot be established. If retained, run suitable tests under Miri on a compatible toolchain.

<details><summary>Hint — separate the claims</summary><p>Safety, speed, portability, and maintainability each require evidence. A performance gain cannot compensate for an invalid pointer precondition.</p></details>

**Review evidence:** profile comparison, held-out results, target policy, and either a documented safe choice or a precise safety argument. Review Session 17's fallback policy.

**Targeted reading:** [Cargo profiles](https://doc.rust-lang.org/cargo/reference/profiles.html); [rustc PGO](https://doc.rust-lang.org/rustc/profile-guided-optimization.html); [Miri repository and limitations](https://github.com/rust-lang/miri).

## 22 — Compare optimizers by time to a validated target

### Observable goals

- Derive and numerically check a small objective's gradient.
- Separate iteration throughput from solution quality.
- Compare sequential and parallel evaluation reproducibly.

### Predict and inspect

Optimizer A runs 1,000 iterations per second and reaches the target in 5,000 iterations. B runs 600 per second and reaches it in 1,200. Which reaches the target first, ignoring setup? What if one violates the gradient contract?

### Worked reasoning

The simplified times are 5 and 2 seconds respectively; throughput alone picks the wrong winner. For ridge regression define `J(w)=||Xw-y||²/(2n)+λ||w||²/2`, so `∇J=Xᵀ(Xw-y)/n+λw`. State whether an intercept is regularized. Check a small `f64` fixture with central differences `(J(w+h e_i)-J(w-h e_i))/(2h)` over several sensible step sizes; very small steps can amplify rounding. A correct fast implementation and a correct optimization algorithm are separate obligations.

### Practice studio

1. **Reproduce:** implement objective and gradient; compare analytical and finite-difference gradients on a tiny fixed dataset.
2. **Change:** add a stopping rule, iteration cap, non-finite detection, and a reproducible initial state.
3. **Transfer:** compare sequential/Rayon population evaluation and Python/Rust execution using the same objective, seeds, budget, and quality target. Report setup-inclusive time to target and failures across several seeds.

<details><summary>Hint — retain an independent reference</summary><p>Use a small NumPy calculation as an oracle and check both objective and gradient. Do not silently change regularization scaling between implementations.</p></details>

**Review evidence:** derivation, gradient-error table, convergence traces, time-to-target distribution, complete boundary costs, and limitations. Integrate Sessions 13, 16, and 20. A synthetic ridge benchmark does not establish gains on LLM training.

**Targeted reading:** [argmin documentation](https://docs.rs/argmin/latest/argmin/) for solver interfaces; [SciPy check_grad](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.check_grad.html) for an independent gradient-checking reference. The central-difference exercise above is a separate explicit method.
