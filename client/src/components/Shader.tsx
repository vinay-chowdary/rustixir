import { useState } from "react";
import { ShaderForm } from "./ShaderForm";
import { ShaderCanvas } from "./ShaderCanvas";
import { ShaderCodePreview } from "./ShaderCodePreview";
import styles from "../styles/Shader.module.css";

export function Shader() {
  const [shaderCode, setShaderCode] = useState("");
  const [error, setError] = useState("");
  const [compilationError, setCompilationError] = useState("");

  const handleShaderGenerated = (code: string) => {
    setShaderCode(code);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCompilationError = (errorMessage: string) => {
    setCompilationError(errorMessage);
  };

  return (
    <div className={styles.grid}>
      <ShaderForm 
        onShaderGenerated={handleShaderGenerated}
        onError={handleError}
      />
      
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Live Preview</h2>
          <p className={styles.description}>See your shader in action.</p>
        </div>
        <div className={styles.content}>
          <ShaderCanvas 
            shaderCode={shaderCode}
            onCompilationError={handleCompilationError}
          />
          {(error || compilationError) && (
            <div className={styles.controls}>
              {error && <span className={styles.error}>{error}</span>}
              {compilationError && <span className={styles.error}>{compilationError}</span>}
            </div>
          )}
        </div>
      </div>

      <ShaderCodePreview shaderCode={shaderCode} />
    </div>
  );
}
