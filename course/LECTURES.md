# Lecture notes: Rust for AI systems

These are original teaching notes. Each module combines explanation, a small worked example or design walkthrough, implementation work, and an oral checkpoint. Source reading supplements the lecture; it does not replace the local assignment. Code fragments without `main` are illustrative fragments unless marked as complete programs.

## 01 — From Python scripts to explicit contracts

**Outcome:** use Cargo, types, functions, expressions, and slices to summarize telemetry. Allow eight hours including the first exercise.

In a Python pipeline, assumptions about a value may live in conventions and runtime checks. Rust asks you to state more of those assumptions in types. A duration represented as `u64` cannot be negative, but its type alone does not tell you whether the unit is milliseconds or seconds. Naming and domain wrappers still matter.

`let` creates an immutable binding by default; `let mut` permits mutation. Shadowing introduces a new binding and can change its type. Blocks evaluate to their final expression when it has no trailing semicolon. An `if` can therefore produce a value.

Complete program:

```rust
fn classify(latency_ms: u64) -> &'static str {
    if latency_ms > 500 { "slow" } else { "normal" }
}

fn main() {
    let latencies = [120_u64, 800, 240];
    for latency in latencies {
        println!("{latency}: {}", classify(latency));
    }
}
```

`&'static str` is suitable here because both results are string literals stored for the program's duration. It would not be suitable for returning a reference to a newly constructed local `String`.

A slice such as `&[u64]` lets a function inspect a contiguous sequence without owning its storage. It accepts borrowed arrays and vectors. For an empty sequence, an average is undefined; `Option<f64>` makes the caller handle that case. Returning zero would confuse no observations with observed zero latency.

**Walkthrough:** design `mean_latency(&[u64]) -> Option<f64>`. Check emptiness first. Convert values before summing to avoid overflowing an integer accumulator. Floating-point conversion sacrifices exactness for very large integers, so define the result as an approximate mean. Do not promise exact accounting with this representation.

**Practice:** implement exercise 01. Then add a maximum-latency function and a slow-request counter with a configurable threshold. Predict boundary results before running.

**Checkpoint:** Why is `None` preferable to `0.0` for empty input? What changes when a semicolon is added to a function's final expression? Does a borrowed slice require a new allocation?

