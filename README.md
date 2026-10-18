# Rust for AI Systems Engineers

An English training course for Kien Tran Trung, designed around an experienced Python AI scientist and engineer moving into Rust. Research date: **18 October 2026**.

The starting point is production experience with RAG, agent workflows, inference deployment, data pipelines, and backend services. Programming basics and ML theory are assumed. Rust, explicit resource ownership, and systems programming are taught from the beginning.

## What you will learn to build

1. A streaming log analyzer for AI service telemetry.
2. A validated document-ingestion core for RAG.
3. A bounded asynchronous tool executor.
4. An HTTP gateway in front of an existing inference server.
5. A Python extension for a measured CPU bottleneck.

The capstone combines these ideas into a small AI service gateway. Model training and GPU inference remain in your existing stack. Whether Rust improves a particular workload is a measurement question.

## Start here

- [Research and course selection](course/RESEARCH.md): sources, GitHub repositories, tradeoffs, and selection rationale.
- [Schedule and outcomes](course/SYLLABUS.md): a 96-hour core followed by a 100-hour advanced optimization track.
- [Windows setup](course/SETUP.md): compiler, editor, and commands.
- [Lecture notes](course/LECTURES.md): explanations, examples, exercises, and checks for every module.
- [Lab workbook](course/LABS.md): six labs with input contracts and acceptance criteria.
- [Capstone brief](course/CAPSTONE.md): milestones, failure scenarios, and evaluation.
- [Assessment and study method](course/ASSESSMENT.md): mastery gates and answer guide.
- [Progress tracker](course/PROGRESS.md): record evidence of learning.
- [Advanced optimization](course/ADVANCED.md): sessions 13–22, ten additional labs, and a numerical-optimization capstone.
- [Performance report template](course/PERFORMANCE_REPORT.md): workload, evidence, uncertainty, and adoption decisions.

The complete path now has **22 sessions, approximately 196 hours, 16 labs, and two capstones**. The original 12-session core is followed by a 100-hour advanced track; study times are planning estimates. The [learning website](https://rust-ai-learning-kien.awarebream64.chatgpt.site/#advanced) includes the advanced lectures, assignments, checkpoints, notes, and account progress.

## First session: 90 minutes

1. Follow setup and record your toolchain versions.
2. Read module 01 and predict the output before running the example.
3. Open `practice/src/lib.rs`; implement exercise 01 only.
4. From the `practice` directory, run `cargo test exercise_01`.
5. Explain the empty-input decision and why the function borrows its input.

The practice crate includes three exercises and reference implementations behind a feature flag:

```powershell
cd D:\working\projects\rust_learning\practice
cargo test exercise_01
cargo test exercise_02
cargo test exercise_03
cargo test --features solutions
```

The default starter deliberately contains `todo!()` bodies: compilation should succeed, but exercise tests fail until you implement them. Read `solutions.rs` only after making your own attempt. The feature runs the same contract tests against the reference implementations; it does not assess your unfinished code.

## Recommended weekly rhythm

Two 90-minute study sessions, one three-hour lab, and two hours for review and source reading. Each module allocates about eight hours. Take additional time on ownership before async. Read linked sources selectively; completing every external course is unnecessary.

## Delivery status

This repository contains course materials, lab specifications, and a three-exercise starter with reference code. The gateway, async executor, and Python extension are learner projects, not completed services. No Rust compiler was discoverable in PATH or the conventional user Cargo directory during preparation, so Rust compilation and test execution have **not** been verified on this machine. See setup for the commands to run.

All prose and local exercise code are newly written for this course. External courses are linked for study rather than copied. No personal contact details or client documents are included.
# rust-ai-learning
