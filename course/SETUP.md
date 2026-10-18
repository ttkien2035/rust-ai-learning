# Windows setup and reproducibility

Use native Windows with the MSVC toolchain for this course, or a consistent Linux environment in WSL if you already use one. Keep a project's toolchain, virtual environment, and terminal on the same side of that boundary.

## Install and verify

1. Follow the [official Rust installation instructions](https://www.rust-lang.org/tools/install).
2. For the Windows MSVC target, install the required Visual Studio C++ build tools/linker and Windows SDK through the installer. The [Rustup Windows guide](https://rust-lang.github.io/rustup/installation/windows.html) explains the ABI choices.
3. Restart your terminal. Use an editor with rust-analyzer.
4. Verify:

```powershell
rustup show
rustc --version
cargo --version
rustup component add rustfmt clippy
```

Use a current stable compiler supporting edition 2024. Record versions in `PROGRESS.md`. The course does not install or change your machine's toolchain automatically.

## Foundation crate

```powershell
cd D:\working\projects\rust_learning\practice
cargo check
cargo test exercise_01
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test --features solutions
```

Starter tests intentionally fail at `todo!()` until implemented. Format or lint failures should be fixed before submitting your work. Reference-solution tests must pass independently of the starter. Rust execution was not verified during course preparation because no local compiler was discoverable.

## Later labs

Create separate packages beneath a new `projects` directory. Add dependencies only when their module introduces them:

| Lab | Dependencies to investigate | Purpose |
|---|---|---|
| C | serde, serde_json | Typed JSONL records |
| D | tokio with required features | Tasks, channels, time, synchronization |
| E | axum, reqwest, tracing, tracing-subscriber | HTTP service/client and structured tracing |
| F | pyo3 and maturin tooling | Python extension and wheel build |

Use upstream installation examples, record resolved versions, and commit application lockfiles. For PyO3, use the function signatures and module registration style in the guide matching your installed version. Do not mix snippets from different releases.

## Reproducibility record

For each benchmark save: OS, CPU, memory, compiler, crate versions, Python version, build profile, input generator seed, input size, command, warm-up policy, and number of repetitions. Use `--release` for runtime comparisons. Keep identical correctness contracts across Python and Rust.

Mock services and synthetic data are sufficient throughout. Real client data, credentials, and paid API calls are unnecessary.
