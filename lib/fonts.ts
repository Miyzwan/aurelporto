import { Inter, Instrument_Serif } from "next/font/google";

/**
 * Type pairing per PRD §9: an editorial serif for statements and project
 * titles, a neutral grotesk for technical information and metadata.
 *
 * Both families are SIL Open Font License and are self-hosted by `next/font`
 * at build time — no third-party request at runtime and no unlicensed font
 * binary committed to the repository.
 */
export const editorialSerif = Instrument_Serif({
  variable: "--font-editorial-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const neutralSans = Inter({
  variable: "--font-neutral-sans",
  subsets: ["latin"],
  display: "swap",
});
