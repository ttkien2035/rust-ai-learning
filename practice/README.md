# Foundation practice

Three original exercises accompany modules 01–03. See `../course/LABS.md` for contracts.

```powershell
cargo check
cargo test exercise_01
cargo test exercise_02
cargo test exercise_03
cargo test --features solutions
cargo fmt --check
cargo clippy --all-targets -- -D warnings
```

Implement the unfeatured functions in `src/lib.rs`. `todo!()` is deliberate starter behavior. With `solutions` enabled, public functions are re-exported from `src/solutions.rs` and the same tests run against reference code. The reference feature is for comparison, not a substitute for completing your own implementation.

The supplied tests cover empty input, normal input, large duration values, borrowed Unicode text, and budget boundaries. Compilation and execution have not yet been verified on this machine; the preparation environment had no discoverable Rust compiler.
