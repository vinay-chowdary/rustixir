import { useState } from "react";
import styles from "../styles/Shader.module.css";

interface ShaderCodePreviewProps {
  shaderCode: string;
}

export function ShaderCodePreview({ shaderCode }: ShaderCodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shaderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={`${styles.card} ${styles.codeRootContainer}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Generated GLSL</h3>
        <p className={styles.description}>
          Inspect and tweak the output shader code.
        </p>
      </div>
      <div className={styles.content}>
        <pre className={styles.code}>
          <button className={styles.copyButton} onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
          {shaderCode || "// Code will appear here…"}
        </pre>
      </div>
    </div>
  );
}
