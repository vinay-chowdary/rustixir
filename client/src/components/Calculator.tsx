import { useState, useEffect } from "react";
import init, { calculate } from "../rust/pkg/rustixir";
import styles from "../styles/Calculator.module.css";

export function Calculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    init().finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true };
  }, []);

  const onCalculate = () => {
    try {
      const res = calculate(expr);
      setResult(res.toString());
    } catch (e) {
      setResult(String(e));
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>WASM Calculator</h2>
        <p className={styles.description}>Evaluate math expressions compiled to WebAssembly.</p>
      </div>
      <div className={styles.content}>
        <div className={styles.form}>
          <input
            className={styles.input}
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="Enter expression, e.g. (5+7)/2"
            disabled={loading}
          />
          <div className={styles.controls}>
            <button 
              className={styles.button}
              onClick={onCalculate} 
              disabled={loading || !expr.trim()}
            >
              Calculate
            </button>
            {loading && <span className={styles.loading}>Loading WASM…</span>}
          </div>
          <div className={styles.result}>
            <span className={styles.resultLabel}>Result:</span>{" "}
            <span className={styles.resultValue}>{result || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
