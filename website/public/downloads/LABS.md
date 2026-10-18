# Lab workbook

All data is synthetic. A lab submission includes code, tests, a command to reproduce results, and a short design note. Only foundation exercises 01–03 have supplied starter/reference implementations; Labs A–F are implementation assignments guided by these contracts.

## Foundation exercises — modules 01–03

Work in `practice/src/lib.rs`. Run one named exercise suite at a time. The reference implementation is in `practice/src/solutions.rs`.

### Exercise 01: latency summary

Implement `mean_latency(values: &[u64]) -> Option<f64>`.

- Empty input returns `None`.
- Values are nonnegative milliseconds; nonempty input returns an approximate arithmetic mean.
- Do not overflow a `u64` sum for large inputs.
- Do not mutate or copy the input into a new collection.

Examples: `[] -> None`; `[100, 200, 300] -> Some(200.0)`; `[0] -> Some(0.0)`.

Stretch: implement p95 with an explicitly chosen definition. For nearest-rank p95 on a nonempty sorted sample of n values, use rank `ceil(0.95*n)` with one-based indexing. Explain why a streaming exact percentile has different memory requirements from a streaming mean.

### Exercise 02: borrowed prompt selection

Implement `first_nonempty(values: &[String]) -> Option<&str>`.

- Inspect entries in order and trim surrounding whitespace using Rust's `str::trim` semantics.
- Return a borrowed view of the first nonempty result.
- Return `None` when all entries are blank or input is empty.
- Do not allocate an output string or mutate the source.

Example: `[" ", "  retrieve  ", "answer"] -> Some("retrieve")`.

Stretch: draw owner/reference lifetimes and show an intentionally noncompiling attempt to return a reference into a local `String`.

### Exercise 03: validated token budget

Implement `validate_budget(requested: u64, limit: u64) -> Result<(), BudgetError>`.

- A zero limit always yields `ZeroLimit`, even when requested is zero.
- Otherwise requested above limit yields `Exceeded { requested, limit }`.
- Equality and zero requested with positive limit are valid.

Stretch: introduce a `TokenBudget` type with a private field and a validating constructor. Explain whether allowing zero requested is suitable for your eventual HTTP contract; different layers can intentionally use different constraints.

## Lab A — AI telemetry analyzer

**Modules:** 02–03. **Budget:** four to six hours, included in module allocations.

Start with this simplified CSV-like format, avoiding a serialization dependency initially:

```text
request_id,latency_ms,status
r1,120,ok
r2,800,timeout
r3,240,ok
r4,invalid,ok
```

This format has no quoting or embedded commas; it is not a general CSV parser. Later use an established parser if broadening the format.

**Build:** a CLI that skips the exact header, classifies rows, and prints total valid requests, success count, timeout count, invalid count, and mean latency of successful requests. Unknown statuses and missing/extra fields are invalid. IDs must be nonempty. Reject negative or nonnumeric latency.

**Expected report for the fixture:** valid=3, success=2, timeout=1, invalid=1, successful mean=180 ms. Empty valid input yields no mean, not zero.

**Acceptance:** no panic on malformed rows; correct boundary handling; typed status enum; parsing separate from aggregation; tests for header-only input and malformed rows. Record why the parser borrows or owns each field.

**Hint:** start with a pure `parse_row(&str)` function and an enum for status. Handle row errors at the caller so one bad row does not end the run.

## Lab B — Retrieval core without document copies

**Module:** 04. **Budget:** four hours.

Create three documents:

| ID | Text |
|---|---|
| a | rust agent gateway |
| b | python model training |
| c | rust model serving |

**Scoring contract:** split query and text on ASCII whitespace, lowercase ASCII letters, deduplicate tokens within each side, and score by the number of distinct overlapping tokens. Punctuation remains part of a token. For query `rust model`, scores are a=1, b=1, c=2. Return top two as c then a; break score ties by ascending ID. Empty query returns an empty result. `k=0` returns empty. `k` above collection size returns all candidates for a nonempty query, including zero-score candidates. Reject duplicate document IDs at construction.

**Build:** `Document`, `Scorer`, and a ranking function returning document references and scores. Avoid cloning document text. Explain allocation in normalization and score metadata.

**Acceptance:** deterministic ties; explicit lifetime relationship; tests for repeated query terms, case normalization, empty collections, and zero matches. If generalizing to floating-point scorers, define a nonfinite-score policy before sorting.

**Hint:** first write a plain loop; optimize only after verifying the contract. This scorer is a teaching baseline, not semantic retrieval.

## Lab C — Bounded JSONL ingestion

**Modules:** 05–06. **Budget:** six to eight hours.

Input schema:

```json
{"id":"doc-001","text":"A synthetic drilling report."}
```

Each nonblank line must be a JSON object with nonempty trimmed `id` and `text`. Unknown fields are allowed and ignored. Blank lines count as skipped. Duplicates are allowed in the base lab so no global ID set is needed. Report duplicate policy explicitly.

