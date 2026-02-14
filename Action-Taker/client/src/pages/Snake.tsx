import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useScores, useSubmitScore } from "@/hooks/use-scores";
import { Trophy, RotateCcw, Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

// Game Constants
const GRID_SIZE = 20;
const CELL_SIZE = 20; // Will be responsive in effect
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_SPEED = 150;
const GAME_GAME = 'snake';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT'); // Buffer for quick turns
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState("");
  
  // High Scores Hook
  const { data: highScores } = useScores(GAME_GAME);
  const submitScore = useSubmitScore();

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Optional, subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food (Apple)
    ctx.fillStyle = '#ef4444'; // Red-500
    ctx.beginPath();
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.arc(foodX, foodY, CELL_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    // Shiny reflection
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(foodX - 3, foodY - 3, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Draw Snake
    snake.forEach((segment, index) => {
      // Head is darker green
      ctx.fillStyle = index === 0 ? '#15803d' : '#22c55e'; // Green-700 / Green-500
      
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      
      // Rounded rectangles for snake segments
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
      ctx.fill();
    });

  }, [snake, food]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const moveSnake = () => {
      setDirection(nextDirection);
      
      const head = { ...snake[0] };
      switch (nextDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check Collision
      if (
        head.x < 0 || head.x >= GRID_SIZE || 
        head.y < 0 || head.y >= GRID_SIZE ||
        snake.some(seg => seg.x === head.x && seg.y === head.y)
      ) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      const newSnake = [head, ...snake];
      
      // Check Food
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        // New Food
        let newFood;
        do {
          newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
          };
        } while (newSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        setFood(newFood);
      } else {
        newSnake.pop(); // Remove tail
      }

      setSnake(newSnake);
    };

    const gameInterval = setInterval(moveSnake, INITIAL_SPEED * Math.pow(0.99, score / 10)); // Slight speed up
    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver, snake, nextDirection, food, score]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setNextDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setNextDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setNextDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setNextDirection('RIGHT'); break;
        case ' ': if (!isPlaying && !gameOver) setIsPlaying(true); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPlaying, gameOver]);

  // Touch Controls
  const handleTouch = (dir: Direction) => {
    if ((dir === 'UP' && direction !== 'DOWN') ||
        (dir === 'DOWN' && direction !== 'UP') ||
        (dir === 'LEFT' && direction !== 'RIGHT') ||
        (dir === 'RIGHT' && direction !== 'LEFT')) {
      setNextDirection(dir);
    }
  };

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setScore(0);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setGameOver(false);
    setIsPlaying(true);
    setPlayerName("");
  };

  const handleSubmitScore = async () => {
    if (!playerName.trim()) return;
    try {
      await submitScore.mutateAsync({
        game: GAME_GAME,
        score,
        playerName
      });
      setGameOver(false); // Close dialog but stay in reset state
      handleRestart(); // Or just let them see the high scores first? Let's just reset.
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto">
        {/* Game Area */}
        <div className="flex-1 w-full flex flex-col items-center">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-display font-bold text-gradient mb-2">Snake</h1>
            <p className="text-muted-foreground">Score: <span className="text-primary font-bold text-xl">{score}</span></p>
          </div>

          <Card className="p-1 bg-card/50 backdrop-blur border-primary/20 shadow-2xl rounded-xl overflow-hidden relative">
            <canvas 
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="bg-zinc-900/90 rounded-lg cursor-pointer"
              onClick={() => !isPlaying && !gameOver && setIsPlaying(true)}
            />
            
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
                <Button size="lg" onClick={() => setIsPlaying(true)} className="gap-2 shadow-xl animate-pulse">
                  <Play className="fill-current w-4 h-4" /> Start Game
                </Button>
              </div>
            )}
          </Card>

          {/* Mobile Controls */}
          <div className="grid grid-cols-3 gap-2 mt-8 md:hidden">
            <div />
            <Button variant="secondary" size="icon" onPointerDown={() => handleTouch('UP')}><ArrowUp /></Button>
            <div />
            <Button variant="secondary" size="icon" onPointerDown={() => handleTouch('LEFT')}><ArrowLeft /></Button>
            <Button variant="secondary" size="icon" onPointerDown={() => handleTouch('DOWN')}><ArrowDown /></Button>
            <Button variant="secondary" size="icon" onPointerDown={() => handleTouch('RIGHT')}><ArrowRight /></Button>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground hidden md:block">
            Use Arrow Keys to move. Space to start.
          </p>
        </div>

        {/* High Scores Sidebar */}
        <div className="w-full lg:w-80">
          <Card className="h-full border-border/50 shadow-lg">
            <div className="p-6 border-b border-border/50 bg-secondary/30">
              <h2 className="flex items-center gap-2 font-display font-bold text-xl">
                <Trophy className="text-yellow-500" /> Leaderboard
              </h2>
            </div>
            <div className="p-0">
              {highScores && highScores.length > 0 ? (
                <ul className="divide-y divide-border/50">
                  {highScores.map((entry, i) => (
                    <li key={i} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-700 text-white' : 'bg-secondary text-muted-foreground'}
                        `}>
                          {i + 1}
                        </span>
                        <span className="font-medium truncate max-w-[120px]">{entry.playerName}</span>
                      </div>
                      <span className="font-mono text-primary font-bold">{entry.score}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No high scores yet. Be the first!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Game Over Dialog */}
      <Dialog open={gameOver} onOpenChange={setGameOver}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Game Over!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              You scored <span className="text-primary font-bold">{score}</span> points
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Enter your name</label>
              <Input
                id="name"
                placeholder="Anonymous"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
             <Button variant="ghost" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button onClick={handleSubmitScore} disabled={submitScore.isPending || !playerName.trim()}>
              {submitScore.isPending ? "Saving..." : "Save Score"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
