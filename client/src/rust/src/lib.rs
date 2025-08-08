use wasm_bindgen::prelude::*;
use meval;

#[wasm_bindgen]
pub fn calculate(expression: &str) -> Result<f64, JsValue> {
    meval::eval_str(expression)
        .map_err(|e| JsValue::from_str(&format!("Error: {}", e)))
}