**Build:** incremental reader, parser, validator, and character-boundary chunker. Default maximum line size is 64 KiB of bytes excluding newline; default chunks contain at most 256 Unicode scalar values, without overlap. This is character chunking, not model tokenization. Keep total counters and only the first ten error summaries, including line number and category. Do not retain full text in errors.

**Acceptance:** output chunks reconstruct the trimmed text exactly; valid UTF-8 is preserved; malformed JSON does not halt later records; oversized lines are discarded up to the next newline without unbounded buffering. Reject invalid UTF-8 with a clear policy. Test a last line without newline, CRLF, giant records, and Unicode.

**Measurement:** generate increasing input sizes and verify that retained application data does not grow with total file length. Report the distinction between application buffering and OS/file-cache behavior.

**Extension:** add a fixed worker pool and bounded batches. Show equivalent output summaries, propagated worker failures, and an explicit ordering policy. Avoid unlimited per-record task creation.

**Hint:** a size check after an unbounded line read is too late to enforce a hard buffer bound.

## Lab D — Bounded asynchronous tool executor

**Modules:** 07–08. **Budget:** eight hours across the two modules.

Represent synthetic jobs as ID, delay, outcome, and absolute deadline. Outcomes are success, retryable error, and permanent error. No real network calls are needed.

**Build in order:** serial executor; bounded concurrent execution; bounded queue; queue-aware deadlines; cancellation; shutdown. Configure four active jobs and eight queued jobs. A full queue rejects immediately. Use completion-order output and preserve IDs. Maximum active work must remain four.

**Retry contract:** at most two attempts total for explicitly retryable synthetic jobs, with a fixed testable backoff and sufficient remaining deadline. Permanent failures never retry. These mocks have no side effects; adding real tools requires a separate idempotency policy.

**Acceptance scenarios:**

1. With controlled job start barriers, four active and eight queued jobs are accepted; the next is rejected.
2. An expired queued job never invokes the worker.
3. A never-finishing job reaches its deadline and releases capacity.
4. Caller cancellation does not leave detached work running indefinitely.
5. Retry counts and deadline consumption match the contract.
6. Shutdown rejects new work, reports discarded queued jobs, and drains active work for a defined grace period.

Use barriers/notifications and controlled time instead of fragile short real-time sleeps. Track active count and maximum observed count. Return success, failure, rejected, or cancelled for every submitted ID.

**Hint:** bound admission before creating work that can accumulate. A semaphore around an unlimited number of spawned tasks only limits one part of the resource problem.

## Lab E — Inference gateway

**Modules:** 09–10. **Budget:** eight hours.

Use a local mock upstream first. Implement a small course API:

```json
{"model":"mock-model","prompt":"Summarize this synthetic report","max_output_tokens":128}
```

**Contract:** `POST /generate`; JSON body at most 64 KiB; nonempty trimmed prompt; model from a configured allowlist; output budget 1–4096. Return a byte stream from a documented mock protocol. This does not claim full OpenAI API or MCP compatibility.

**Build:** reusable HTTP client, explicit error responses, bounded admission, queue-aware deadline, request IDs, streaming forwarding, and shutdown. Upstream URL comes from configuration, not an arbitrary caller-supplied URL. Keep permits alive for the complete streamed body.

**Acceptance:** validation, overload, pre-header timeout, upstream rejection, partial-body failure, fragmented event boundaries, downstream disconnect, and shutdown are tested. For mid-body failure, terminate and record a correlated stream error; never pretend to replace the already-sent HTTP status. Disable retries after forwarding bytes.

**Observability:** report queue wait, time to upstream headers, time to first forwarded content, total stream duration, final outcome, and active count. Do not log prompt text by default.

**Hint:** do not materialize the entire upstream response before returning it. Test that first content reaches the client while the upstream is still producing later content.

## Lab F — Python extension with honest measurement

**Module:** 11. **Budget:** four to six hours.

**Operation:** normalize a list of IDs. Strip only ASCII spaces from each end, change ASCII A–Z to a–z, preserve internal characters, order, duplicates, and empty strings. Non-ASCII characters remain unchanged. Input elements must be Python strings; reject other values with an exception.

**Build:** pure Rust core, PyO3 wrapper, and Maturin packaging in a separate package/virtual environment. Implement an identical Python baseline. Use the current official guide for the installed API version.

**Acceptance:** parity on empty batches, ASCII whitespace distinctions, Unicode, duplicate and invalid inputs; installable wheel; no panic exposed as expected input handling.

**Benchmark:** batches of 1, 100, 10,000, and 100,000 fixed synthetic IDs. Use warm-ups and at least 20 repeated calls per case; report median and p95 with the percentile convention stated. Measure the complete Python call and pure Rust computation separately. Record whether conversion overhead changes the conclusion. A correct report showing no speedup passes.

**Hint:** Python's default `strip()` and Unicode `lower()` do not implement this deliberately narrow contract; use equivalent ASCII rules.
