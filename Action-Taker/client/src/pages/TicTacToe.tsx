import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Circle } from "lucide-react";
import confetti from "canvas-confetti";

type Player = "X" | "O" | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<Player | "Draw">(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: [a, b, c] };
      }
    }
    return null;
  };

  const handleSquareClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ef4444']
      });
    } else if (!newBoard.includes(null)) {
      setWinner("Draw");
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto min-h-[60vh] gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold text-gradient">Tic Tac Toe</h1>
          <p className="text-muted-foreground">Local Multiplayer</p>
        </div>

        <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/10 shadow-2xl rounded-2xl">
          <div className="flex justify-between items-center mb-8 px-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPlayer === 'X' && !winner ? 'bg-blue-500/10 text-blue-500' : 'text-muted-foreground'}`}>
              <X className="w-5 h-5" /> Player X
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${currentPlayer === 'O' && !winner ? 'bg-red-500/10 text-red-500' : 'text-muted-foreground'}`}>
              <Circle className="w-5 h-5" /> Player O
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4 relative">
            {board.map((value, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: winner ? 1 : 1.05 }}
                whileTap={{ scale: winner ? 1 : 0.95 }}
                onClick={() => handleSquareClick(i)}
                className={`
                  w-20 h-20 md:w-24 md:h-24 rounded-xl text-4xl flex items-center justify-center
                  transition-colors duration-200 border-2
                  ${value === null ? 'bg-secondary hover:bg-secondary/80 border-transparent' : 'bg-background'}
                  ${winningLine?.includes(i) ? 'border-green-500 ring-2 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-border'}
                `}
              >
                <AnimatePresence>
                  {value && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className={value === "X" ? "text-blue-500" : "text-red-500"}
                    >
                      {value === "X" ? <X className="w-12 h-12" /> : <Circle className="w-10 h-10" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
            
            {/* Win Line Overlay (Simple SVG could go here for strike-through effect) */}
          </div>
        </Card>

        <div className="h-16 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {winner ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <h2 className="text-2xl font-bold">
                  {winner === "Draw" ? "It's a Draw!" : `Player ${winner} Wins!`}
                </h2>
                <Button onClick={resetGame} size="lg" className="px-8 rounded-full font-bold shadow-lg shadow-primary/20">
                  Play Again <RefreshCw className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground"
              >
                Current Turn: <span className="font-bold text-foreground">Player {currentPlayer}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
