import styles from "../styles/Shader.module.css";

interface ShaderCodePreviewProps {
  shaderCode: string;
}

export function ShaderCodePreview({ shaderCode }: ShaderCodePreviewProps) {
  return (
    <div className={`${styles.card} ${styles.cardCode}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Generated GLSL</h3>
        <p className={styles.description}>Inspect and tweak the output shader code.</p>
      </div>
      <div className={styles.content}>
        <pre className={styles.code}>{shaderCode || "// Code will appear here…"}</pre>
      </div>
    </div>
  );
} 