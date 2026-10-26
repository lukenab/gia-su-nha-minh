import { Check } from "@/components/landing/icons";

import styles from "./form.module.css";

export function FormAside({
  eyebrow,
  title,
  highlight,
  text,
  points,
}: {
  eyebrow?: string;
  title: string;
  highlight: string;
  text: string;
  points: { title: string; text: string }[];
}) {
  return (
    <aside className={styles.aside} data-has-eyebrow={Boolean(eyebrow)}>
      {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
      <h1>
        {title} <em>{highlight}</em>
      </h1>
      <p>{text}</p>
      <ul className={styles.points}>
        {points.map((point) => (
          <li key={point.title}>
            <span aria-hidden="true">
              <Check />
            </span>
            <div>
              <strong>{point.title}</strong>
              <small>{point.text}</small>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
