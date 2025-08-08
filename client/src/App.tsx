import { useState } from "react";
import { Calculator } from "./components/Calculator";
import { ShaderTab } from "./components/Shader";
import styles from "./styles/App.module.css";

export default function App() {
  const [activeTab, setActiveTab] = useState<"calculator" | "shader">("calculator");

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>
              <span className={styles.titleGradient}>rustixir</span>
            </h1>
            <p className={styles.subtitle}>WASM calculator and text-to-shader playground.</p>
          </div>

          <nav className={styles.nav}>
            <button
              className={`${styles.tab} ${activeTab === "calculator" ? styles.active : ""}`}
              onClick={() => setActiveTab("calculator")}
            >
              Calculator
            </button>
            <button
              className={`${styles.tab} ${activeTab === "shader" ? styles.active : ""}`}
              onClick={() => setActiveTab("shader")}
            >
              Shader
            </button>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === "calculator" ? <Calculator /> : <ShaderTab />}
      </main>
    </div>
  );
}
