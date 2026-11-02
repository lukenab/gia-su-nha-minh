import Image from "next/image";
import Link from "next/link";

import logoHorizontal from "@/features/landing/brand/logo-horizontal.png";
import logoMark from "@/features/landing/brand/logo-mark.png";

import styles from "./landing.module.css";

/** Original public-facing brand identity. Admin branding is maintained separately. */
export function BrandLogo({
  variant = "header",
  label = "Gia Sư Nhà Mình, về trang chủ",
}: {
  variant?: "header" | "footer";
  label?: string;
}) {
  return (
    <Link
      href="/"
      className={variant === "footer" ? styles.logoFooter : styles.logoHeader}
      aria-label={label}
    >
      <Image
        src={logoHorizontal}
        alt=""
        priority={variant === "header"}
        sizes="200px"
      />
    </Link>
  );
}

/** Logo mark (house and two readers) for small UI illustrations. */
export function BrandMark({ className = "" }: { className?: string }) {
  return <Image className={className} src={logoMark} alt="" sizes="64px" />;
}
