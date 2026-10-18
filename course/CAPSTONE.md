# Capstone: a bounded AI service gateway

## Problem and scope

An inference endpoint is shared by multiple callers. Unrestricted concurrency creates unpredictable queues and resource consumption. Build a local gateway that validates requests, controls admission, forwards streamed responses, and explains failures through telemetry.

Use synthetic requests and a deterministic mock upstream. Connecting to an existing local inference server is optional and requires adapting its actual request/stream protocol. The deliverable is a learning prototype, not a production certification.

## Architecture

```text
Client
  -> HTTP validation and request ID
  -> bounded admission queue with absolute deadline
  -> limited active upstream requests
  -> reusable HTTP client -> mock or local inference server
  <- streamed bytes with body-lifetime capacity ownership
  -> structured completion/failure telemetry
```

Every queue must have a capacity and every task an owner responsible for shutdown. Preserve one end-to-end deadline across queueing and upstream work. Do not hold a global state lock over network I/O.

## Milestones

1. **Contract:** copy Lab E's local API into a README; define validation and error mapping. Add fixture requests and expected wire responses.
2. **Core service:** route validation, configuration, request IDs, mock upstream, and a shared outbound client. Keep parsing separate from execution policy.
3. **Capacity:** bounded queue, active cap, queue expiry, overload rejection, and capacity counters. Demonstrate the limits using controlled barriers.
4. **Streaming:** incremental forwarding, fragmented chunks, downstream disconnect, and mid-stream failure. Keep capacity occupied until the body finishes or drops.
5. **Lifecycle:** stop admission and drain active work within a configurable grace period. Define the fate of queued and unfinished jobs.
6. **Evidence:** correctness suite, repeatable load script, results table, and a two-page architecture decision record.

## Required failure demonstrations

| Scenario | Required observation |
|---|---|
| Invalid request | No upstream request is started |
| Queue at capacity | New request rejected according to API contract |
| Deadline expires in queue | Job never begins upstream work |
| Upstream stalls before headers | Deadline error and recovered capacity |
| Upstream fails mid-body | Stream terminates; final telemetry records failure |
| Client disconnects | Local work/resources released; upstream cancellation limitations documented |
| Shutdown during a stream | No new admission; drain/termination follows configured policy |
| Worker/task fails | Failure visible; service can accept later requests |

## Load experiment

Use fixed upstream response size/delay, a stated load-generation model, and fixed machine configuration. Test below capacity, near capacity, and sustained overload. Run at least five repetitions per case and retain raw results.

Report offered, admitted, rejected, successful, failed, cancelled, and unfinished counts. Define denominator and timing boundaries. Report throughput, success latency p50/p95, time to first content, queue wait, and peak process memory. Treat rejected/failed work explicitly rather than hiding it from a latency chart. Compare versions only under identical workloads.

No speedup target is required. A credible explanation of the bottleneck is more valuable than a misleading percentage. If comparing FastAPI and Rust, use the same upstream, concurrency policy, streaming behavior, and client workload.

## Submission checklist

- A clean checkout can be set up from documented commands.
- Tests run without paid APIs, GPU availability, or client data.
- Configuration, dependency versions, and application lockfile are recorded.
- Each acceptance scenario has a test or reproducible demonstration.
- Telemetry distinguishes HTTP response start from stream completion.
- Decision record covers why Rust, why these boundaries, costs, alternatives, and remaining risks.
- A five-minute demo follows one request through validation, queue, upstream, and teardown.

## Review questions

Where can memory still grow? Who owns the request body, task, permit, and response stream? What remains running after the caller leaves? Which errors can be retried safely? Which facts are guaranteed by types, by tests, or only by assumptions? Which component would you keep in Python, and why?
