import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsFlyingAnimalEnabled } from "../../store";
import css from "./flyingAnimal.module.scss";

/**
 * A rare easter egg: every once in a while a cute animal glides across the
 * screen, Asana-celebration style. Only shown to signed-in users, and each
 * user can turn it off for themselves from the user menu. Purely
 * decorative — hidden from screen readers, ignores pointer events, and
 * disabled entirely for users who prefer reduced motion.
 */

type AnimalKind =
    | "bear"
    | "hippo"
    | "mammoth"
    | "clownfish"
    | "dog"
    | "cat"
    | "polarBear"
    | "cheetah"
    | "deer"
    | "rabbit"
    | "tortoise"
    | "giraffe";

const ANIMALS: AnimalKind[] = [
    "bear",
    "hippo",
    "mammoth",
    "clownfish",
    "dog",
    "cat",
    "polarBear",
    "cheetah",
    "deer",
    "rabbit",
    "tortoise",
    "giraffe",
];

// A welcome flight shortly after the page loads, then randomly roughly every
// 3-8 minutes of an open session. Every delay is drawn fresh, so no two
// sessions have the same rhythm.
const MIN_INITIAL_DELAY_MS = 2000;
const MAX_INITIAL_DELAY_MS = 6000;
const MIN_DELAY_MS = 3 * 60 * 1000;
const MAX_DELAY_MS = 8 * 60 * 1000;

// A leisurely glide: slow enough to notice and follow across the screen.
const MIN_FLIGHT_DURATION_MS = 5000;
const MAX_FLIGHT_DURATION_MS = 8000;

