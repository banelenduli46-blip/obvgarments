import { motion } from "framer-motion";
import { WordSlide } from "../components/WordSlide.jsx";

const STORY = [
  "OBVGANG began with a simple belief: our starting point does not define how far we can go. Rooted in African energy and shaped by a global outlook, we make streetwear for people who move with purpose and write their own story.",
  "We are for the builders, dreamers and everyday originals who keep showing up for the life they want. The road is rarely straight; the detours, people and small wins along the way are part of what makes the journey worth wearing.",
  "Every piece is designed to live beyond a single season: expressive enough to say something, comfortable enough to take you everywhere. OBVGANG is more than a label; it is a reminder to back your vision, share good energy and make space for others on the way up.",
  "Wherever you are on your journey, you belong here. This is African roots, global vision — and the next chapter is yours to make."
];

export default function Story() {
  return (
    <section className="members-page story-members-page">
      <motion.div
        className="members-page-card story-page-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .7 }}
      >
        <p className="home-kicker">African roots · Global vision</p>
        <WordSlide as="h1" className="home-section-title" text="More than clothing." immediate />
        <img className="story-page-card-image" src="/images/more-than-clothing.jpeg" alt="OBVGANG mark being placed on a wall" />
        <div className="story-page-text">
          {STORY.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="story-point-of-view-copy">
          <p className="home-kicker">The OBVGANG point of view</p>
          <WordSlide as="h2" className="home-section-title" text="Stories live beyond the straight line." />
          <p>Good energy, unexpected turns and the people who make the road worth taking. We believe what you wear should move with your life—not ask you to follow a script.</p>
          <p>Our point of view is rooted in African creativity and open to the world: a shared belief in making your own way, taking pride in where you come from and bringing others along as you grow.</p>
          <img className="story-page-card-image" src="/images/statement.jpg" alt="A visual statement on taking the unexpected route" loading="lazy" />
        </div>
      </motion.div>
    </section>
  );
}
