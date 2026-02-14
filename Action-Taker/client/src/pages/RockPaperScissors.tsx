import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Scissors, Scroll, RefreshCw, Trophy } from "lucide-react";
import confetti from "canvas-confetti";

type Choice = "rock" | "paper" | "scissors";

const CHOICES: { id: Choice; label: string; icon: React.ReactNode; beats: Choice }[] = [
  { id: "rock", label: "Rock", icon: <Scroll className="rotate-90" />, beats: "scissors" }, // Using Scroll as closest to 'Rock' visually in lucide without generic circle
  { id: "paper", label: "Paper", icon: <Hand />, beats: "rock" },
  { id: "scissors", label: "Scissors", icon: <Scissors />, beats: "paper" },
];

export default function RockPaperScissors() {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const playGame = (choice: Choice) => {
    setIsAnimating(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);

    // Simulate thinking/animation time
    setTimeout(() => {
      const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      setComputerChoice(randomChoice.id);
      
      if (choice === randomChoice.id) {
        setResult("draw");
      } else if (CHOICES.find(c => c.id === choice)?.beats === randomChoice.id) {
        setResult("win");
        setPlayerScore(p => p + 1);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e'] // Green win
        });
      } else {
        setResult("lose");
        setComputerScore(c => c + 1);
      }
      setIsAnimating(false);
    }, 1500); // 1.5s delay for tension
  };

  const resetGame = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8 flex flex-col items-center">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold text-gradient">Rock Paper Scissors</h1>
          <p className="text-muted-foreground">Best of luck vs the Machine</p>
        </div>

        {/* Scoreboard */}
        <div className="flex justify-between items-center w-full max-w-md bg-card/50 backdrop-blur border border-border rounded-2xl p-6 shadow-lg">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Player</p>
            <p className="text-4xl font-bold text-primary">{playerScore}</p>
          </div>
          <div className="text-2xl font-bold text-muted-foreground/30">VS</div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Computer</p>
            <p className="text-4xl font-bold text-orange-500">{computerScore}</p>
          </div>
        </div>

        {/* Game Arena */}
        <Card className="w-full aspect-[4/3] md:aspect-[2/1] bg-secondary/20 relative overflow-hidden flex items-center justify-center">
          <div className="flex justify-between items-center w-full px-8 md:px-20 relative z-10">
            {/* Player Hand */}
            <motion.div
              animate={isAnimating ? {
                y: [0, -20, 0],
                rotate: [-5, 5, -5]
              } : {}}
              transition={isAnimating ? { repeat: 3, duration: 0.5 } : {}}
              className="transform scale-x-[-1]" // Flip hand for player side
            >
              {playerChoice ? (
                <div className="text-9xl text-primary drop-shadow-2xl">
                  {CHOICES.find(c => c.id === playerChoice)?.icon}
                </div>
              ) : (
                <div className="text-9xl text-muted-foreground/20">
                  <Hand /> {/* Default starting pose */}
                </div>
              )}
            </motion.div>

            {/* Result Text (Absolute Center) */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                >
                  <div className={`
                    text-4xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-lg
                    ${result === 'win' ? 'text-green-500' : result === 'lose' ? 'text-red-500' : 'text-yellow-500'}
                  `}>
                    {result === 'draw' ? 'Draw!' : result === 'win' ? 'You Win!' : 'You Lose!'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Computer Hand */}
            <motion.div
              animate={isAnimating ? {
                y: [0, -20, 0],
                rotate: [5, -5, 5]
              } : {}}
              transition={isAnimating ? { repeat: 3, duration: 0.5 } : {}}
            >
              {computerChoice ? (
                <div className="text-9xl text-orange-500 drop-shadow-2xl">
                  {CHOICES.find(c => c.id === computerChoice)?.icon}
                </div>
              ) : (
                <div className="text-9xl text-muted-foreground/20">
                  <Hand />
                </div>
              )}
            </motion.div>
          </div>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          {CHOICES.map((choice) => (
            <Button
              key={choice.id}
              size="lg"
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all text-lg font-medium"
              onClick={() => playGame(choice.id)}
              disabled={isAnimating}
            >
              <div className="w-8 h-8">{choice.icon}</div>
              {choice.label}
            </Button>
          ))}
        </div>

        {(playerScore > 0 || computerScore > 0) && (
          <Button variant="ghost" size="sm" onClick={resetGame} className="text-muted-foreground hover:text-destructive">
            <RefreshCw className="w-4 h-4 mr-2" /> Reset Score
          </Button>
        )}
      </div>
    </Layout>
  );
}
