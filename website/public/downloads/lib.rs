//! Implement one exercise at a time. Contracts are in the tests and lab workbook.

#[cfg(feature = "solutions")]
mod solutions;

#[cfg(not(feature = "solutions"))]
pub fn mean_latency(_values: &[u64]) -> Option<f64> {
    todo!("exercise 01: empty input is None; avoid an overflowing integer sum")
}

#[cfg(not(feature = "solutions"))]
pub fn first_nonempty(_values: &[String]) -> Option<&str> {
    todo!("exercise 02: borrow the first entry that is nonempty after trim")
}

#[derive(Debug, PartialEq, Eq)]
pub enum BudgetError {
    ZeroLimit,
    Exceeded { requested: u64, limit: u64 },
}

#[cfg(not(feature = "solutions"))]
pub fn validate_budget(_requested: u64, _limit: u64) -> Result<(), BudgetError> {
    todo!("exercise 03: validate the limit before comparing the request")
}

#[cfg(feature = "solutions")]
pub use solutions::{first_nonempty, mean_latency, validate_budget};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exercise_01_empty_and_normal() {
        assert_eq!(mean_latency(&[]), None);
        assert_eq!(mean_latency(&[100, 200, 300]), Some(200.0));
        assert_eq!(mean_latency(&[0]), Some(0.0));
    }

    #[test]
    fn exercise_01_large_values() {
        let mean = mean_latency(&[u64::MAX, u64::MAX]).unwrap();
        assert!(mean.is_finite());
        assert!((mean / u64::MAX as f64 - 1.0).abs() < 1e-12);
    }

    #[test]
    fn exercise_02_borrowed_trimmed_text() {
        let input = vec!["  ".to_owned(), "  retrieval  ".to_owned(), "agent".to_owned()];
        let output = first_nonempty(&input).unwrap();
        assert_eq!(output, "retrieval");
        assert_eq!(output.as_ptr(), input[1].trim().as_ptr());
        assert_eq!(input[1], "  retrieval  ");
    }

    #[test]
    fn exercise_02_empty_and_unicode() {
        assert_eq!(first_nonempty(&[]), None);
        assert_eq!(first_nonempty(&["\t\n".to_owned()]), None);
        let input = vec!["  dữ liệu  ".to_owned()];
        assert_eq!(first_nonempty(&input), Some("dữ liệu"));
    }

    #[test]
    fn exercise_03_budget_boundaries() {
        assert_eq!(validate_budget(0, 0), Err(BudgetError::ZeroLimit));
        assert_eq!(validate_budget(0, 10), Ok(()));
        assert_eq!(validate_budget(10, 10), Ok(()));
        assert_eq!(validate_budget(11, 10), Err(BudgetError::Exceeded { requested: 11, limit: 10 }));
        assert_eq!(validate_budget(u64::MAX, u64::MAX), Ok(()));
    }
}
