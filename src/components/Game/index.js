import * as React from "react";
import {examples} from "../../examples";
import {copy, getEdges, getMatrix} from "../../utils";
import CheckSolution from "../CheckSolution";
import Controls from "../Controls";
import Grid from "../Grid";
import Info from "../Info";

import styles from "./styles.module.scss";

const Game = () => {
  const [difficulty, setDifficulty] = React.useState("all");
  const [puzzleKey, setPuzzleKey] = React.useState(0);

  const getRandomPuzzle = React.useCallback((diff) => {
    let pool = examples;
    if (diff === "easy") {
      pool = examples.filter((e) => e.dim[0] <= 5 && e.dim[1] <= 5);
    } else if (diff === "medium") {
      pool = examples.filter((e) => e.dim[0] >= 7 && e.dim[1] >= 7);
    }
    if (pool.length === 0) pool = examples;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const [puzzle, setPuzzle] = React.useState(() => getRandomPuzzle("all"));
  const {dim = [], numbers, solution} = puzzle;

  const [matrix, setMatrix] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [check, setCheck] = React.useState("none");
  const [moveCount, setMoveCount] = React.useState(0);

  // Timer
  const [seconds, setSeconds] = React.useState(0);
  const [timerRunning, setTimerRunning] = React.useState(true);

  React.useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Stop timer on correct solution
  React.useEffect(() => {
    if (check === "passed") {
      setTimerRunning(false);
    }
  }, [check]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const updateMatrix = (mat) => {
    setHistory([...history.slice(0, historyIndex + 1), copy(mat)]);
    setHistoryIndex(historyIndex + 1);
    setMoveCount((c) => c + 1);
    setMatrix(mat);
  };

  // initializing matrix with example
  React.useEffect(() => {
    if (dim.length) {
      let temp = getMatrix(dim, [], numbers);
      setHistory([copy(temp)]);
      setHistoryIndex(0);
      setMoveCount(0);
      setSeconds(0);
      setTimerRunning(true);
      setCheck("none");
      setMatrix(temp);
    }
  }, [puzzleKey]);

  const onUndo = () => {
    if (historyIndex < 1) return;
    setMatrix(copy(history[historyIndex - 1]));
    setHistoryIndex(historyIndex - 1);
  };

  const onRedo = () => {
    if (historyIndex + 1 === history.length) return;
    setMatrix(copy(history[historyIndex + 1]));
    setHistoryIndex(historyIndex + 1);
  };

  const onReset = () => {
    if (dim.length) {
      if (getEdges(matrix).length === 0) return;
      const temp = getMatrix(dim, [], numbers);
      setHistory([copy(temp)]);
      setHistoryIndex(0);
      setMoveCount(0);
      setSeconds(0);
      setTimerRunning(true);
      setCheck("none");
      setMatrix(temp);
    }
  };

  const onRefresh = () => {
    const newPuzzle = getRandomPuzzle(difficulty);
    setPuzzle(newPuzzle);
    setPuzzleKey((k) => k + 1);
  };

  const onDifficultyChange = (diff) => {
    setDifficulty(diff);
    const newPuzzle = getRandomPuzzle(diff);
    setPuzzle(newPuzzle);
    setPuzzleKey((k) => k + 1);
  };

  // Confetti particles
  const [showConfetti, setShowConfetti] = React.useState(false);
  React.useEffect(() => {
    if (check === "passed") {
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [check]);

  return (
    <main className={styles.main}>
      {/* Confetti */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {Array.from({length: 50}).map((_, i) => (
            <div
              key={i}
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: [
                  "#06d6a0",
                  "#8b5cf6",
                  "#3b82f6",
                  "#f59e0b",
                  "#ef4444",
                  "#ec4899",
                ][Math.floor(Math.random() * 6)],
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.heading}>
          <span className={styles.logoIcon}>◯</span>
          <span className={styles.logoText}>Ouroboros</span>
        </h1>
        <p className={styles.subtitle}>Close the loop. Solve the puzzle.</p>
      </header>

      {/* Difficulty Selector */}
      <div className={styles.difficultyBar}>
        {[
          {key: "easy", label: "Easy", icon: "◇"},
          {key: "medium", label: "Medium", icon: "◆"},
          {key: "all", label: "All", icon: "✦"},
        ].map((d) => (
          <button
            key={d.key}
            className={`${styles.diffBtn} ${
              difficulty === d.key ? styles.diffActive : ""
            }`}
            onClick={() => onDifficultyChange(d.key)}
          >
            <span className={styles.diffIcon}>{d.icon}</span>
            {d.label}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>⏱</span>
          <span className={styles.statValue}>{formatTime(seconds)}</span>
          <span className={styles.statLabel}>Time</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>↔</span>
          <span className={styles.statValue}>{moveCount}</span>
          <span className={styles.statLabel}>Moves</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>⊞</span>
          <span className={styles.statValue}>
            {dim[0]}×{dim[1]}
          </span>
          <span className={styles.statLabel}>Grid</span>
        </div>
      </div>

      {/* Game Board */}
      <div className={styles.boardWrapper}>
        <Grid matrix={matrix} setMatrix={updateMatrix} state={check} />
      </div>

      {/* Check Solution */}
      <CheckSolution matrix={matrix} solution={solution} setCheck={setCheck} />

      {/* Info Button */}
      <Info />

      {/* Controls */}
      <Controls
        onReset={onReset}
        onRefresh={onRefresh}
        onUndo={onUndo}
        onRedo={onRedo}
      />
    </main>
  );
};

export default Game;
