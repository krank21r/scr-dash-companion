import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 0 : 1,
            rotate: theme === "dark" ? 90 : 0,
            opacity: theme === "dark" ? 0 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute"
        >
          <Sun className="h-5 w-5 text-amber-500" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            scale: theme === "dark" ? 1 : 0,
            rotate: theme === "dark" ? 0 : -90,
            opacity: theme === "dark" ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute"
        >
          <Moon className="h-5 w-5 text-blue-400" />
        </motion.div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
