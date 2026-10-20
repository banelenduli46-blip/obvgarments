import { motion } from "framer-motion";
import { WordSlide } from "../components/WordSlide.jsx";
import Footer from "../components/Footer.jsx";

const images = [
  { src: "/images/bench.jpg", title: "The pause", note: "Make room for the moment.", className: "gallery-frame-tall" },
  { src: "/images/statement.jpg", title: "Our perspective", note: "The best stories take their own route.", className: "gallery-frame-poster" },
  { src: "/images/tee-detail.jpg", title: "The detail", note: "Made with intention.", className: "" },
  { src: "/images/campaign-van.jpg", title: "The people", note: "Better when we move together.", className: "gallery-frame-wide" },
  { src: "/images/wall-sticker.jpg", title: "The mark", note: "Leave your own trace.", className: "" },
  { src: "/images/craft-logo.jpg", title: "The craft", note: "Built to go beyond the season.", className: "" }
];

export default function Gallery() {
  return (
    <div className="gallery-page">
      <section className="gallery-intro">
        <p className="eyebrow">African roots · Global vision</p>
        <WordSlide as="h1" className="section-title" text="The OBVGANG gallery" immediate />
      </section>

      <section className="gallery-grid" aria-label="OBVGANG point of view gallery">
        {images.map((image, index) => (
          <motion.figure
            className={`gallery-frame ${image.className}`}
            key={image.title}
            initial={{ opacity: 0, y: 42, scale: .98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: .18 }}
            transition={{ duration: .8, delay: (index % 2) * .12, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={image.src} alt={image.note} loading="lazy" />
            <figcaption><span>{image.title}</span><small>{image.note}</small></figcaption>
          </motion.figure>
        ))}
      </section>

      <motion.section
        className="gallery-point-of-view"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: .25 }}
        transition={{ duration: .8 }}
      >
        <p className="home-kicker">The OBVGANG point of view</p>
        <WordSlide as="h2" className="home-section-title" text="The journey is the story." />
        <p>We believe style belongs to the life you live in it. Follow the detours, find your people, and make something meaningful of every chapter.</p>
      </motion.section>

      <section className="home-campaign gallery-film" aria-label="OBVGANG campaign film">
        <video autoPlay muted loop playsInline poster="/images/campaign-van.jpg">
          <source src="/images/campaign-ad.mp4" type="video/mp4" />
        </video>
        <div className="home-campaign-copy">
          <p className="home-eyebrow">OBVGANG presents</p>
          <WordSlide as="h2" className="home-campaign-title" text="Season in motion." />
          <p className="gallery-film-copy">A moving portrait of the people, places and perspective behind OBVGANG.</p>
        </div>
        <span className="home-campaign-index">OBV / 001</span>
      </section>
      <Footer />
    </div>
  );
}
