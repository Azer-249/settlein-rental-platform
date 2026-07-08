import { useRef, useState } from "react";
import { motion } from "motion/react";
import hero1 from "../../assets/hero1.jpg";
import hero2 from "../../assets/hero2.jpg";
import hero3 from "../../assets/hero3.jpg";
import hero4 from "../../assets/hero4.jpg";
import hero5 from "../../assets/hero5.jpg";
import "./Hero.css";

const heroCards = [
  {
    title: "Bright apartment",
    location: "Tbilisi, Saburtalo",
    rent: "GEL 1,200",
    rooms: "2 rooms",
    size: "75 m²",
    image: hero1,
    rotate: "-8deg",
    top: "18%",
    left: "18%",
    className: "initial-hero-card-large",
  },
  {
    title: "Quiet city home",
    location: "Tbilisi, Vake",
    rent: "GEL 1,650",
    rooms: "3 rooms",
    size: "98 m²",
    image: hero2,
    rotate: "7deg",
    top: "14%",
    left: "42%",
    className: "initial-hero-card-wide",
  },
  {
    title: "Cozy studio",
    location: "Tbilisi, Vera",
    rent: "GEL 850",
    rooms: "Studio",
    size: "42 m²",
    image: hero3,
    rotate: "11deg",
    top: "23%",
    left: "66%",
    className: "initial-hero-card-medium",
  },
  {
    title: "Sunny flat",
    location: "Batumi, Old Batumi",
    rent: "GEL 1,100",
    rooms: "2 rooms",
    size: "64 m²",
    image: hero4,
    rotate: "5deg",
    top: "52%",
    left: "30%",
    className: "initial-hero-card-medium",
  },
  {
    title: "Calm rental",
    location: "Tbilisi, Vera",
    rent: "GEL 980",
    rooms: "1 room",
    size: "48 m²",
    image: hero5,
    rotate: "-6deg",
    top: "48%",
    left: "56%",
    className: "initial-hero-card-small",
  },
];

function InitialHero() {
  const containerRef = useRef(null);

  return (
    <section className="initial-hero" aria-label="SettleIn introduction">
      <h1 className="initial-hero-title">
        <span>Settle</span>
        <span>In</span>
      </h1>

      <div className="initial-hero-cards" ref={containerRef}>
        {heroCards.map((card) => (
          <DraggableHeroCard
            key={`${card.title}-${card.top}-${card.left}`}
            card={card}
            containerRef={containerRef}
          />
        ))}
      </div>
    </section>
  );
}

function DraggableHeroCard({ card, containerRef }) {
  const [zIndex, setZIndex] = useState(1);

  function bringToFront() {
    const cards = document.querySelectorAll(".initial-drag-card");
    let highestZIndex = 1;

    cards.forEach((cardElement) => {
      const currentZIndex = Number(window.getComputedStyle(cardElement).zIndex);

      if (!Number.isNaN(currentZIndex) && currentZIndex > highestZIndex) {
        highestZIndex = currentZIndex;
      }
    });

    setZIndex(highestZIndex + 1);
  }

  return (
    <motion.article
      className={`initial-drag-card preview-card ${card.className}`}
      style={{
        top: card.top,
        left: card.left,
        rotate: card.rotate,
        zIndex,
      }}
      onMouseDown={bringToFront}
      onTouchStart={bringToFront}
      drag
      dragConstraints={containerRef}
      dragElastic={0.45}
    >
      <div className="preview-card-image">
        <img src={card.image} alt={card.title} draggable={false} />
        <span>{card.rent}</span>
      </div>

      <div className="preview-card-body">
        <h2>{card.title}</h2>
        <p>{card.location}</p>

        <div className="preview-card-meta">
          <span>{card.rooms}</span>
          <span>{card.size}</span>
        </div>
      </div>
    </motion.article>
  );
}

export default InitialHero;
