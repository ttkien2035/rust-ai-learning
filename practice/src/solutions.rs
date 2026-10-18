use crate::BudgetError;

pub fn mean_latency(values: &[u64]) -> Option<f64> {
    if values.is_empty() {
        return None;
    }
    // Floating point avoids overflowing a u64 sum; it does not preserve exact
    // integer precision above 2^53. This contract asks for an approximate mean.
    Some(values.iter().map(|&value| value as f64).sum::<f64>() / values.len() as f64)
}

pub fn first_nonempty(values: &[String]) -> Option<&str> {
    values.iter().map(|value| value.trim()).find(|value| !value.is_empty())
}

pub fn validate_budget(requested: u64, limit: u64) -> Result<(), BudgetError> {
    if limit == 0 {
        Err(BudgetError::ZeroLimit)
    } else if requested > limit {
        Err(BudgetError::Exceeded { requested, limit })
    } else {
        Ok(())
    }
}
