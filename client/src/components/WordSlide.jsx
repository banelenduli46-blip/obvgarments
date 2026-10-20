import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Each word slides up out of a mask, one after another.
// Use `immediate` for above-the-fold headings; otherwise words animate when scrolled into view.
export function WordSlide({ text, as: Tag = "h2", className = "", delay = 0, stagger = 0.075, immediate = false }) {
  const words = text.split(" ");
  const reveal = {
    initial: { y: "110%" },
    transition: (i) => ({ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: delay + i * stagger })
  };
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span className="ws-line" key={`${word}-${i}`} aria-hidden="true">
          <motion.span
            className="ws-word"
            initial={reveal.initial}
            {...(immediate
              ? { animate: { y: 0 }, transition: reveal.transition(i) }
              : { whileInView: { y: 0 }, viewport: { once: true, amount: 0.6 }, transition: reveal.transition(i) })}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

// Swaps through words on a loop, sliding each one in and out.
export function RotatingWord({ words, interval = 2600 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span className="rot">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          className="rot-inner"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