interface Flight {
    id: number;
    animal: AnimalKind;
    topPercent: number;
    isReverse: boolean;
    durationMs: number;
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const Bear: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <circle cx="42" cy="28" r="10" fill="#a9743f" />
        <circle cx="78" cy="28" r="10" fill="#a9743f" />
        <circle cx="42" cy="28" r="5" fill="#d9a86b" />
        <circle cx="78" cy="28" r="5" fill="#d9a86b" />
        <ellipse cx="60" cy="78" rx="24" ry="18" fill="#a9743f" />
        <ellipse cx="60" cy="83" rx="13" ry="9" fill="#d9a86b" />
        <circle cx="42" cy="90" r="7" fill="#96632f" />
        <circle cx="78" cy="90" r="7" fill="#96632f" />
        <circle cx="60" cy="46" r="26" fill="#a9743f" />
        <ellipse cx="60" cy="56" rx="11" ry="8" fill="#e8c39a" />
        <ellipse cx="60" cy="52" rx="4.5" ry="3.5" fill="#4a2f17" />
        <path d="M53 57 Q60 63 67 57" stroke="#4a2f17" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="48" cy="43" r="3" fill="#2f2013" />
        <circle cx="72" cy="43" r="3" fill="#2f2013" />
        <circle cx="49" cy="42" r="1" fill="#ffffff" />
        <circle cx="73" cy="42" r="1" fill="#ffffff" />
        <ellipse cx="41" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="79" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Hippo: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <circle cx="44" cy="26" r="7" fill="#8f9fd6" />
        <circle cx="76" cy="26" r="7" fill="#8f9fd6" />
        <circle cx="44" cy="26" r="3.5" fill="#b7c3ee" />
        <circle cx="76" cy="26" r="3.5" fill="#b7c3ee" />
        <ellipse cx="60" cy="78" rx="25" ry="19" fill="#8f9fd6" />
        <ellipse cx="60" cy="84" rx="13" ry="9" fill="#b7c3ee" />
        <circle cx="42" cy="91" r="7" fill="#7d8cc4" />
        <circle cx="78" cy="91" r="7" fill="#7d8cc4" />
        <circle cx="60" cy="44" r="25" fill="#8f9fd6" />
        <circle cx="50" cy="34" r="3" fill="#2b2b45" />
        <circle cx="70" cy="34" r="3" fill="#2b2b45" />
        <circle cx="51" cy="33" r="1" fill="#ffffff" />
        <circle cx="71" cy="33" r="1" fill="#ffffff" />
        <ellipse cx="60" cy="54" rx="18" ry="13" fill="#b7c3ee" />
        <ellipse cx="53" cy="51" rx="3" ry="3.8" fill="#5c6698" />
        <ellipse cx="67" cy="51" rx="3" ry="3.8" fill="#5c6698" />
        <path d="M52 61 Q60 66 68 61" stroke="#5c6698" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <rect x="53" y="62" width="4.5" height="6" rx="1.5" fill="#ffffff" />
        <rect x="62.5" y="62" width="4.5" height="6" rx="1.5" fill="#ffffff" />
        <ellipse cx="39" cy="44" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="81" cy="44" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Clownfish: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <path d="M34 58 L14 42 C9 58, 9 58, 14 74 Z" fill="#f77f3f" stroke="#2f2f2f" strokeWidth="1.5" />
        <path d="M50 40 C54 28, 70 28, 74 40 Z" fill="#f77f3f" stroke="#2f2f2f" strokeWidth="1.5" />
        <ellipse cx="62" cy="58" rx="30" ry="22" fill="#f77f3f" />
        <path
            d="M54 38 C48 50, 48 66, 54 78 L63 78 C57 66, 57 50, 63 38 Z"
            fill="#ffffff"
            stroke="#2f2f2f"
            strokeWidth="1.5"
        />
        <path
            d="M78 42 C74 52, 74 64, 78 74 L85 71 C82 62, 82 54, 85 45 Z"
            fill="#ffffff"
            stroke="#2f2f2f"
            strokeWidth="1.5"
        />
        <path d="M64 58 C58 64, 58 72, 66 75 C71 69, 71 63, 64 58 Z" fill="#fca25f" stroke="#2f2f2f" strokeWidth="1.5" />
        <circle cx="88" cy="50" r="4.5" fill="#ffffff" />
        <circle cx="89" cy="50" r="2.5" fill="#222222" />
        <path d="M82 63 Q86 67 90 62" stroke="#7a3413" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="84" cy="57" rx="3.5" ry="2.2" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Dog: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <path d="M38 26 C26 30, 24 48, 32 54 C38 58, 44 52, 42 38 Z" fill="#c2854f" />
        <path d="M82 26 C94 30, 96 48, 88 54 C82 58, 76 52, 78 38 Z" fill="#c2854f" />
        <ellipse cx="60" cy="78" rx="24" ry="18" fill="#d9a05f" />
        <ellipse cx="60" cy="83" rx="13" ry="9" fill="#f0d5ae" />
        <circle cx="42" cy="90" r="7" fill="#c2854f" />
        <circle cx="78" cy="90" r="7" fill="#c2854f" />
        <circle cx="60" cy="46" r="26" fill="#d9a05f" />
        <ellipse cx="60" cy="56" rx="11" ry="8" fill="#f0d5ae" />
        <ellipse cx="60" cy="51" rx="4.5" ry="3.5" fill="#3d2c1e" />
        <path d="M53 56 Q60 62 67 56" stroke="#3d2c1e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <ellipse cx="64" cy="63" rx="3" ry="4" fill="#f08a9b" />
        <circle cx="48" cy="43" r="3" fill="#2f2013" />
        <circle cx="72" cy="43" r="3" fill="#2f2013" />
        <circle cx="49" cy="42" r="1" fill="#ffffff" />
        <circle cx="73" cy="42" r="1" fill="#ffffff" />
        <ellipse cx="41" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="79" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Cat: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <path d="M38 34 L32 12 L54 22 Z" fill="#f0a868" />
        <path d="M82 34 L88 12 L66 22 Z" fill="#f0a868" />
        <path d="M40 29 L37 18 L48 23 Z" fill="#f7cfae" />
        <path d="M80 29 L83 18 L72 23 Z" fill="#f7cfae" />
        <ellipse cx="60" cy="78" rx="24" ry="18" fill="#f0a868" />
        <ellipse cx="60" cy="83" rx="13" ry="9" fill="#fde8d2" />
        <circle cx="42" cy="90" r="7" fill="#e0913f" />
        <circle cx="78" cy="90" r="7" fill="#e0913f" />
        <circle cx="60" cy="46" r="26" fill="#f0a868" />
        <path
            d="M52 25 L52 31 M60 23 L60 29 M68 25 L68 31"
            stroke="#d98a3f"
            strokeWidth="2.4"
            strokeLinecap="round"
        />
        <ellipse cx="60" cy="57" rx="10" ry="7" fill="#fde8d2" />
        <path d="M57 52 L63 52 L60 56 Z" fill="#e87b90" />
        <path
            d="M54 57 Q57 61 60 58 Q63 61 66 57"
            stroke="#a3622a"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
        />
        <path
            d="M47 54 L35 52 M47 58 L36 61 M73 54 L85 52 M73 58 L84 61"
            stroke="#d98a3f"
            strokeWidth="1.4"
            strokeLinecap="round"
        />
        <circle cx="48" cy="44" r="3" fill="#3a5a2a" />
        <circle cx="72" cy="44" r="3" fill="#3a5a2a" />
        <circle cx="49" cy="43" r="1" fill="#ffffff" />
        <circle cx="73" cy="43" r="1" fill="#ffffff" />
        <ellipse cx="41" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="79" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const PolarBear: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <circle cx="42" cy="28" r="10" fill="#eef3f8" stroke="#c3d3e2" strokeWidth="1.5" />
        <circle cx="78" cy="28" r="10" fill="#eef3f8" stroke="#c3d3e2" strokeWidth="1.5" />
        <circle cx="42" cy="28" r="5" fill="#d7e3ee" />
        <circle cx="78" cy="28" r="5" fill="#d7e3ee" />
        <ellipse cx="60" cy="78" rx="24" ry="18" fill="#eef3f8" stroke="#c3d3e2" strokeWidth="1.5" />
        <ellipse cx="60" cy="83" rx="13" ry="9" fill="#d7e3ee" />
        <circle cx="42" cy="90" r="7" fill="#cfdde9" />
        <circle cx="78" cy="90" r="7" fill="#cfdde9" />
        <circle cx="60" cy="46" r="26" fill="#eef3f8" stroke="#c3d3e2" strokeWidth="1.5" />
        <ellipse cx="60" cy="56" rx="11" ry="8" fill="#d7e3ee" />
        <ellipse cx="60" cy="52" rx="4.5" ry="3.5" fill="#33414f" />
        <path d="M53 57 Q60 63 67 57" stroke="#33414f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="48" cy="43" r="3" fill="#2b3946" />
        <circle cx="72" cy="43" r="3" fill="#2b3946" />
        <circle cx="49" cy="42" r="1" fill="#ffffff" />
        <circle cx="73" cy="42" r="1" fill="#ffffff" />
        <ellipse cx="41" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="79" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Cheetah: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <circle cx="42" cy="27" r="9" fill="#e8b04e" />
        <circle cx="78" cy="27" r="9" fill="#e8b04e" />
        <circle cx="42" cy="27" r="4.5" fill="#8a5a24" />
        <circle cx="78" cy="27" r="4.5" fill="#8a5a24" />
        <ellipse cx="60" cy="78" rx="24" ry="18" fill="#e8b04e" />
        <ellipse cx="60" cy="83" rx="13" ry="9" fill="#f7e7c8" />
        <circle cx="42" cy="90" r="7" fill="#cf9a3f" />
        <circle cx="78" cy="90" r="7" fill="#cf9a3f" />
        <circle cx="60" cy="46" r="26" fill="#e8b04e" />
        <circle cx="44" cy="30" r="1.8" fill="#6b4a1f" />
        <circle cx="52" cy="25" r="1.8" fill="#6b4a1f" />
        <circle cx="68" cy="25" r="1.8" fill="#6b4a1f" />
        <circle cx="76" cy="30" r="1.8" fill="#6b4a1f" />
        <circle cx="40" cy="40" r="1.8" fill="#6b4a1f" />
        <circle cx="80" cy="40" r="1.8" fill="#6b4a1f" />
        <circle cx="60" cy="30" r="1.8" fill="#6b4a1f" />
        <circle cx="42" cy="72" r="1.8" fill="#6b4a1f" />
        <circle cx="78" cy="72" r="1.8" fill="#6b4a1f" />
        <circle cx="48" cy="80" r="1.8" fill="#6b4a1f" />
        <circle cx="72" cy="80" r="1.8" fill="#6b4a1f" />
        <ellipse cx="60" cy="57" rx="10" ry="7" fill="#f7e7c8" />
        <ellipse cx="60" cy="53" rx="4" ry="3" fill="#3d2a12" />
        <path d="M54 57 Q60 62 66 57" stroke="#3d2a12" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M48 46 C47 51, 45 54, 43 57" stroke="#4a3010" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M72 46 C73 51, 75 54, 77 57" stroke="#4a3010" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="48" cy="43" r="3" fill="#3f2c10" />
        <circle cx="72" cy="43" r="3" fill="#3f2c10" />
        <circle cx="49" cy="42" r="1" fill="#ffffff" />
        <circle cx="73" cy="42" r="1" fill="#ffffff" />
    </svg>
);

