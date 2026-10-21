import Link from "next/link";

import { LEARNER_REQUEST_HREF, audience, tutorCta } from "./content";
import { ArrowUpRight, Check } from "./icons";
import styles from "./landing.module.css";

export function Audience() {
  return (
    <section
      className={styles.audience}
      id="danh-cho-ai"
      aria-labelledby="audience-title"
    >
      <div className={styles.shell}>
        <span className={styles.sectionNo}>{audience.label}</span>
        <h2 id="audience-title" data-reveal>
          {audience.title[0]} <em>{audience.title[1]}</em>
        </h2>
        <ol className={styles.audienceList}>
          {audience.groups.map((group) => {
            const isTutor = group.id === "tutor";
            return (
              <li key={group.id} className={styles.audienceRow} data-reveal>
                <div
                  className={styles.audienceArt}
                  data-hue={group.hue}
                  aria-hidden="true"
                >
                  <span className={styles.audienceBlob} />
                  <span
                    className={`${styles.audienceBlob} ${styles.audienceBlobB}`}
                  />
                  <div className={styles.glassPanel}>
                    <small>{group.panelLabel}</small>
                    {group.panelRows.map((row) => (
                      <div key={row.label}>
                        <span>{row.label}</span>
                        <strong data-check={row.check ? "true" : undefined}>
                          {row.check && <Check />}
                          {row.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.audienceCopy}>
                  <h3>
                    {group.titleStrong}{" "}
                    <span className={styles.audienceSoft}>
                      {group.titleSoft}
                    </span>
                  </h3>
                  <p>{group.text}</p>
                  {!isTutor && (
                    <Link
                      className={styles.audienceLink}
                      href={LEARNER_REQUEST_HREF}
                    >
                      Gửi yêu cầu tìm gia sư <ArrowUpRight />
                    </Link>
                  )}
                  {isTutor && (
                    <Link
                      className={`${styles.audienceLink} ${styles.audienceLinkAlt}`}
                      href={tutorCta.href}
                    >
                      {tutorCta.label} <ArrowUpRight />
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
