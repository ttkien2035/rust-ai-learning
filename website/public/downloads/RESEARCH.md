# Research and curriculum decisions

Checked on 18 October 2026 using public course pages, official documentation, and upstream GitHub repositories. This is a content-fit review, not an exhaustive ranking or a completion of every course. No star-count ranking, performance claim, or guarantee of maintenance is implied. Assessments in the final column are curriculum judgments.

| Resource and primary sources | Format and scope | Fit and decision |
|---|---|---|
| [The Rust Book](https://doc.rust-lang.org/book/), [source](https://github.com/rust-lang/book) | Language reference presented as a progressive textbook | Core reading. Use chapter topics alongside local labs rather than reading cover to cover first. |
| [Comprehensive Rust](https://google.github.io/comprehensive-rust/), [GitHub](https://github.com/google/comprehensive-rust) | Google course for existing programmers, fundamentals plus specialist tracks | Useful concise explanations and concurrency material. Its classroom format is dense for independent study; expand ownership practice and omit Android, Chromium, and embedded tracks. |
| [Rustlings](https://rustlings.rust-lang.org/), [GitHub](https://github.com/rust-lang/rustlings) | Short code exercises recommended alongside the Rust Book | Primary warm-up practice. Select exercises by current topic. Short compiler puzzles alone do not establish service-design competence. |
| [100 Exercises to Learn Rust](https://rust-exercises.com/100-exercises/), [GitHub](https://github.com/mainmatter/100-exercises-to-learn-rust) | Mainmatter course with incremental exercises and tests; assumes another programming language, not systems experience | Strong alternative exercise spine. Use selected ownership/type/concurrency sections if Rustlings feels fragmented. Avoid completing two overlapping exercise tracks by default. |
| [Brown Rust Book](https://rust-book.cs.brown.edu/experiment-intro.html), [ownership](https://rust-book.cs.brown.edu/ch04-00-understanding-ownership.html) | Experimental Rust Book fork with ownership visualizations and quizzes | Targeted support for Python-to-Rust mental-model changes. Return to official documentation when checking current APIs. |
| [Rust By Practice](https://github.com/origin-brain/rust-by-practice) | Additional practice repository; the older sunface URL redirected to this repository when checked | Optional remedial exercises, not another required curriculum. Verify current navigation before selecting exercises. |
| [Tokio tutorial](https://tokio.rs/tokio/tutorial), [Mini-Redis](https://github.com/tokio-rs/mini-redis) | Async networking tutorial and educational client/server code | Core async track after ownership and error handling. Read shared state, channels, spawning, select, and shutdown. Mini-Redis explicitly serves learning, not production Redis replacement. |
| [Axum docs](https://docs.rs/axum/latest/axum/), [GitHub and examples](https://github.com/tokio-rs/axum) | HTTP framework documentation and examples | Core implementation reference for HTTP labs. This is not a standalone beginner course. |
| [Zero to Production source](https://github.com/LukeMathWalker/zero-to-production), [author's book site](https://www.zero2prod.com/) | Companion code for a backend engineering book | Optional deeper production track. Learn configuration, integration testing, and operations; the local course uses an AI gateway rather than its newsletter domain. The public repository is companion code, not a claim that the entire book is freely available. |
| [PyO3 guide](https://pyo3.rs/), [GitHub](https://github.com/PyO3/pyo3), [Maturin guide](https://www.maturin.rs/) | Python interoperability and packaging guides | Applied final track for incremental adoption in existing Python systems. Benchmark language-boundary overhead as well as the Rust function. |
| [Rustup Windows guide](https://rust-lang.github.io/rustup/installation/windows.html) | Platform setup documentation | Setup source for MSVC/linker requirements. |

## How the research changes this course

The general courses establish language progression; local examples translate it to telemetry, retrieval, tool execution, and serving. Ownership receives two modules because aliasing and lifetime decisions will recur in request handling and shared configuration. Async starts only after a learner can explain who owns each value and how failures propagate.

Rustlings is the default short-exercise track. Mainmatter is an alternative or targeted supplement. The Book is the reference spine, Brown is a conceptual supplement, Tokio is the async course, and Axum/PyO3 are implementation references. This avoids assigning several complete introductory courses at once.

The original 12-week estimate has been expanded to approximately 96 hours with a 12–16 week self-study window. Classroom course durations are not treated as mastery estimates. The schedule is a planning assumption and should change based on checkpoint results.

## Attribution and reuse

Local lessons and code are original synthesis; they do not reproduce external exercise sets. Follow upstream licenses when copying their materials. For example, Mainmatter's repository identifies CC BY-NC 4.0, and Comprehensive Rust distinguishes documentation and code licenses. Linking here is not a blanket permission to redistribute their content commercially.

## Version policy

Source links generally track current stable documentation. Record the actual compiler and crate versions when starting a lab; commit the application `Cargo.lock` after resolving dependencies. Do not assume an example from an old article matches a current crate API. The foundational starter uses only the standard library and Rust edition 2024; service and extension dependencies are selected during their labs from the linked official docs.

## Advanced optimization sources — added 18 October 2026

The advanced track is original course material guided by these primary sources. These are documentation, examples, and reference books rather than ten additional external courses to complete.

| Source | Used in | Selection rationale |
|---|---|---|
| [Rust Performance Book](https://nnethercote.github.io/perf-book/), [GitHub](https://github.com/nnethercote/perf-book) | 13–15, 21 | Practical profiling, allocation, layout, and code-generation guidance; tool availability depends on OS. |
| [Criterion guide](https://bheisler.github.io/criterion.rs/book/), [API](https://docs.rs/criterion/latest/criterion/) | 13 and all experiment reports | Repeated microbenchmarking; supplemented locally with process repetitions and end-to-end workload measurements. |
| [Rayon docs](https://docs.rs/rayon/latest/rayon/), [GitHub](https://github.com/rayon-rs/rayon) | 16, 22 | Data parallelism, pool control, and partition-local aggregation. |
| [std::arch](https://doc.rust-lang.org/std/arch/), [std::simd](https://doc.rust-lang.org/std/simd/) | 17 | Architecture and portable-SIMD boundaries. Official std::simd docs still label it nightly-only experimental when checked; stable scalar/autovectorized code remains the required baseline. |
| [BinaryHeap](https://doc.rust-lang.org/std/collections/struct.BinaryHeap.html), [slice APIs](https://doc.rust-lang.org/std/primitive.slice.html) | 18 | Exact selection, deterministic ordering, and algorithmic alternatives. |
| [Tokio](https://tokio.rs/tokio/tutorial) | 19 | Async resource ownership and bounded concurrency, extended locally into latency-budget experiments. |
| [PyO3 performance](https://pyo3.rs/main/performance), [rust-numpy](https://github.com/PyO3/rust-numpy) | 20 | Boundary conversion, ownership, batching, and version-specific interpreter behavior. |
| [Cargo profiles](https://doc.rust-lang.org/cargo/reference/profiles.html), [rustc PGO](https://doc.rust-lang.org/rustc/profile-guided-optimization.html), [Miri](https://github.com/rust-lang/miri) | 21 | Build configuration, profile-guided optimization, and limited dynamic checking of unsafe code. |
| [argmin docs](https://docs.rs/argmin/latest/argmin/), [GitHub](https://github.com/argmin-rs/argmin) | 22 | Numerical optimization framework and examples. Local exercises add explicit gradient checks, stopping rules, evaluation accounting, and time-to-quality comparisons. |

Optimization has two meanings in this track: performance engineering of systems and mathematical search for good solutions. Session 22 explicitly joins the two. No source is used to promise a speedup, and no nightly-only API is silently required by the core course.
# Quality upgrade — 18 October 2026

The 22 sessions now include original workshops in [WORKSHOPS.md](WORKSHOPS.md). Source selection favors language/runtime documentation, author-maintained GitHub repositories, and primary teaching research. No external course exercises or solutions were copied. The following is a design synthesis for this learner, not a claim that one course is universally best.

| Resource or technique | Why it belongs here | Concrete course change |
| --- | --- | --- |
| [Brown experimental Rust Book](https://rust-book.cs.brown.edu/experiment-intro.html) and its linked ownership research | Makes misconceptions observable through prediction and visual ownership reasoning | Session 02 asks for an owner/borrow/last-use trace before compiler feedback; every session starts with a diagnostic prediction |
| [Google Comprehensive Rust](https://google.github.io/comprehensive-rust/) | A structured path for programmers with existing experience | Keep familiar programming basics short; spend practice time on Rust contracts, memory, concurrency, and failure behavior |
| [Mainmatter 100 Exercises](https://github.com/mainmatter/100-exercises-to-learn-rust), [Rustlings](https://github.com/rust-lang/rustlings) | Short exercises provide optional syntax and compiler-feedback practice | Each workshop uses an original reproduce → change → transfer ladder; external drills are optional and linked rather than reproduced |
| [Tokio select](https://docs.rs/tokio/latest/tokio/macro.select.html), [blocking tasks](https://docs.rs/tokio/latest/tokio/task/fn.spawn_blocking.html), [shutdown](https://tokio.rs/tokio/topics/shutdown) | Resource and cancellation semantics matter directly to AI serving | Sessions 07–10 require lifecycle traces, partial-message cancellation tests, and explicit shutdown accounting |
| [Proptest](https://proptest-rs.github.io/proptest/intro.html), [Loom](https://docs.rs/loom/latest/loom/), [cargo-fuzz](https://rust-fuzz.github.io/book/cargo-fuzz.html) | Different failure classes need different testing methods | Optional generated retrieval properties, tiny concurrency models, and ingestion fuzzing; each tool's scope and setup limits are stated |
| [Rust Performance Book](https://nnethercote.github.io/perf-book/) and [Criterion](https://bheisler.github.io/criterion.rs/book/user_guide/benchmarking_with_inputs.html) | Optimization needs representative experiments and equivalent work | Sessions 13–18 require correctness oracles, input-size sweeps, conversion-inclusive measurements, and rejection criteria |
| [Rayon](https://docs.rs/rayon/latest/rayon/iter/index.html), [SIMD status](https://doc.rust-lang.org/std/simd/), [rustc PGO](https://doc.rust-lang.org/rustc/profile-guided-optimization.html), [Miri](https://github.com/rust-lang/miri) | Parallelism, compiler tuning, and unsafe code each have separate contracts | Worker-count sweeps, reduction tolerances, scalar fallback, held-out PGO workloads, and safety arguments |
| [wrk2](https://github.com/giltene/wrk2), [HdrHistogram](https://github.com/HdrHistogram/HdrHistogram) | Completed-request latency can conceal overload and generator effects | Session 19 records offered/admitted/completed/rejected/timeout counts, generator lag, and queue-inclusive latency |
| [PyO3](https://pyo3.rs/main/performance), [rust-numpy](https://docs.rs/numpy/latest/numpy/), [argmin](https://docs.rs/argmin/latest/argmin/), [SciPy gradient checking](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.check_grad.html) | Native kernels need valid boundary semantics and numerical evidence | Sessions 11/20 measure call and copy costs; Session 22 checks gradients and compares time to a fixed quality target |

## Quality audit and boundaries

Earlier notes provided topic explanations and broad lab specifications, but not a consistent path for diagnosing misconceptions or deciding what counts as a satisfactory submission. Every session now has measurable goals, a prediction, worked reasoning, three staged tasks, a collapsible hint, review evidence, and targeted primary reading. Earlier sessions are deliberately retrieved again in later work.

The original three persisted checkpoints per session retain their order and keys. New predictions are practice prompts, not automatically graded questions. Progress remains self-assessed. No added session hours are implied: use the workshop to guide the existing lab time, rather than treating all linked resources as mandatory reading.

Library documentation is live. Pin crate versions in actual lab implementations and use matching documentation; PyO3 `main` may be ahead of a released crate. Portable SIMD is optional nightly work according to the status checked on the research date. Tool availability differs on Windows, Linux, and macOS. Proposed lab experiments have no promised speedup. Rust examples and lab specifications must still be compiled and exercised in the learner's Rust environment; website build checks do not validate Rust execution.



## Learning-design revision — 18 October 2026

The earlier whole-project blank-file requirement was broader than the evidence supports. The course now combines worked examples, repair/completion, selected short core probes, AI-assisted engineering, and evidence-based review. This is a design synthesis for an experienced Python AI engineer learning Rust, not a proven optimal method or schedule.

| Evidence | Design implication and limit |
| --- | --- |
| [Shen and Tamkin, 2026](https://arxiv.org/abs/2601.20245) | AI can compromise immediate comprehension when learning an unfamiliar async library; this does not establish that every task must be written unaided or measure long-term retention. |
| [Kazemitabaar et al., CHI 2023](https://arxiv.org/abs/2302.07427) | AI improved novice code authoring without detected harm to manual modification; one-week post-test differences were not significant. Young participants and older tools limit applicability here. |
| [Hou et al., 2023](https://arxiv.org/abs/2311.18115) | Parsons scaffolding benefited some learners during practice, supporting an intermediate repair/completion step instead of universal unsupported writing. |
| [Cognitive engagement techniques](https://arxiv.org/html/2410.08922v1) | The second experiment found no significant post-test performance difference; interventions could add substantial time. Guided questions are not a proven universally superior method. Avoid compulsory repetitive questions. |
| [Cui et al., 2025](https://www.microsoft.com/en-us/research/publication/the-effects-of-generative-ai-on-high-skilled-work-evidence-from-three-field-experiments-with-software-developers/) | Pooled enterprise trials found more completed tasks. Productivity does not establish learning or retention. |
| [Crichton et al., OOPSLA 2023](https://arxiv.org/abs/2309.04134) | Ownership models and visual explanations improved concept-inventory scores; use owner/borrow traces alongside compiler feedback. |
| [METR, February 2026](https://metr.org/blog/2026-02-24-uplift-update/) | Changing tools and selection effects limit extrapolating early-2025 productivity results to current workflows. |

The routes in [LEARNING_PATHS.md](LEARNING_PATHS.md) apply these choices. No direct comparison identified in this review proves a blank file plus compiler/API docs is best for experienced AI engineers learning Rust with 2026 tools. Record AI assistance separately from competence; assess explain, decide/build, verify/debug, and adapt. Revisit the design using actual learner errors, transfer, and later recall. The research supports neither a blanket ban on AI nor treating generated passing code as proof of understanding.
