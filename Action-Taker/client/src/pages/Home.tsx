import { Layout } from "@/components/layout/Layout";
import { GameCard } from "@/components/game/GameCard";
import { Hash, Skull, Scissors } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gradient">
            Choose Your Challenge
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a game below to start playing. Challenge a friend locally or try to beat your own high scores!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <GameCard
            title="Tic Tac Toe"
            description="The classic game of X's and O's. Challenge a friend in local multiplayer mode."
            href="/tictactoe"
            icon={Hash}
            color="bg-blue-500"
            stats="2 Player Local"
          />
          
          <GameCard
            title="Snake"
            description="Eat apples, grow longer, and don't hit the walls! A retro classic reimagined."
            href="/snake"
            icon={Skull}
            color="bg-green-500"
            stats="Global Leaderboard"
          />
          
          <GameCard
            title="Rock Paper Scissors"
            description="Test your luck against the computer. First to 5 wins the match!"
            href="/rps"
            icon={Scissors}
            color="bg-orange-500"
            stats="Vs Computer"
          />
        </div>
      </div>
    </Layout>
  );
}
