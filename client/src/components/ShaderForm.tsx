import { useState } from "react";
import { fetchShader } from "../apis/shader";
import styles from "../styles/Shader.module.css";

interface ShaderFormProps {
  onShaderGenerated: (shaderCode: string) => void;
  onError: (error: string) => void;
}

export function ShaderForm({ onShaderGenerated, onError }: ShaderFormProps) {
  const [prompt, setPrompt] = useState("");

  const handleGenerateShader = async () => {
    if (!prompt.trim()) return;

    onError("");

    const result = await fetchShader(prompt);

    if (result.error) {
      onError(result.error);
      return;
    }

    if (result.shader) {
      onShaderGenerated(result.shader);
      onError("");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Text → Shader</h2>
        <p className={styles.description}>
          Describe a visual effect. We'll fetch shader code and preview it.
        </p>
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
              onClick={handleGenerateShader}
              disabled={!prompt.trim()}
            >
              Generate Shader
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
