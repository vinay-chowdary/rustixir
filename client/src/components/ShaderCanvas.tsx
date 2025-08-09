import React, { useRef } from "react";
import { useWebGL } from "../hooks/useWebGL";
import styles from "../styles/Shader.module.css";

interface ShaderCanvasProps {
  shaderCode: string;
  onCompilationError: (error: string) => void;
}

export function ShaderCanvas({
  shaderCode,
  onCompilationError,
}: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderShader } = useWebGL(canvasRef);

  // Render shader when shaderCode changes
  React.useEffect(() => {
    if (shaderCode) {
      const compileError = renderShader(shaderCode);
      if (compileError) {
        onCompilationError(compileError);
      } else {
        onCompilationError("");
      }
    }
  }, [shaderCode, renderShader, onCompilationError]);

  return (
    <div className={styles.canvasFrame}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={400}
        height={300}
      />
    </div>
  );
}
