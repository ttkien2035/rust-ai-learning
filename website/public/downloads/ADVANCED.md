# Advanced Rust: optimization for AI workloads

Ten additional sessions, approximately **100 hours**, after the 96-hour core. Work at your own pace; each session budgets roughly two hours of study, five hours of implementation, two hours of measurement, and one hour of review. This is an advanced training track, not a collection of promised speedups. All workloads are synthetic and local; no model API is required.

Prerequisite: explain ownership, Result, traits, bounded concurrency, and the core gateway's lifecycle. Sessions 13–18 emphasize CPU/data work; 19 focuses on serving; 20 on Python; 21 on code generation and unsafe boundaries; 22 on numerical optimization. Keep the original core capstone as a baseline and preserve raw benchmark results.

## 13 — Profiling, experimental design, and performance budgets

**Outcome:** locate a real bottleneck and design a reproducible experiment before changing code.

Performance is a property of a workload and an environment. “Rust is faster” is not an experiment. For a RAG ingestion service, separate parsing, normalization, chunking, serialization, and I/O. Define the objective first: records/second at a memory cap, milliseconds/request at a stated arrival rate, or objective evaluations/second. A faster microkernel can have negligible effect on the full pipeline.

Amdahl's law helps bound expectations. If a component consumes 30% of total execution time and becomes twice as fast, ideal total speedup is `1 / (0.7 + 0.3 / 2)`, about 1.18×, before new overhead. This is a planning model with assumptions, not measured evidence. Use a CPU profile to find hot paths and a timeline to distinguish CPU work from waiting. A wide flamegraph frame indicates sampled stack presence, not a complete diagnosis of why that function is expensive.

Build optimized code with useful symbols. Start with `[profile.release] debug = "line-tables-only"`. Select a profiler that supports your actual OS: the Performance Book lists samply and platform tools, while Linux perf requires a Linux environment. WSL measurements describe the WSL workload, not automatically native Windows performance. Record virtualization and CPU power conditions.

Use Criterion for repeated microbenchmarks and a separate harness for service-level measurements. Prevent dead-code elimination by consuming outputs; `std::hint::black_box` is a best-effort barrier, not proof of a valid benchmark. Decide whether allocation, input generation, and serialization belong inside the timed region based on the question. Measure setup separately when excluding it. Keep one variable changed at a time; preserve a baseline commit and record uncertainty. A small difference within noise is inconclusive.

### Lab contract — Lab G: a performance investigation

Generate seeded JSONL datasets with 10k, 100k, and 1m records, plus small and large text variants. Profile your core ingestion pipeline and rank three hypotheses by expected impact. Implement one change only. Report throughput, time per record, peak memory, allocation evidence when available, and correctness parity. Run at least five independent process repetitions; distinguish those repetitions from a benchmark framework's internal samples. Include exact commands, input seed, compiler, dependencies, build profile, and hardware. Acceptance requires a reproducible report even if the change is neutral or slower. Do not invent profiler counters that your tool cannot collect.

### Checkpoint

1. How much end-to-end improvement can your hottest component plausibly deliver?
2. Which costs are inside your timed region, and why?
3. What would make you reject a performance result as noise or a benchmark artifact?

### Sources

