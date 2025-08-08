import { useState, useRef, useEffect } from "react";
import styles from "../styles/Shader.module.css";

export function ShaderTab() {
  const [prompt, setPrompt] = useState("");
  const [shaderCode, setShaderCode] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    gl.clearColor(0.08, 0.09, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);

  const fetchShader = async () => {
    try {
      const res = await fetch("http://localhost:4000/shader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      setShaderCode(json.shader);
      setError("");
      // TODO: Compile and render shader on the canvas
    } catch (e) {
      setError("Failed to fetch shader");
    }
  };

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Text → Shader</h2>
          <p className={styles.description}>Describe a visual effect. We'll fetch shader code and preview it.</p>
        </div>
        <div className={styles.content}>
          <div className={styles.form}>
            <textarea
              className={styles.textarea}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe shader, e.g. rotating cube with gradient"
            />
            <div className={styles.controls}>
              <button 
                className={styles.button}
                onClick={fetchShader} 
                disabled={!prompt.trim()}
              >
                Generate Shader
              </button>
              {error && <span className={styles.error}>{error}</span>}
            </div>
            <div className={styles.canvasFrame}>
              <canvas ref={canvasRef} className={styles.canvas} />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.card} ${styles.cardCode}`}>
        <div className={styles.header}>
          <h3 className={styles.title}>Generated GLSL</h3>
          <p className={styles.description}>Inspect and tweak the output shader code.</p>
        </div>
        <div className={styles.content}>
          <pre className={styles.code}>{shaderCode || '// Code will appear here…'}</pre>
        </div>
      </div>
    </div>
  );
}
