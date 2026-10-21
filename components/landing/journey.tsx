"use client";

import { useEffect, useRef, useState } from "react";

import { journey } from "./content";
import { journeyScenes } from "./journey-scenes";
import styles from "./landing.module.css";
import { useReducedMotion } from "./use-reduced-motion";

const STEP_COUNT = journey.steps.length;

/**
 * Scroll-driven story: the section is several viewports tall and a sticky
 * stage swaps scenes as the visitor scrolls. With reduced motion the steps
 * are rendered as a static list instead.
 */
export function Journey() {
  const reduced = useReducedMotion();

  return (
    <section
      className={styles.journey}
      id="quy-trinh"
      aria-labelledby="journey-title"
    >
      <div className={`${styles.shell} ${styles.journeyHeading}`}>
        <span className={styles.sectionNo}>{journey.label}</span>
        <h2 id="journey-title">
          {journey.title[0]}
          <br />
          {journey.title[1]}
        </h2>
        <p>{journey.intro}</p>
      </div>
      {reduced ? <StaticSteps /> : <ScrollStory />}
    </section>
  );
}

function StaticSteps() {
  return (
    <ol className={`${styles.shell} ${styles.staticSteps}`}>
      {journey.steps.map((step, index) => {
        const Scene = journeyScenes[index];
        return (
          <li key={step.id} className={styles.staticStep}>
            <div>
              <span className={styles.stepCountSmall}>0{index + 1}</span>
              <small className={styles.stepActor}>{step.actor}</small>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
            <div className={styles.staticStage} aria-hidden="true">
              <div className={styles.stageAura} />
              <div className={`${styles.scene} ${styles.sceneStatic}`}>
                <Scene />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ScrollStory() {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = container.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const distance = Math.max(element.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      setActive(Math.min(STEP_COUNT - 1, Math.floor(progress * STEP_COUNT)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goTo = (index: number) => {
    const element = container.current;
    if (!element) return;
    const start = element.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(element.offsetHeight - window.innerHeight, 1);
    window.scrollTo({
      top: start + (distance * (index + 0.5)) / STEP_COUNT,
      behavior: "smooth",
    });
  };

  return (
    <div ref={container} className={styles.journeyScroll}>
      <div className={`${styles.shell} ${styles.journeySticky}`}>
        <div className={styles.journeyCopy}>
          <div className={styles.stepCount} aria-hidden="true">
            <b>0{active + 1}</b>
            <span>/ 0{STEP_COUNT}</span>
          </div>
          <ol className={styles.stepList}>
            {journey.steps.map((step, index) => (
              <li
                key={step.id}
                className={styles.stepCopy}
                data-active={index === active}
              >
                <small className={styles.stepActor}>{step.actor}</small>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className={styles.stepIndicators}>
            {journey.steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                data-active={index === active}
                aria-current={index === active ? "step" : undefined}
                aria-label={`Bước ${index + 1}: ${step.title}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </div>
        <div className={styles.journeyStage} aria-hidden="true">
          <div className={styles.stageAura} />
          <div className={styles.stageLine} />
          {journeyScenes.map((Scene, index) => (
            <div
              key={index}
              className={styles.scene}
              data-scene={index}
              data-active={index === active}
            >
              <Scene />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