[Rust Performance Book: profiling](https://nnethercote.github.io/perf-book/profiling.html), [Criterion guide](https://bheisler.github.io/criterion.rs/book/), [std::hint::black_box](https://doc.rust-lang.org/std/hint/fn.black_box.html).

## 14 — Allocation control, borrowing, and buffer reuse

**Outcome:** reduce allocation pressure while keeping ownership and memory retention explicit.

An allocation profile can reveal more than a hot `clone()` call. A pipeline might allocate for deserialization, normalized text, temporary token lists, output formatting, and queues. Count bytes and lifetimes as well as allocation count. One large retained buffer can matter more than thousands of short-lived tiny objects.

Read-only interfaces should borrow when the owner lives long enough. `Cow<'a, str>` can preserve a borrowed value when normalization makes no changes and allocate only when necessary. That benefit depends on input distribution and API boundaries: returning a borrowed field from a reusable input buffer prevents you from mutating that buffer while the borrow remains live. For asynchronous queues, owned records or an explicitly shared backing allocation may be the appropriate tradeoff.

Reuse a `String` or `Vec` by clearing it between records; `clear()` retains capacity. Reuse reduces repeated allocation but can retain an unusually large buffer indefinitely. Define a policy such as keeping ordinary buffers and replacing those above a measured capacity threshold after a large record. `reserve()` is a request for sufficient capacity, not a guarantee of an exact allocation size. Avoid arbitrary worst-case preallocation per worker when multiplying it by the concurrency limit consumes more memory than expected.

Avoid collecting an iterator if a single pass suffices. Replace repeated string concatenation with writing into a reusable output buffer when the profile supports it. Consider inline containers only after observing real length distributions: larger inline storage increases the size of every containing object, including those with no payload. Interning repeated IDs also needs a bounded lifetime; otherwise the interner becomes an unbounded cache.

Worked design: an ingestion worker owns input and output scratch buffers; it parses a record, computes metadata, emits an owned compact result, and releases borrowed views before the next read. The result queue has a byte budget as well as a record cap. Explain exactly where a copy is retained to decouple producer and consumer lifetimes.

### Lab contract — Lab H: an allocation-aware normalizer

Implement a batch normalizer with identical ASCII rules to core Lab F. Compare an allocating baseline, a borrowed/owned representation, and worker-local reusable buffers. Include already-normalized inputs, heavily modified inputs, Unicode, empty records, and a single huge outlier among small records. Verify byte-for-byte parity, report allocations/record when measurable, and measure retained memory after the outlier. Acceptance requires an explicit buffer-retention policy and no references into overwritten storage. A lower allocation count alone does not establish lower end-to-end latency.

### Checkpoint

1. Which owner keeps each borrowed result alive?
2. When does buffer reuse increase retained memory?
3. Does your optimization shift allocation to another stage or thread?

### Sources

[Performance Book: heap allocations](https://nnethercote.github.io/perf-book/heap-allocations.html), [Cow](https://doc.rust-lang.org/std/borrow/enum.Cow.html), [Vec](https://doc.rust-lang.org/std/vec/struct.Vec.html).

## 15 — Data layout, cache locality, and memory bandwidth

**Outcome:** choose representations based on the fields a hot computation actually accesses.

A vector of structs is convenient, but a loop that reads only one field may bring unrelated fields into cache. A struct of arrays can improve locality for column-oriented operations. Neither representation wins universally: if each operation needs the full record, separate arrays may create additional memory streams and complicate invariants.

Consider candidate vectors with ID, score, metadata, and text. The score kernel should not chase strings and metadata when it only needs a dense numeric slice. Keep stable IDs or indices that reconnect numeric results to owned documents. Check dimensions at the boundary, then use a flat contiguous representation with a documented row stride. Make overflow checks part of computing `rows * dimensions` before allocation.

An `f32` value is four bytes, so scanning `n*d` coordinates requires at least `4*n*d` input bytes, before query traffic and metadata. Divide required bytes by measured elapsed time to estimate effective bandwidth. Do not compare it uncritically with a vendor's peak specification. Cache-resident and larger-than-cache datasets are different workloads; include both. Reading an entire dataset repeatedly can hide cold-start or storage costs.

False sharing occurs when threads modify separate variables that occupy the same coherence unit. A global counter can also introduce true contention. First try worker-local counters and reduction before adding padding everywhere. Cache-line assumptions and alignment differ across machines. Adding padding increases memory consumption and may hurt other accesses.

Representation affects numerical behavior too. Changing reduction order or precision changes rounding; specify tolerance instead of assuming bitwise identity. Do not use `repr(packed)` as a shortcut to faster access: unaligned fields require care and a smaller layout may be slower. If external binary layout is required, document that as a separate contract.

### Lab contract — Lab I: candidate scoring layouts

Implement a reference dot-product scan over finite `f32` embeddings, accumulating in `f64`, then compare an array-of-structs and flat row-major storage. Use dimensions 128, 768, and 1536 with data sizes below and above last-level cache where feasible. Preserve IDs, validate dimensions, and include malformed shape tests. Report elapsed time, estimated input bytes/second, and peak memory. Add metadata large enough to test whether separating hot fields matters. Acceptance requires an access-pattern explanation and correct ID mapping; the experiment may show no advantage for one layout.

### Checkpoint

1. Which fields does the hot loop really need?
2. What evidence distinguishes compute limits from memory-bandwidth limits?
3. How would false sharing differ from contention on a shared counter?

### Sources

[Performance Book: types](https://nnethercote.github.io/perf-book/type-sizes.html), [Rust Reference: type layout](https://doc.rust-lang.org/reference/type-layout.html), [slice APIs](https://doc.rust-lang.org/std/primitive.slice.html).

## 16 — Parallel CPU pipelines with Rayon

**Outcome:** improve throughput with controlled parallelism, useful task granularity, and explicit numerical reproducibility.

Rayon provides data-parallel iterators and work-stealing execution. Adding `par_iter()` exposes opportunities for parallelism; it does not remove memory-bandwidth limits, scheduling overhead, or dependencies. Tiny tasks may spend more time scheduling than computing. Larger tasks can improve amortization but increase imbalance when record sizes are skewed.

Divide independent records or candidate blocks into chunks, keep scratch state local to workers, and reduce partial results. A shared mutex around every scored candidate usually defeats this design. For global top-k retrieval, compute local top-k per partition, then merge those bounded results. Every globally top-k candidate must be included in its partition's top-k, assuming the same total ordering and tie rules. This can shrink merge work substantially without changing exact selection semantics.

Control the thread budget across the complete application. Python numerical libraries may have their own native pools, and a Rust extension may create additional workers. Multiple layers of parallelism can oversubscribe cores. Use an explicit pool for the experiment, record its size, and compare one worker through the useful hardware range. A physical core count, logical CPU count, and a container CPU quota are different quantities.

Floating-point reduction order can change between parallel executions. If your contract requires reproducible totals, use fixed partitions and a deterministic merge order or another justified summation strategy; measure its cost. Integer counts still need overflow policy. A panic in one worker must not silently turn into a partial successful result.

Async services require an additional CPU admission limit when invoking these jobs. Rayon is not an inference request queue. Keep CPU work off the async executor and make cancellation semantics explicit: dropping an async wait does not instantly preempt already-running CPU kernels.

### Lab contract — Lab J: parallel exact scoring

Extend Lab I with a custom Rayon pool and partition-local top-k. Test 1, 2, 4, and more workers when hardware permits, both uniform and skewed batch sizes, and tiny versus large datasets. Use the exact tie contract from Lab L. Report speedup relative to the same optimized one-worker implementation, efficiency, memory, and result parity. Cap total work in flight. Acceptance includes a measured break-even batch size and a policy for Python/native pool interactions, not just a best-case chart.

### Checkpoint

1. Why can more workers reduce throughput?
2. How do local top-k results preserve exact global top-k?
3. What numerical reproducibility does your reduction actually guarantee?

### Sources

[Rayon API](https://docs.rs/rayon/latest/rayon/), [Rayon repository](https://github.com/rayon-rs/rayon), [ThreadPoolBuilder](https://docs.rs/rayon/latest/rayon/struct.ThreadPoolBuilder.html).

## 17 — Vectorization, SIMD dispatch, and numeric correctness

**Outcome:** evaluate compiler vectorization before introducing target-specific SIMD.

A straightforward loop over contiguous slices can be optimized by the compiler. Help it by exposing clear bounds and access patterns, then inspect generated code or vectorization diagnostics where your toolchain permits. Fewer source lines or explicit intrinsics do not prove better code generation. Include the runtime dispatch and tail handling in the comparison when they exist in the shipped path.

Start with a scalar reference with explicit precision. For dot products, an `f64` accumulator over `f32` inputs may be more accurate but differ from an `f32` SIMD reduction. Compare equivalent precision where possible; otherwise report both speed and error. Fused multiply-add and reassociation can alter rounding. Record the maximum absolute and relative error on adversarial vectors, not only random positive values. Handle cancellation, zeros, extreme finite magnitudes, and dimension tails.

Runtime CPU-feature detection differs from compiling the whole binary for your own machine. A `target-cpu=native` result is not evidence that a portable distributed binary will perform or even execute identically elsewhere. Isolate target-specific implementations behind architecture guards and runtime feature checks, retaining a scalar fallback. Never execute an AVX2 implementation simply because your development machine supports it.

As checked on 18 October 2026, `std::simd` is still marked nightly-only experimental in official documentation. The required lab can use safe scalar/autovectorized code on stable Rust. A portable-SIMD nightly branch is optional and must record the pinned nightly toolchain; do not quietly make the entire course require nightly.

Worked design: validate matching dimensions once, dispatch to an appropriate kernel, process full lanes, then process the remainder. Explain valid alignment assumptions and avoid out-of-bounds reads. An unsafe intrinsic wrapper requires a written safety argument even when performance is excellent.

### Lab contract — Lab K: vectorized similarity kernel

Compare the scalar reference, an idiomatic stable loop, and one optional SIMD implementation. Test dimensions 1, 3, 7, 128, 769, and 1536, plus mismatched dimensions and the selected nonfinite-input policy. Measure small-call dispatch overhead separately from large-batch throughput. Verify fallback execution and record compiler/CPU features. Acceptance requires bounded error, correct tails, and a portable baseline; no minimum speedup or unsafe code is required.

### Checkpoint

1. What precision and rounding changes did your kernel introduce?
2. Where is CPU-feature support checked before executing specialized code?
3. Does the measured speedup include dispatch, tails, and boundary validation?

### Sources

[std::arch](https://doc.rust-lang.org/std/arch/), [std::simd status](https://doc.rust-lang.org/std/simd/), [Rust Reference: target_feature](https://doc.rust-lang.org/reference/attributes/codegen.html#the-target_feature-attribute).

## 18 — Exact top-k, indexing, and RAG retrieval efficiency

**Outcome:** improve retrieval selection by changing the algorithm before tuning the kernel.

Sorting all `n` candidates costs `O(n log n)` comparisons, while a bounded heap can select top-k in `O(n log k)` time and `O(k)` selection storage. A selection algorithm can partition around rank k, followed by sorting the selected subset. Its complexity and additional costs depend on the chosen implementation. Benchmark the real candidate count and k; a full sort can be competitive for small inputs or large k.

Define a total ordering before coding. For this lab, higher finite scores are better; equal scores prefer lexicographically smaller IDs. Reject duplicate IDs and nonfinite scores. Return results ordered by that rule; zero k returns empty, and k above n returns all. A heap's root must represent the worst retained candidate so a better incoming candidate can replace it. Reversing the wrong comparator is an easy way to get plausible but incorrect results.

Avoid copying document text while selecting. Store indices and scores and resolve selected indices against the original owner. Reuse scratch buffers when repeated queries justify it. Precompute query-independent quantities, such as candidate norms, only if your scoring contract allows it and the update policy maintains consistency.

Exact and approximate retrieval optimize different contracts. An approximate index can trade recall, build time, update cost, and memory for latency. Report recall@k against an exact oracle with explicit tie handling and a held-out query set. A lower latency result is not a fair replacement if retrieval quality changes without being disclosed. Likewise, quantized embeddings change numerical precision and may change ranking.

For RAG, include retrieval-stage boundaries: parsing the query, embedding generation, candidate filtering, scoring, selection, and document materialization. A top-k microbenchmark does not measure LLM latency. Use application traces to decide whether selection is worth further effort.

### Lab contract — Lab L: retrieval selection shootout

Implement full sort as the oracle, a bounded heap, and an index-based partial-selection approach. Test n=1k/100k/1m where memory permits and k=1/10/100/n. Include ties, reverse input order, duplicate IDs, NaN/infinity rejection, empty input, and k=0. Differential tests must return identical IDs and order. Report score-computation time separately from selection and materialization. Acceptance requires an algorithmic argument, memory accounting, and a benchmark matrix rather than one favorable k.

### Checkpoint

1. Which candidate belongs at the root of your heap?
2. What changes when k approaches n?
3. What evidence would make approximate retrieval acceptable for your use case?

### Sources

[BinaryHeap](https://doc.rust-lang.org/std/collections/struct.BinaryHeap.html), [slice selection and sorting](https://doc.rust-lang.org/std/primitive.slice.html), [f32::total_cmp](https://doc.rust-lang.org/std/primitive.f32.html#method.total_cmp).

## 19 — Tail latency, batching, and queue optimization

**Outcome:** improve an AI service's latency distribution without hiding rejected work or violating deadlines.

Throughput and latency interact through queues. Little's law relates average work in a stable system to throughput and average time in the system, but does not predict a p99 latency or guarantee stability under overload. A service at high utilization can accumulate a long queue even when its median processing time looks healthy.

Separate admission wait, batch assembly, CPU preprocessing, upstream generation, and downstream streaming. A bounded queue avoids unlimited growth but still needs an explicit overload response. An active-request semaphore counts requests, not their token budgets or memory footprint. Consider weighted admission when requests have meaningfully different costs; evaluate whether large requests can starve behind short ones or monopolize capacity.

Dynamic batching amortizes fixed costs but adds waiting. A batching policy needs a maximum batch size, maximum batch wait, and per-request deadlines. Expired items should not start work merely to fill a batch. A client disconnect must free local capacity correctly; it does not prove that a remote GPU job stopped. For LLM serving, avoid implementing a second incompatible scheduler in front of an inference engine without evidence.

Use an open-loop load generator with a stated offered arrival rate when studying queue buildup. A closed-loop client that waits for a response before sending the next request can reduce offered load during stalls, concealing the latency experienced under fixed arrivals. Record dropped generator work and generator saturation. Report success latency alongside acceptance, rejection, timeout, cancellation, and unfinished counts.

Allocation and synchronization changes can affect tail behavior even when average throughput barely moves. Measure at below-capacity, near-capacity, and overload rates, then test a burst of large requests. Keep response semantics, upstream delay distributions, and deadlines unchanged across versions.

### Lab contract — Lab M: a latency budget for the gateway

Extend the core mock gateway with optional microbatching for a synthetic preprocessing operation. Compare no batching with bounded batch-size/wait combinations. Use fixed-seed mixed small/large requests and an open-loop arrival schedule. Report queue wait, time to first content, p50/p95/p99 completion latency, throughput, failure counts, and peak memory. Acceptance requires deadline expiry before execution, capacity recovery after cancellation, and an explicit tradeoff recommendation. Do not claim a p99 improvement without stating sample size and measurement boundaries.

### Checkpoint

1. Which wait did batching add to your latency budget?
2. Could your load generator hide stalls or become the bottleneck?
3. How does your admission limit relate to bytes, tokens, and unfinished work?

### Sources

[Tokio tutorial](https://tokio.rs/tokio/tutorial), [Tokio semaphore](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html), [Tokio shutdown](https://tokio.rs/tokio/topics/shutdown).

## 20 — Python–Rust boundary optimization and zero-copy tradeoffs

**Outcome:** optimize the complete Python-facing operation, including conversion and memory ownership.

A native function can spend more time converting inputs than computing. Passing one Python string at a time into Rust pays the language boundary repeatedly. Batch APIs can amortize overhead, but enormous batches increase peak memory and the time before the caller gets a result. Optimize batch size against the caller's latency and memory requirements.

For numeric data, inspect dtype, dimensions, strides, contiguity, alignment, mutability, and ownership. A view into a Python-owned array cannot safely outlive its backing storage. “Zero-copy” at one boundary does not mean the subsequent pipeline avoids allocation or packing. A noncontiguous input may require either stride-aware computation or a documented copy; rejecting it is another legitimate explicit contract.

Keep the Rust kernel independent from Python handles. Validate inputs while using the appropriate interpreter context, acquire or copy suitable native views, then perform work under the installed PyO3 version's supported concurrency rules. Python interpreter coordination and free-threaded builds have version-specific behavior. Do not assume detaching from interpreter coordination permits arbitrary access to Python objects or makes all extension code thread-safe.

Model ownership of outputs explicitly. Returning a newly owned array is often simpler than exposing a view into a reusable scratch buffer. A buffer that is reused before Python finishes reading it can corrupt results or create an unsafe boundary. If an owner object retains the storage, document when it can be mutated and when it is released.

Measure against a realistic NumPy baseline, which may already call optimized native kernels. Record thread counts in both stacks. Compare pure kernel time, conversion time where separable, and the complete call. A Rust loop beating a Python loop does not establish an improvement over a vectorized production implementation.

### Lab contract — Lab N: batched numerical scoring from Python

Expose the Lab I scoring operation through PyO3 using the current Rust NumPy bindings as an optional implementation route. Start with owned inputs if borrowing would obscure correctness. Define supported dtypes and layout; test contiguous, sliced/noncontiguous, empty, malformed-shape, and invalid-dtype inputs. Benchmark batches 1/32/1024/large with an equivalent NumPy baseline and controlled thread counts. Acceptance includes lifetime documentation, clean-environment installation, numerical tolerance tests, full-call measurements, and an explanation of any copy. No claim of universal zero-copy is allowed.

### Checkpoint

1. Who owns the numeric storage while Rust and Python use it?
2. Which input layouts are accepted, copied, or rejected?
3. Does the complete Python call outperform the real production baseline?

### Sources

[PyO3 performance guide](https://pyo3.rs/main/performance), [Rust NumPy bindings](https://github.com/PyO3/rust-numpy), [Maturin guide](https://www.maturin.rs/).

## 21 — Code generation, build profiles, and justified unsafe boundaries

**Outcome:** evaluate compiler settings and low-level changes without sacrificing portability or correctness.

Optimization level is one input to code generation, not a monotonic speed knob. Compare release settings against the actual workload. Link-time optimization, codegen units, inlining, target features, and panic strategy can change runtime, binary size, compile time, and deployment assumptions. Keep a small experimental matrix rather than changing every flag at once.

Inspect code size when introducing many generic instantiations. Monomorphization can eliminate dispatch overhead but also produce more machine code. Trait-object dispatch can reduce duplication at the cost of indirect calls and lost optimization opportunities. Profile whether this tradeoff matters in the hot path. Do not replace a clean trait API merely because one microbenchmark contains a virtual call.

Profile-guided optimization needs representative training traffic and a separate evaluation workload. Overfitting a profile to one synthetic input can regress another. Record training inputs, compiler version, profile generation/merge commands, and fallback behavior when profiles are unavailable. A configuration that depends on CPU instructions unavailable on deployment machines is not a valid portable release.

Unsafe code transfers proof obligations to the author; it does not disable all checks or inherently improve speed. Before using unchecked indexing, identify the measured check and try restructuring safe iteration. If an unsafe helper remains justified, keep its interface small and document pointer validity, alignment, initialized length, aliasing, and lifetime requirements. Differential tests, boundary cases, and Miri can detect some errors but do not prove soundness or validate all hardware intrinsics. Running Miri is a separate optional nightly toolchain task.

Worked design: replace a repeated bounds-checked multidimensional lookup with a validated shape and safe row slices. Compare generated code before considering unchecked access. If the safe representation removes the bottleneck, retain it. A rejected unsafe patch with sound reasoning is a successful review outcome.

### Lab contract — Lab O: an optimization change review

Choose a measured hot function from an earlier lab. Compare baseline release, one build-profile change, and one safe API/layout restructuring. Propose an unsafe variant only if useful; supplying a written rejection is acceptable. Report runtime, compile time, binary size, portability assumptions, correctness tests, and rollback criteria. Acceptance requires a reviewer-readable safety argument for any unsafe code and a held-out workload. Never disable required validation or change output semantics to manufacture a speedup.

### Checkpoint

1. Which deployment assumptions changed with your compiler settings?
2. Can the hot-path issue be removed through a safe representation?
3. What does your test suite fail to establish about an unsafe implementation?

### Sources

[Cargo profiles](https://doc.rust-lang.org/cargo/reference/profiles.html), [rustc PGO](https://doc.rust-lang.org/rustc/profile-guided-optimization.html), [Rustonomicon](https://doc.rust-lang.org/nomicon/), [Miri](https://github.com/rust-lang/miri).

## 22 — Numerical optimization engines and experiment throughput

**Outcome:** optimize a mathematical solver's time-to-quality, not just its loop execution time.

Systems optimization and mathematical optimization interact. A faster objective evaluator increases experiments per second, but a different algorithm may need fewer evaluations to reach the same solution quality. For your ML and evolutionary-algorithm background, compare evaluation throughput, convergence, and the complete wall-clock budget together.

Begin with ridge-regularized least squares: `f(w) = ||Xw - y||² / (2n) + λ||w||² / 2`, for n>0 and λ≥0. Its analytic gradient is `Xᵀ(Xw-y)/n + λw`. Validate shapes and finite inputs, and use finite-difference gradient checks with a stated step and tolerance on small problems. Avoid silently changing sum versus mean scaling: that changes the learning-rate interpretation.

Write a reference gradient-descent solver with maximum iterations, gradient-norm tolerance, finite-value checks, and explicit termination reasons. Select a stable step policy or backtracking line search; an arbitrary learning rate can diverge. If using a library such as argmin for another solver, adapt the same objective and count evaluations consistently. Different stopping conditions do not define an equal-quality comparison.

Reuse residual and gradient buffers and exploit contiguous access before adding threads. Compare parallel matrix/vector work only at useful sizes. For population-based optimization, independent candidate evaluations can be batched or parallelized. Randomness should be derived from a global seed and stable candidate/iteration IDs rather than task completion order; otherwise changing the thread count changes the experiment itself. Store evaluated IDs and objective values so retries do not create ambiguous accounting.

This capstone has two result axes: seconds to a defined objective/gradient target, and solution quality at a fixed wall-clock/evaluation budget. Report failures to converge, variance across seeds, memory, and objective calls. A more approximate kernel that changes ranking or convergence must disclose that tradeoff. Good performance engineering can conclude that an established numerical library is preferable to maintaining a custom kernel.

### Lab contract — Lab P: optimizer throughput capstone

Generate deterministic well-conditioned ridge problems and a synthetic bounded black-box objective for population evaluation. Implement the reference solver, one measured systems optimization, and a controlled parallel population evaluator. Verify gradients, termination, reproducible candidate values across worker counts, and objective parity. Compare with an equivalent Python/NumPy or established solver baseline, documenting algorithm and stopping-rule differences. Submit convergence plots, time-to-target distributions, evaluation counts, memory measurements, and a two-page decision record. Your implementation must report nonconvergence honestly. No paid service or proprietary client dataset is required.

### Checkpoint

1. Did the improvement come from a better algorithm, cheaper evaluations, or a changed accuracy target?
2. Are stopping rules and regularization scaling equivalent across implementations?
3. Can worker scheduling change the random experiment or its reported evaluation count?

### Sources

[argmin documentation](https://docs.rs/argmin/latest/argmin/), [argmin source and examples](https://github.com/argmin-rs/argmin), [Rayon](https://docs.rs/rayon/latest/rayon/), [ndarray](https://docs.rs/ndarray/latest/ndarray/).
