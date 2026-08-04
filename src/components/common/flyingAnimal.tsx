import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store";
import css from "./flyingAnimal.module.scss";

/**
 * A rare easter egg: every once in a while a cute animal glides across the
 * screen, Asana-celebration style. Only shown to signed-in users. Purely
 * decorative — hidden from screen readers, ignores pointer events, and
 * disabled entirely for users who prefer reduced motion.
 */

type AnimalKind = "bear" | "hippo" | "mammoth" | "clownfish" | "dog" | "cat" | "polarBear" | "cheetah";

const ANIMALS: AnimalKind[] = ["bear", "hippo", "mammoth", "clownfish", "dog", "cat", "polarBear", "cheetah"];

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

const ANIMAL_COMPONENTS: Record<AnimalKind, FC> = {
    bear: Bear,
    hippo: Hippo,
    mammoth: Mammoth,
    clownfish: Clownfish,
    dog: Dog,
    cat: Cat,
    polarBear: PolarBear,
    cheetah: Cheetah,
};

export const FlyingAnimal: FC = () => {
    const currentUser = useSelector(selectCurrentUser);
    const isLoggedIn = currentUser !== undefined;
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
        if (!isLoggedIn) {
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
    }, [isLoggedIn, startFlight]);

    if (!isLoggedIn || flight === null) {
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
