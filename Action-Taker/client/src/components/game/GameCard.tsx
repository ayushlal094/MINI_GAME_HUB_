import { Link } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  stats?: string;
}

export function GameCard({ title, description, href, icon: Icon, color, stats }: GameCardProps) {
  return (
    <Link href={href} className="block group h-full">
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-full"
      >
        <Card className="h-full overflow-hidden border-2 border-transparent hover:border-primary/20 bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
          <div className={`h-2 w-full ${color}`} />
          <CardHeader>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base mt-2">{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>{stats}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="mt-auto pt-6">
            <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              Play Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