**Read:** [Rust Book: common programming concepts](https://doc.rust-lang.org/book/ch03-00-common-programming-concepts.html); Rustlings variables, functions, primitive types, and control flow.

## 02 — Ownership as a resource contract

**Outcome:** distinguish moving, borrowing, and cloning; choose appropriate string types.

A `String` owns a growable UTF-8 allocation. Assignment normally transfers its ownership. This is different from assigning a Python name to an existing object. After a move, the old Rust binding cannot be used as though it still owns the value.

Intentionally failing fragment:

```rust
let prompt = String::from("summarize this report");
let queued_prompt = prompt;
println!("{prompt}"); // use after move
```

There are several valid repairs with different meanings. Use `&prompt` if the receiver only needs temporary access. Move the string if the receiver should own it. Use `prompt.clone()` when independent ownership and the allocation/copy cost are intentional. Automatically cloning every compiler complaint hides architectural decisions.

`&str` is a borrowed UTF-8 view. `&String` borrows a particular container; `&str` accepts a broader class of text, including slices and literals. Prefer `fn inspect(prompt: &str)` for read-only text. Use `String` when storing or transferring ownership of text. A borrow prevents the owner from being dropped while that reference is used.

Complete program:

```rust
fn label(prompt: &str) -> &str {
    prompt.trim()
}

fn main() {
    let prompt = String::from("  summarize  ");
    let cleaned = label(&prompt);
    println!("{cleaned}");
    println!("original: {prompt}");
}
```

`trim()` returns a view into the original text. The returned borrow cannot outlive the original `String`. UTF-8 also means byte offsets are not necessarily character boundaries; arbitrary byte slicing may panic. A future document chunker must explicitly define byte, character, or tokenizer-based boundaries.

Multiple shared references can coexist. An exclusive mutable reference excludes other conflicting accesses while it is active. The compiler often ends a borrow at its last use, rather than at the end of its enclosing block.

**Practice:** implement exercise 02 without allocating output. Draw which allocation each reference points to. For Lab A, compare passing a whole log record by value against borrowing it for statistics.

**Checkpoint:** Does `move` always copy heap bytes? Why can returning `local_string.as_str()` fail? When is a clone a sensible design?

**Read:** [Rust Book ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html); [Brown ownership](https://rust-book.cs.brown.edu/ch04-00-understanding-ownership.html); Rustlings move semantics and strings.

## 03 — Model agent state and failure explicitly

**Outcome:** use structs for product types, enums for alternatives, and Result for expected failures.

An agent execution can be pending, running, succeeded, or failed. Representing it with several independent booleans permits contradictory states. An enum restricts the available shapes:

```rust
enum Execution {
    Pending,
    Running { attempt: u32 },
    Succeeded { output: String },
    Failed { message: String, retryable: bool },
}
```

This prevents some invalid combinations but does not enforce a legal transition history. A transition function must still reject success-to-running or retry after a nonretryable failure.

`Option<T>` means a value may be absent. `Result<T, E>` means an operation succeeds or returns a classified error. Use `match` when branches need different policies. The `?` operator returns early on error, converting compatible errors when needed; it does not decide whether retry is safe.

Worked design: a token request is valid when the configured limit is positive and requested tokens do not exceed it. Make zero-limit configuration failure distinct from an oversized request. Validate configuration first so `(0, 0)` has an unambiguous outcome. Exercise 03 encodes this contract.

Borrowing interacts with pattern matching. Matching an owned enum may move its fields. Matching `&execution` inspects without consuming it. Select based on whether the caller needs the state afterward.

For a server, malformed requests and upstream outages are normal failure paths, not reasons to panic. `unwrap()` can be reasonable in a test that establishes its precondition, but request handlers should propagate and classify errors. Never equate memory safety with correct retry or business semantics.

**Practice:** implement exercise 03, then add `advance(state, event) -> Result<Execution, TransitionError>`. Test illegal transitions. Finish Lab A with explicit invalid-row counts.

**Checkpoint:** What can the enum prevent? What requires runtime validation? Why should a timeout not automatically mean a side-effecting operation did nothing?

**Read:** Rust Book enums, pattern matching, and error handling; Rustlings options and errors.

## 04 — Retrieval APIs, lifetimes, traits, and iterators

**Outcome:** build a small retrieval core without unnecessary text copies.

Lifetime annotations describe relationships between references; they do not keep allocations alive or extend their lifetime. If a function returns a selected document borrowed from its input collection, the result must remain tied to that collection.

```rust
struct Document {
    id: String,
    text: String,
}

fn find_document<'a>(docs: &'a [Document], id: &str) -> Option<&'a Document> {
    docs.iter().find(|doc| doc.id == id)
}
```

The result borrows from `docs`, not from `id`. This distinction matters when there are multiple input references. In simple one-reference functions, lifetime elision often expresses the relationship without written annotations.

`iter()` borrows elements; `iter_mut()` borrows them exclusively; `into_iter()` consumes a collection when called on an owned vector. An iterator pipeline is lazy until consumed. `collect()` materializes a result and can allocate. Replacing a loop with iterator syntax alone does not prove a speedup.

A trait defines shared behavior. For Lab B, start with `trait Scorer { fn score(&self, query: &str, doc: &Document) -> f64; }`. Use a generic function for a known scorer type. Investigate `&dyn Scorer` only when runtime substitution is actually needed. Dynamic dispatch and static dispatch are different tools, not a beginner ranking of good and bad.

Separate a pure ranking function from file loading and network calls. This makes edge cases cheap to test. Define deterministic ordering for equal scores and a policy for nonfinite values before using sorting APIs.

**Practice:** Lab B. Add a scorer that uses simple token overlap; it is an educational baseline, not a claim of semantic retrieval quality. Return references to documents and store only score/index metadata during ranking.

**Checkpoint:** Can annotations make a local temporary safe to return? Which iterator consumes the document collection? What must change if results need to outlive that collection?

**Read:** Rust Book generics/traits/lifetimes, closures/iterators, and modules. Use Comprehensive Rust as a concise second explanation.

## 05 — Data ingestion with predictable memory

**Outcome:** process JSONL records incrementally and report actionable errors.

Deserializing a record gives you a structural type; it does not validate all business rules. A string ID may still be empty, a duration may use the wrong unit, and duplicated IDs may violate your downstream contract. Keep parsing and validation separate so errors identify the failed stage.

Use Serde for typed records and serde_json for JSON. With `BufRead`, read a line, enforce a size policy, parse it, validate it, update a summary or send it downstream, then release its storage. Loading the entire file into a vector defeats the bounded-memory objective.

Memory is not automatically bounded merely because you iterate over lines. A single enormous line can grow a buffer; a deduplication set grows with unique IDs; retaining error messages grows with error count. Lab C therefore requires a line-size limit and capped error samples. If the input is untrusted, enforce the byte cap while reading rather than only checking after an unbounded `read_line`.

Walkthrough: define `Record { id, text }`, `ValidatedRecord`, and errors containing line number plus category. Keep the first ten error summaries and a total error counter. Store no source text in routine error logs. Decide whether unknown JSON fields are acceptable; schema evolution and strictness have different costs.

For chunking, start with Unicode character boundaries. A character count is not a token count, so name the parameter accordingly. Later, a model-specific tokenizer can replace it behind a clear interface.

**Practice:** Lab C with valid, malformed, oversized, empty, and Unicode records. Compare maximum resident memory across increasing input sizes using the same OS measurement method.

**Checkpoint:** Which structures can grow with file length? Why is schema deserialization insufficient validation? Can a chunk split a UTF-8 code point?

**Read:** [Serde](https://serde.rs/), [serde_json](https://docs.rs/serde_json/), [BufRead](https://doc.rust-lang.org/std/io/trait.BufRead.html).

## 06 — CPU concurrency and shared ownership

**Outcome:** distinguish work parallelism, shared ownership, and synchronized mutation.

Threads can execute CPU work in parallel. Ownership transfer into a thread prevents the parent from casually reusing transferred data. Shared immutable data can use `Arc<T>`, an atomically reference-counted owner. Cloning an Arc clones a handle and increments its count; it does not deeply clone T. Arc alone does not make arbitrary mutation safe.

Use `Mutex<T>` when protecting shared mutable state. Hold the lock for the smallest meaningful operation. A common ingestion design gives each worker its own partial statistics, then combines results; this can avoid a global lock for each record.

Worked design: one reader produces bounded batches, a fixed number of workers transforms them, and an aggregator merges summaries. If output order matters, attach sequence numbers and explicitly bound the reorder buffer. An unbounded reorder buffer can eliminate the memory advantage of a bounded input queue.

Measure first with one worker. More threads may lose to serialization, I/O, allocation overhead, or memory bandwidth. Native Python numerical libraries may already use optimized multithreaded kernels, so compare against the actual baseline, not a deliberately slow substitute.

CPU work should not occupy an async executor thread for long periods. Later, use an appropriate bounded CPU pool or blocking bridge. A blocking bridge also needs a concurrency policy; moving unlimited work to it does not solve overload.

**Practice:** extend Lab C with a fixed worker count. Keep output equal to the serial version. Test a worker failure without silently losing a batch. Write down whether your ordering and failure requirements justify the complexity.

**Checkpoint:** What does Arc guarantee? When is a mutex still required? What happens when the producer is permanently faster than workers?

**Read:** Rust Book concurrency and shared-state chapters; Comprehensive Rust concurrency. Consult [Rayon](https://docs.rs/rayon/) later for data parallelism.

## 07 — Async Rust for tool and inference I/O

**Outcome:** explain futures and task ownership, and run independent I/O concurrently.

An async function creates a future describing work. That future needs polling to make progress. Calling an async function without awaiting or scheduling it does not mean the operation has completed. Awaiting two independent operations sequentially can leave concurrency unused.

Tokio schedules tasks that should yield while waiting for I/O. This is useful for many network requests; it does not automatically accelerate a CPU-heavy tokenizer. A task spawned with Tokio typically requires owned or otherwise suitably long-lived data. The `'static` requirement does not mean a task must run forever; it means its captured data cannot contain unsuitable short-lived references.

```rust
// Illustrative fragment inside a Tokio async context.
let endpoint = String::from("local-mock");
let handle = tokio::spawn(async move {
    tokio::time::sleep(std::time::Duration::from_millis(20)).await;
    endpoint.len()
});
let length = handle.await?;
```

`async move` transfers captures into the future. Awaiting a JoinHandle can reveal task failure separately from the operation's own returned error. If a task returns `Result`, distinguish both layers. Dropping a JoinHandle generally detaches the task; it is not a reliable cancellation policy.

Walkthrough: create ten synthetic tool calls with varied delays. Start with serial execution, then a bounded concurrent executor. Record start/end times and output IDs. Decide whether results are returned in input order or completion order.

**Practice:** Lab D phase one. Use synthetic sleeps and errors so no API keys or network variability are involved. Read the Mini-Redis shared-state and channels code as examples of ownership boundaries.

**Checkpoint:** Does constructing a future run it to completion? Why can `tokio::spawn` reject a borrow that a direct `.await` accepts? Why must task join failures be handled?

**Read:** [Tokio tutorial](https://tokio.rs/tokio/tutorial): spawning, shared state, channels; [Mini-Redis](https://github.com/tokio-rs/mini-redis).

## 08 — Backpressure, deadlines, cancellation, and retries

**Outcome:** enforce resource limits and define failure behavior.

A semaphore bounds active operations. It does not by itself bound queued callers, allocated task objects, request bodies, or waiting time. A robust executor defines admission capacity, active capacity, queue capacity, queue timeout, and end-to-end deadline separately.

Walkthrough: choose four active jobs and eight queued jobs. Admit jobs through a bounded channel. Reject when full according to a documented policy. Each admitted job carries an absolute deadline that includes queue time. Before starting work, calculate the remaining budget; expired jobs must not consume an upstream attempt.

Acquire capacity before starting expensive work, and keep the permit owned by the scope that performs it. Ensure the permit drops on success, error, cancellation, and panic unwind. Tests should observe available capacity after every path, rather than merely checking returned error strings.

Cancellation is cooperative and operation-specific. Dropping a future may stop local polling but cannot undo a request already accepted by a remote tool. A timeout around a JoinHandle also does not automatically stop its underlying task. Retain control over spawned tasks, abort where appropriate, and await their termination; account for blocking work that cannot be interrupted that way.

Retries need a classified error, attempt bound, remaining time budget, and side-effect policy. Never retry an unsafe side effect merely because a timeout occurred. Even an inference retry after streaming begins can duplicate or contradict output. This course disables retries once response bytes have been sent.

**Practice:** Lab D phase two. Make the clock controllable in tests. Add queue expiry, caller cancellation, and an upstream that never completes. Show that the service accepts new work afterward.

**Checkpoint:** Can a semaphore coexist with unbounded memory? Does an HTTP timeout prove the remote action failed? What must shutdown do with queued jobs?

**Read:** Tokio channels/select; [graceful shutdown](https://tokio.rs/tokio/topics/shutdown); [Semaphore](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html).

## 09 — HTTP service boundaries for AI

**Outcome:** implement a narrow, explicit gateway contract with Axum.

Your FastAPI experience transfers to routes, request validation, dependency/state injection, and HTTP semantics. Rust adds compile-time type and ownership constraints around those boundaries. Keep handlers thin: decode, validate, invoke application logic, then map the result to a response.

For the learning gateway, define a small local API rather than claiming full compatibility with an existing inference API. `POST /generate` accepts a model name, prompt, and output-token budget. Validate body size and budget before acquiring scarce upstream capacity. Use one reusable outbound HTTP client so connection pooling can work across requests.

Application state may own shared configuration, the client, and concurrency controls through Arc or cloneable handles. Mutable per-request data belongs to that request. A mutex around the entire upstream call would serialize requests and hold a lock over slow I/O.

Walkthrough: route `GET /health/live` to process liveness. Route `GET /health/ready` to admission readiness as defined by your service. A brief queue being full need not imply the process should restart. Document whether readiness includes upstream health and how its check is cached.

Define an error mapping: malformed input 400, invalid semantic values 422, body too large 413, admission overload 429, upstream failure 502, and exhausted deadline 504. These are course design choices; implement and test one consistent contract. Errors should include a stable category and request ID, not raw secrets or provider internals.

**Practice:** Lab E phase one against a local mock service. Test the wire contract as well as the internal function. Define whether unknown fields are rejected. Bound response buffering too.

**Checkpoint:** Which work happens before admission? Why reuse the outbound client? Why are readiness and liveness different?

**Read:** [Axum documentation](https://docs.rs/axum/latest/axum/), [official examples](https://github.com/tokio-rs/axum/tree/main/examples), Zero to Production companion code for service organization.

## 10 — Streaming and observable failure

**Outcome:** forward a stream incrementally and diagnose partial failures.

HTTP transport chunks are arbitrary byte fragments. An SSE event or a JSON value may span multiple chunks. A gateway can either transparently forward bytes or parse events using a proper incremental decoder. Do not assume each received chunk is a complete token event.

Once response headers and body bytes have been sent, the server cannot replace them with a fresh 502 response. Decide the wire contract for mid-stream failure: for this course, terminate the stream and emit a correlated failure event to telemetry. If you add application-level SSE error events, specify that extension to clients explicitly.

Hold the upstream concurrency permit until the response body finishes or is dropped, not just until response headers arrive. Otherwise, the number of active generations can exceed the configured limit. A downstream disconnect should release local resources and close the upstream response; this still does not prove remote GPU computation stops immediately.

Trace queue wait, upstream connection/headers, time to first forwarded content, stream completion, and error category separately. A request may succeed at the HTTP status level but fail during its body. Logs should capture this distinction without recording prompts by default.

Walkthrough: use a mock stream split across strange byte boundaries, then a stream that fails after its third event. Verify the client receives initial content before upstream completion. During shutdown, stop admission, give active streams a grace period, and terminate remaining work according to policy.

**Practice:** Lab E phase two. Measure peak memory for large streams, demonstrate permit recovery on disconnect, and test shutdown with an active request.

**Checkpoint:** When can HTTP status still change? How long should a permit live? Why is one timestamp insufficient for latency diagnosis?

**Read:** Axum streaming examples; [tracing](https://docs.rs/tracing/); Tokio shutdown guidance.

## 11 — Rust as a Python component

**Outcome:** expose a useful native function and measure its complete cost.

PyO3 supports Python extension modules written in Rust. Maturin builds and packages them. This enables incremental adoption: retain Python orchestration and move a specific measured operation behind a small interface.

Start with a pure Rust implementation with a precise contract. Then expose a function accepting batches, validate boundary inputs, and map expected failures to Python exceptions. Use the installed PyO3 guide for current module and function syntax. Concurrency and interpreter interaction depend on Python build and PyO3 version; never assume code can access Python objects after releasing interpreter coordination.

Worked design: normalize a batch of document IDs with an ASCII-only rule, preserving order and duplicates. Specify exactly which whitespace and case transformations are allowed. The Python baseline must follow the same rule. A broader Unicode baseline is a different computation and an unfair comparison.

The total runtime includes conversion from Python objects, native work, conversion back, and packaging of results. For small inputs the boundary can dominate. Prefer batch APIs where appropriate. If using numerical arrays later, study ownership, strides, dtype validation, and copy behavior rather than assuming zero-copy interoperability.

Measure tiny, medium, and large batches. Report median and tail measurements over repeated runs, correctness parity, and peak memory. A slower result is useful evidence: you may need a different boundary or should retain the Python implementation.

**Practice:** Lab F. Build in release mode, record wheel/toolchain versions, and demonstrate a clean virtual-environment install.

**Checkpoint:** Why can a faster inner function produce a slower Python API? What does batching change? What responsibilities remain at the language boundary?

**Read:** [PyO3 guide](https://pyo3.rs/), [Maturin guide](https://www.maturin.rs/).

## 12 — Architecture review and measured adoption

**Outcome:** integrate the gateway and defend the design with evidence.

Bring together typed validation, bounded load, stream ownership, explicit errors, and telemetry. Keep the system small enough that you can explain every queue and task. Rust's type system cannot prove service availability, correct tenant isolation, suitable retry policies, or retrieval quality.

Your capstone is a local learning service that fronts a deterministic mock and optionally an existing local inference endpoint. It is not a replacement model runtime. If remote GPU compute dominates end-to-end latency, lower gateway overhead may barely change user latency; memory and overload behavior may still matter.

Write a short architecture decision record. State the workload, why Rust is being considered, alternatives, measured evidence, and cost of maintaining another language. Explain where Python remains: research loops, model experimentation, or agent orchestration where its libraries are useful.

Benchmark the service at below-capacity, near-capacity, and overload workloads. Record offered, accepted, rejected, successful, failed, and unfinished requests. Compute latency over clearly identified populations; reporting only fast successful requests can conceal overload failures. Show throughput and errors alongside latency.

**Practice:** complete the capstone brief. Reproduce all failure scenarios before increasing features. Present a five-minute walkthrough using one request from admission to body teardown.

**Checkpoint:** Which invariants are compile-time enforced? Which are tested? Which remain assumptions? What evidence would make you reject a Rust rewrite?

**Read:** revisit selected Tokio/Axum sources and your own decision log. No new framework is required to finish.