const Mammoth: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <circle cx="38" cy="34" r="8" fill="#9c5a3c" />
        <circle cx="82" cy="34" r="8" fill="#9c5a3c" />
        <circle cx="38" cy="34" r="4" fill="#c98a5e" />
        <circle cx="82" cy="34" r="4" fill="#c98a5e" />
        <circle cx="52" cy="23" r="6" fill="#9c5a3c" />
        <circle cx="60" cy="20" r="7" fill="#9c5a3c" />
        <circle cx="68" cy="23" r="6" fill="#9c5a3c" />
        <ellipse cx="60" cy="78" rx="24" ry="18" fill="#9c5a3c" />
        <ellipse cx="60" cy="83" rx="13" ry="9" fill="#c98a5e" />
        <circle cx="42" cy="90" r="7" fill="#84492e" />
        <circle cx="78" cy="90" r="7" fill="#84492e" />
        <circle cx="60" cy="46" r="26" fill="#9c5a3c" />
        <path d="M52 58 C46 62, 44 68, 47 72" stroke="#f3e9d8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M68 58 C74 62, 76 68, 73 72" stroke="#f3e9d8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M60 54 C60 63, 58 69, 52 73" stroke="#b0714a" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path
            d="M58 61 L62 62 M56 66 L60 68"
            stroke="#8a4d30"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.7"
        />
        <circle cx="48" cy="43" r="3" fill="#3a2417" />
        <circle cx="72" cy="43" r="3" fill="#3a2417" />
        <circle cx="49" cy="42" r="1" fill="#ffffff" />
        <circle cx="73" cy="42" r="1" fill="#ffffff" />
        <ellipse cx="40" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="80" cy="52" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Deer: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <path
            d="M50 30 L44 12 M45 20 L35 15 M44 12 L37 5 M70 30 L76 12 M75 20 L85 15 M76 12 L83 5"
            stroke="#8a5a2b"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
        />
        <ellipse cx="34" cy="40" rx="9" ry="5.5" fill="#b5793f" transform="rotate(-18 34 40)" />
        <ellipse cx="86" cy="40" rx="9" ry="5.5" fill="#b5793f" transform="rotate(18 86 40)" />
        <ellipse cx="35" cy="40" rx="5" ry="2.8" fill="#e8b58a" transform="rotate(-18 35 40)" />
        <ellipse cx="85" cy="40" rx="5" ry="2.8" fill="#e8b58a" transform="rotate(18 85 40)" />
        <ellipse cx="60" cy="80" rx="23" ry="17" fill="#c08a4e" />
        <ellipse cx="60" cy="85" rx="12" ry="8.5" fill="#f0d9b5" />
        <circle cx="49" cy="73" r="2.4" fill="#f0d9b5" />
        <circle cx="71" cy="73" r="2.4" fill="#f0d9b5" />
        <circle cx="60" cy="69" r="2.4" fill="#f0d9b5" />
        <circle cx="43" cy="90" r="6.5" fill="#a97239" />
        <circle cx="77" cy="90" r="6.5" fill="#a97239" />
        <circle cx="60" cy="50" r="24" fill="#c08a4e" />
        <ellipse cx="60" cy="60" rx="10" ry="7.5" fill="#f0d9b5" />
        <ellipse cx="60" cy="56" rx="4" ry="3" fill="#3f2a16" />
        <path d="M54 61 Q60 66 66 61" stroke="#3f2a16" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="49" cy="47" r="3" fill="#2f2013" />
        <circle cx="71" cy="47" r="3" fill="#2f2013" />
        <circle cx="50" cy="46" r="1" fill="#ffffff" />
        <circle cx="72" cy="46" r="1" fill="#ffffff" />
        <ellipse cx="42" cy="56" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="78" cy="56" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Rabbit: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <ellipse cx="50" cy="26" rx="6.5" ry="19" fill="#dcd7e4" transform="rotate(-10 50 26)" />
        <ellipse cx="70" cy="26" rx="6.5" ry="19" fill="#dcd7e4" transform="rotate(10 70 26)" />
        <ellipse cx="50" cy="27" rx="3.4" ry="14" fill="#f3c3cf" transform="rotate(-10 50 27)" />
        <ellipse cx="70" cy="27" rx="3.4" ry="14" fill="#f3c3cf" transform="rotate(10 70 27)" />
        <ellipse cx="60" cy="80" rx="23" ry="17" fill="#dcd7e4" />
        <ellipse cx="60" cy="85" rx="12" ry="8.5" fill="#f5f2f8" />
        <circle cx="43" cy="90" r="6.5" fill="#c9c3d4" />
        <circle cx="77" cy="90" r="6.5" fill="#c9c3d4" />
        <circle cx="60" cy="52" r="24" fill="#dcd7e4" />
        <ellipse cx="53" cy="60" rx="8" ry="6.5" fill="#f5f2f8" />
        <ellipse cx="67" cy="60" rx="8" ry="6.5" fill="#f5f2f8" />
        <path d="M56.5 55 L63.5 55 L60 59 Z" fill="#e87b90" />
        <path
            d="M60 59 L60 62 M60 62 Q56.5 65 53.5 62 M60 62 Q63.5 65 66.5 62"
            stroke="#8d86a0"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
        />
        <rect x="56.4" y="63.5" width="3.2" height="5" rx="1.2" fill="#ffffff" />
        <rect x="60.4" y="63.5" width="3.2" height="5" rx="1.2" fill="#ffffff" />
        <path
            d="M46 58 L34 55 M46 62 L35 65 M74 58 L86 55 M74 62 L85 65"
            stroke="#b8b1c6"
            strokeWidth="1.4"
            strokeLinecap="round"
        />
        <circle cx="49" cy="47" r="3" fill="#3b2f4a" />
        <circle cx="71" cy="47" r="3" fill="#3b2f4a" />
        <circle cx="50" cy="46" r="1" fill="#ffffff" />
        <circle cx="72" cy="46" r="1" fill="#ffffff" />
        <ellipse cx="42" cy="55" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="78" cy="55" rx="4" ry="2.5" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Tortoise: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <ellipse cx="32" cy="76" rx="9" ry="5.5" fill="#8fbf63" transform="rotate(-14 32 76)" />
        <ellipse cx="88" cy="76" rx="9" ry="5.5" fill="#8fbf63" transform="rotate(14 88 76)" />
        <circle cx="36" cy="94" r="6.5" fill="#7dab52" />
        <circle cx="84" cy="94" r="6.5" fill="#7dab52" />
        <ellipse cx="60" cy="78" rx="31" ry="23" fill="#c78c3f" />
        <ellipse cx="60" cy="85" rx="26" ry="12" fill="#e2b878" />
        <polygon points="60,60 71,67 71,80 60,87 49,80 49,67" fill="#a26f2a" opacity="0.75" />
        <polygon points="37,71 47,66 47,79 39,82" fill="#a26f2a" opacity="0.75" />
        <polygon points="83,71 73,66 73,79 81,82" fill="#a26f2a" opacity="0.75" />
        <ellipse cx="60" cy="78" rx="31" ry="23" fill="none" stroke="#8a5c22" strokeWidth="2" />
        <circle cx="60" cy="38" r="19" fill="#8fbf63" />
        <ellipse cx="60" cy="45" rx="8.5" ry="6" fill="#bcdd93" />
        <circle cx="56.5" cy="43" r="1.4" fill="#4f6b2c" />
        <circle cx="63.5" cy="43" r="1.4" fill="#4f6b2c" />
        <path d="M55 48 Q60 52 65 48" stroke="#4f6b2c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="52" cy="34" r="2.8" fill="#2f3d1c" />
        <circle cx="68" cy="34" r="2.8" fill="#2f3d1c" />
        <circle cx="53" cy="33" r="1" fill="#ffffff" />
        <circle cx="69" cy="33" r="1" fill="#ffffff" />
        <ellipse cx="45" cy="42" rx="3.5" ry="2.2" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="75" cy="42" rx="3.5" ry="2.2" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const Giraffe: FC = () => (
    <svg className={css.animalSvg} viewBox="0 0 120 110" aria-hidden="true">
        <circle cx="44" cy="96" r="6.5" fill="#d9a441" />
        <circle cx="76" cy="96" r="6.5" fill="#d9a441" />
        <ellipse cx="60" cy="84" rx="24" ry="18" fill="#f0bf5f" />
        <circle cx="46" cy="76" r="4" fill="#b5762a" opacity="0.65" />
        <circle cx="74" cy="78" r="4.5" fill="#b5762a" opacity="0.65" />
        <circle cx="60" cy="72" r="3.5" fill="#b5762a" opacity="0.65" />
        <ellipse cx="60" cy="89" rx="12" ry="8.5" fill="#fbe6bb" />
        <rect x="51" y="36" width="18" height="44" rx="9" fill="#f0bf5f" />
        <circle cx="56" cy="48" r="3.4" fill="#b5762a" opacity="0.65" />
        <circle cx="65" cy="58" r="3.4" fill="#b5762a" opacity="0.65" />
        <circle cx="55" cy="68" r="3" fill="#b5762a" opacity="0.65" />
        <ellipse cx="42" cy="26" rx="7" ry="4" fill="#e2ab45" transform="rotate(-20 42 26)" />
        <ellipse cx="78" cy="26" rx="7" ry="4" fill="#e2ab45" transform="rotate(20 78 26)" />
        <path d="M53 18 L51 9 M67 18 L69 9" stroke="#c9902f" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="51" cy="8" r="3.5" fill="#8a5a24" />
        <circle cx="69" cy="8" r="3.5" fill="#8a5a24" />
        <ellipse cx="60" cy="30" rx="16" ry="14" fill="#f0bf5f" />
        <ellipse cx="60" cy="38" rx="10" ry="7" fill="#fbe6bb" />
        <ellipse cx="56.5" cy="36" rx="1.6" ry="2" fill="#b5762a" />
        <ellipse cx="63.5" cy="36" rx="1.6" ry="2" fill="#b5762a" />
        <path d="M55 41 Q60 45 65 41" stroke="#8a5a24" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="52" cy="26" r="2.8" fill="#4a3312" />
        <circle cx="68" cy="26" r="2.8" fill="#4a3312" />
        <circle cx="53" cy="25" r="1" fill="#ffffff" />
        <circle cx="69" cy="25" r="1" fill="#ffffff" />
        <ellipse cx="46" cy="34" rx="3.5" ry="2.2" fill="#e88a8a" opacity="0.5" />
        <ellipse cx="74" cy="34" rx="3.5" ry="2.2" fill="#e88a8a" opacity="0.5" />
    </svg>
);

