import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { WordSlide } from "../components/WordSlide.jsx";

export default function Home() {
  return (
    <div className="storefront">
      <section className="home-hero" id="top">
        <motion.div
          className="home-hero-content"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .9, delay: .15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="home-eyebrow">African roots · Global vision</p>
          <h1 className="home-title">OBVGANG<br />GARMENTS</h1>
          <p className="home-hero-copy">
            Premium streetwear built for people with ambition, vision and a desire to experience more out of life.
          </p>
          <div className="home-actions">
            <Link to="/shop" className="home-button home-button-light">Shop now</Link>
            <Link to="/members" className="home-button home-button-outline">Members only</Link>
          </div>
        </motion.div>
        <a className="home-scroll" href="#trust" aria-label="Scroll down">
          <span aria-hidden="true"></span>
        </a>
      </section>

      <section className="home-trust" id="trust" aria-label="Shopping benefits">
        {["Free local delivery", "Free returns", "Secure checkouts", "Member perks"].map((item) => (
          <div className="home-trust-item" key={item}><span>{item}</span></div>
        ))}
      </section>

      <section className="home-gallery" id="gallery">
        <motion.div
          className="home-lookbook-main"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .2 }}
          transition={{ duration: .8 }}
        >
          <img src="/images/campaign-van.jpg" alt="OBVGANG campaign with friends beside a red van at sunset" loading="lazy" />
        </motion.div>
        <motion.div
          className="home-lookbook-copy"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .25 }}
          transition={{ duration: .75 }}
        >
          <p className="home-eyebrow">Gallery · the OBVGANG point of view</p>
          <WordSlide as="h2" className="home-section-title" text="Made for the journey" />
          <p>Stories from our streets, our community and the unexpected turns that shape us. This is OBVGANG, seen from the inside.</p>
          <Link to="/gallery" className="home-button home-button-dark">Explore the gallery</Link>
        </motion.div>
        <div className="home-lookbook-grid">
          {[
            ["/images/bench.jpg", "Night walks", "Model in OBVGANG tee on a park bench"],
            ["/images/tee-detail.jpg", "Detail", "Close-up of OBVGANG tee branding"],
            ["/images/craft-logo.jpg", "Craft", "Hexagon logo detail on tee"],
            ["/images/wall-sticker.jpg", "Community", "OBVGANG sticker on a wall"]
          ].map(([src, title, alt]) => (
            <motion.figure
              className="home-lookbook-tile"
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .2 }}
              transition={{ duration: .7, delay: .08 }}
            >
              <img src={src} alt={alt} loading="lazy" />
              <figcaption>{title}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      <section className="home-story" id="story">
        <motion.div
          className="home-story-image"
          initial={{ opacity: 0, y: 38 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .2 }}
          transition={{ duration: .8 }}
        >
          <img src="/images/more-than-clothing.jpeg" alt="A member of the OBVGANG team placing the brand mark on a wall" loading="lazy" />
        </motion.div>
        <motion.div
          className="home-story-copy"
          initial={{ opacity: 0, y: 38 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .2 }}
          transition={{ duration: .8, delay: .12 }}
        >
          <p className="home-kicker">Our story</p>
          <WordSlide as="h2" className="home-section-title" text="More than clothing" />
          <a href="#story-copy" className="home-about-link">About us</a>
          <div id="story-copy">
            <p>OBVGANG began with a simple belief: our starting point does not define how far we can go. Rooted in African energy and shaped by a global outlook, we make streetwear for people who move with purpose and write their own story.</p>
            <p>We are for the builders, dreamers and everyday originals who keep showing up for the life they want. The road is rarely straight; the detours, people and small wins along the way are part of what makes the journey worth wearing.</p>
            <p>Every piece is designed to live beyond a single season: expressive enough to say something, comfortable enough to take you everywhere. OBVGANG is more than a label; it is a reminder to back your vision, share good energy and make space for others on the way up.</p>
            <p>Wherever you are on your journey, you belong here. This is African roots, global vision — and the next chapter is yours to make.</p>
          </div>
        </motion.div>
      </section>

      <section className="home-members">
        <div className="home-members-inner">
          <p className="home-kicker">Members only</p>
          <WordSlide as="h2" className="home-section-title" text="Join the inner circle" />
          <ul>
            <li>Member-only discounts on every eligible product</li>
            <li>First access to new drops and restocks</li>
            <li>Invitations to OBVGANG events and collabs</li>
          </ul>
          <div className="home-member-actions">
            <Link className="home-button home-button-light" to="/members">Create account</Link>
            <Link className="home-button home-button-outline" to="/members">Sign in</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
