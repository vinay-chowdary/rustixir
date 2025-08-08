import { useRef, useEffect, useCallback } from "react";

//
// WebGL helper functions
//
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile error: " + info);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create program");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error: " + info);
  }
  return program;
}

//
// useWebGL Hook
//
export function useWebGL(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;

    // Set canvas size and viewport once
    canvas.width = 400;
    canvas.height = 300;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.08, 0.09, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Cleanup on unmount
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
        programRef.current = null;
      }
    };
  }, [canvasRef]);

  // Render shader program from fragment shader source string
  const renderShader = useCallback(
    (fragmentShaderSource: string, vertexShaderSource?: string) => {
      const gl = glRef.current;
      if (!gl) {
        console.error("No WebGL context");
        return;
      }

      try {
        // Default vertex shader (minimal, matching varyings)
        const defaultVertexShader =
          vertexShaderSource ??
          `
          attribute vec2 a_position;
          attribute vec2 a_texCoord;
          varying vec2 vUv;

          void main() {
            vUv = a_texCoord;
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `;

        // Clean up previous program
        if (programRef.current) {
          gl.deleteProgram(programRef.current);
          programRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        // Compile shaders
        const vertexShader = createShader(
          gl,
          gl.VERTEX_SHADER,
          defaultVertexShader
        );
        const fragmentShader = createShader(
          gl,
          gl.FRAGMENT_SHADER,
          fragmentShaderSource
        );
        const program = createProgram(gl, vertexShader, fragmentShader);
        programRef.current = program;

        gl.useProgram(program);

        // Setup fullscreen quad buffer with interleaved pos + texCoord
        const vertices = new Float32Array([
          // x, y, u, v
          -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1,
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const a_position = gl.getAttribLocation(program, "a_position");
        const a_texCoord = gl.getAttribLocation(program, "a_texCoord");

        gl.enableVertexAttribArray(a_position);
        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 16, 0);

        gl.enableVertexAttribArray(a_texCoord);
        gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, 16, 8);

        // Uniform locations
        const u_time = gl.getUniformLocation(program, "time");
        const u_resolution = gl.getUniformLocation(program, "resolution");

        const startTime = Date.now();

        const renderLoop = () => {
          if (!gl) return;

          // Update viewport & clear each frame
          gl.viewport(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
          );
          gl.clearColor(0.08, 0.09, 0.12, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);

          const currentTime = (Date.now() - startTime) / 1000;

          if (u_time) gl.uniform1f(u_time, currentTime);
          if (u_resolution) {
            const c = canvasRef.current!;
            gl.uniform2f(u_resolution, c.width, c.height);
          }

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          animationRef.current = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return null;
      } catch (e) {
        console.error("WebGL shader error", e);
        return e instanceof Error ? e.message : "Unknown shader error";
      }
    },
    [canvasRef]
  );

  return { renderShader };
}