const ANIMAL_COMPONENTS: Record<AnimalKind, FC> = {
    bear: Bear,
    hippo: Hippo,
    mammoth: Mammoth,
    clownfish: Clownfish,
    dog: Dog,
    cat: Cat,
    polarBear: PolarBear,
    cheetah: Cheetah,
    deer: Deer,
    rabbit: Rabbit,
    tortoise: Tortoise,
    giraffe: Giraffe,
};

export const FlyingAnimal: FC = () => {
    const isEnabled = useSelector(selectIsFlyingAnimalEnabled);
    const [flight, setFlight] = useState<Flight | null>(null);
    const scheduleTimeoutRef = useRef<number | undefined>(undefined);
    const flightTimeoutRef = useRef<number | undefined>(undefined);
    const nextFlightIdRef = useRef(0);

    const startFlight = useCallback((animal?: AnimalKind) => {
        window.clearTimeout(flightTimeoutRef.current);
        const durationMs = randomBetween(MIN_FLIGHT_DURATION_MS, MAX_FLIGHT_DURATION_MS);
        setFlight({
            id: nextFlightIdRef.current++,
            animal: animal ?? ANIMALS[Math.floor(Math.random() * ANIMALS.length)],
            topPercent: randomBetween(10, 70),
            isReverse: Math.random() < 0.5,
            durationMs,
        });
        flightTimeoutRef.current = window.setTimeout(() => {
            setFlight(null);
        }, durationMs + 500);
    }, []);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }
        const scheduleNext = (delayMs: number) => {
            scheduleTimeoutRef.current = window.setTimeout(() => {
                startFlight();
                scheduleNext(randomBetween(MIN_DELAY_MS, MAX_DELAY_MS));
            }, delayMs);
        };
        scheduleNext(randomBetween(MIN_INITIAL_DELAY_MS, MAX_INITIAL_DELAY_MS));
        // Secret manual trigger, e.g. matektaborFlyingAnimal("hippo") in the console.
        (window as { matektaborFlyingAnimal?: (animal?: AnimalKind) => void }).matektaborFlyingAnimal = startFlight;
        return () => {
            window.clearTimeout(scheduleTimeoutRef.current);
            window.clearTimeout(flightTimeoutRef.current);
            delete (window as { matektaborFlyingAnimal?: (animal?: AnimalKind) => void }).matektaborFlyingAnimal;
            setFlight(null);
        };
    }, [isEnabled, startFlight]);

    if (!isEnabled || flight === null) {
        return null;
    }

    const AnimalComponent = ANIMAL_COMPONENTS[flight.animal];
    const animalClassName = flight.isReverse ? `${css.flyingAnimal} ${css.flyingAnimalReverse}` : css.flyingAnimal;

    return (
        <div className={css.flyingAnimalContainer} aria-hidden="true">
            <div
                key={flight.id}
                className={animalClassName}
                style={{ top: `${flight.topPercent}%`, animationDuration: `${flight.durationMs}ms` }}
            >
                <div className={flight.isReverse ? css.mirrored : undefined}>
                    <div className={css.bobbing}>
                        <div className={`${css.trailLine} ${css.trailLine1}`} />
                        <div className={`${css.trailLine} ${css.trailLine2}`} />
                        <div className={`${css.trailLine} ${css.trailLine3}`} />
                        <AnimalComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};
