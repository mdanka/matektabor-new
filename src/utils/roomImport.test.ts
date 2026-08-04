import { describe, expect, it } from "vitest";
import { matchNameToPerson, normalizeName, normalizeNameKey, parsePastedRooms } from "./roomImport";
import { IPerson } from "../commons";

const person = (id: string, name: string, group?: string): IPerson => ({ id, name, group });

describe("parsePastedRooms", () => {
    it("parses a header row and columns of names", () => {
        const text = [
            "B (5)\tC (8)\tL₀ (6)",
            "Berkó Domonkos\tKellermann Botond\tPap Kende",
            "Halász Dávid\tRévész Nimród\tPap Márkó",
        ].join("\n");
        expect(parsePastedRooms(text)).toEqual([
            { roomName: "B", names: ["Berkó Domonkos", "Halász Dávid"] },
            { roomName: "C", names: ["Kellermann Botond", "Révész Nimród"] },
            { roomName: "L₀", names: ["Pap Kende", "Pap Márkó"] },
        ]);
    });

    it("ignores empty cells and placeholder dashes", () => {
        const text = [
            "B\tC",
            "Berkó Domonkos\t",
            "--\tRévész Nimród",
            "–\t-",
        ].join("\n");
        expect(parsePastedRooms(text)).toEqual([
            { roomName: "B", names: ["Berkó Domonkos"] },
            { roomName: "C", names: ["Révész Nimród"] },
        ]);
    });

    it("keeps the room name without the headcount suffix", () => {
        expect(parsePastedRooms("Ebb (5)\nKiss Villő")).toEqual([
            { roomName: "Ebb", names: ["Kiss Villő"] },
        ]);
    });

    it("skips leading empty lines and columns without a header", () => {
        const text = [
            "",
            "\tB\t",
            "ignored\tHalász Dávid\tignored too",
        ].join("\n");
        expect(parsePastedRooms(text)).toEqual([{ roomName: "B", names: ["Halász Dávid"] }]);
    });

    it("handles Windows line endings and returns nothing for empty input", () => {
        expect(parsePastedRooms("B\r\nHalász Dávid")).toEqual([
            { roomName: "B", names: ["Halász Dávid"] },
        ]);
        expect(parsePastedRooms("\n\t\n")).toEqual([]);
    });
});

describe("normalizeName", () => {
    it("is case- and accent-insensitive and drops parentheticals", () => {
        expect(normalizeName("Wang Tiany (Tony)")).toBe("wang tiany");
        expect(normalizeName("TÓTH  jános")).toBe("toth janos");
        expect(normalizeName("Kovács-Nagy Péter")).toBe("kovacs nagy peter");
    });
});

describe("normalizeNameKey", () => {
    it("also ignores spaces and dashes", () => {
        expect(normalizeNameKey("Kovács-Nagy Péter")).toBe("kovacsnagypeter");
        expect(normalizeNameKey("Kovácsnagy Péter")).toBe("kovacsnagypeter");
    });
});

describe("matchNameToPerson", () => {
    const persons = [
        person("1", "Tajti András", "Vacskamati"),
        person("2", "Kellermann Botond", "Vacskamati"),
        person("3", "Zhu Hongyu", "Vacskamati"),
        person("4", "Kiss Villő Zsófia", "Vacskamati"),
        person("5", "Nagy Péter", "Beluga"),
        person("6", "Nagy Péter", "Vacskamati"),
        person("7", "Teljesen Máshogyhívják"),
        person("8", "Kovács-Nagy Anna", "Beluga"),
    ];

    it("finds a unique exact match ignoring accents and case", () => {
        const result = matchNameToPerson("kellermann botond", persons);
        expect(result).toEqual({ status: "match", person: persons[1] });
    });

    it("ignores parenthetical nicknames in the pasted name", () => {
        const result = matchNameToPerson("Zhu Hongyu (Játék)", persons);
        expect(result).toEqual({ status: "match", person: persons[2] });
    });

    it("matches exactly across spacing and dash differences", () => {
        const result = matchNameToPerson("Kovácsnagy Anna", persons);
        expect(result).toEqual({ status: "match", person: persons[7] });
    });

    it("returns exact duplicates as suggestions instead of picking one", () => {
        const result = matchNameToPerson("Nagy Péter", persons);
        expect(result.status).toBe("suggestion");
        if (result.status === "suggestion") {
            expect(result.candidates.map(candidate => candidate.id).sort()).toEqual(["5", "6"]);
        }
    });

    it("suggests a match when a middle name is missing", () => {
        const result = matchNameToPerson("Kiss Villő", persons);
        expect(result.status).toBe("suggestion");
        if (result.status === "suggestion") {
            expect(result.candidates.map(candidate => candidate.id)).toEqual(["4"]);
        }
    });

    it("suggests a match for a word-order swap", () => {
        const result = matchNameToPerson("Botond Kellermann", persons);
        expect(result.status).toBe("suggestion");
        if (result.status === "suggestion") {
            expect(result.candidates.map(candidate => candidate.id)).toEqual(["2"]);
        }
    });

    it("does not match on a nickname variant", () => {
        expect(matchNameToPerson("Tajti Andris", persons)).toEqual({ status: "none" });
    });

    it("does not match on a shared single name alone", () => {
        expect(matchNameToPerson("Péter", persons)).toEqual({ status: "none" });
        expect(matchNameToPerson("Villő", persons)).toEqual({ status: "none" });
    });

    it("returns none for an unknown name or empty cell", () => {
        expect(matchNameToPerson("Ismeretlen Gyerek", persons)).toEqual({ status: "none" });
        expect(matchNameToPerson("  ", persons)).toEqual({ status: "none" });
    });
});
