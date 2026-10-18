# Performance experiment report

Use this for Labs G–P. Submit raw results with the report; do not fill unknown measurements with invented values.

## 1. Decision and workload

- What user-visible or scientific objective are you improving?
- Input sizes, shapes, distributions, seed, and workload arrival model:
- Correctness contract, numerical tolerance, and tie rules:
- Constraints: memory, latency, deployment CPUs, dependency policy:
- Baseline commit and experiment commit:

## 2. Hypothesis and limit

- Profile evidence identifying the bottleneck:
- Proposed mechanism of improvement:
- Approximate upper bound on end-to-end benefit, with assumptions:
- One change under test:

## 3. Environment and method

- OS, native/virtualized environment, CPU, logical CPUs, memory:
- Rust/Python versions, dependency lockfiles, build flags:
- Thread pools, affinity/quota settings, power conditions when controlled:
- Input generator command and seed:
- Benchmark/profiler commands:
- Warm-up, cache policy, repetitions, and timed boundaries:
- What setup/conversion/materialization costs are included or excluded?

## 4. Results

| Case | Version | Median time | Tail metric and sample size | Throughput | Peak memory | Correctness / error |
|---|---|---|---|---|---|---|
| | Baseline | | | | | |
| | Experiment | | | | | |

State uncertainty and variation. Report relative and absolute changes. For services, include offered/admitted/rejected/timed-out/cancelled/unfinished counts. For numerical solvers, include objective evaluations, convergence status, target definition, seeds, and time-to-target. For a kernel, include dimensions, precision, and maximum observed error.

## 5. Interpretation

- Does the result support the proposed mechanism?
- Which datasets regressed or showed no significant change?
- What does the measurement fail to establish?
- Did the implementation change semantics, quality, or portability?
- Decision: adopt, reject, or investigate further; explain why.
- Rollback conditions and the smallest useful follow-up experiment:
