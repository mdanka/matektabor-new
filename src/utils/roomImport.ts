import { IPerson } from "../commons";

export interface IParsedRoom {
    roomName: string;
    names: string[];
}

export interface IMatchCandidate {
    person: IPerson;
    score: number;
}

export type IMatchResult =
    | { status: "match"; person: IPerson }
    | { status: "suggestion"; candidates: IMatchCandidate[] }
    | { status: "none" };

const EMPTY_CELL_VALUES = new Set(["", "-", "--", "–", "—", "x", "X"]);

/** Matches a trailing headcount like " (5)" in a room header cell. */
const ROOM_HEADER_COUNT_REGEX = /\s*\(\d+\)\s*$/;

const PARENTHETICAL_REGEX = /\([^)]*\)/g;

/**
 * Parses a block copied from an Excel room-assignment table. Excel puts
 * tab-separated values on the clipboard: the first row holds the room names
 * (optionally with a headcount suffix like "B (5)"), the cells below hold the
 * children's names. Cells with "--" or similar placeholders mark empty beds.
 */
export function parsePastedRooms(text: string): IParsedRoom[] {
    const lines = text.replace(/\r\n?/g, "\n").split("\n");
    const rows = lines.map(line => line.split("\t").map(cell => cell.trim()));
    const firstContentRowIndex = rows.findIndex(row => row.some(cell => cell !== ""));
    if (firstContentRowIndex === -1) {
        return [];
    }
    const headerRow = rows[firstContentRowIndex];
    const bodyRows = rows.slice(firstContentRowIndex + 1);

    const roomsByName = new Map<string, string[]>();
    const columnRoomNames = headerRow.map(cell => cell.replace(ROOM_HEADER_COUNT_REGEX, "").trim());
    columnRoomNames.forEach(roomName => {
        if (roomName !== "" && !roomsByName.has(roomName)) {
            roomsByName.set(roomName, []);
        }
    });
    bodyRows.forEach(row => {
        row.forEach((cell, columnIndex) => {
            const roomName = columnRoomNames[columnIndex];
            if (roomName === undefined || roomName === "" || EMPTY_CELL_VALUES.has(cell)) {
                return;
            }
            const names = roomsByName.get(roomName);
            if (names !== undefined && !names.includes(cell)) {
                names.push(cell);
            }
        });
    });
    return Array.from(roomsByName.entries()).map(([roomName, names]) => ({ roomName, names }));
}

/**
 * Lowercases, strips diacritics and parentheticals (nicknames like
 * "Wang Tiany (Tony)"), drops punctuation and collapses whitespace, so that
 * spelling variations of the same name compare equal.
 */
export function normalizeName(name: string): string {
    return name
        .replace(PARENTHETICAL_REGEX, " ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function levenshtein(a: string, b: string): number {
    if (a === b) {
        return 0;
    }
    let previousRow = Array.from({ length: b.length + 1 }, (_unused, i) => i);
    for (let i = 0; i < a.length; i++) {
        const currentRow = [i + 1];
        for (let j = 0; j < b.length; j++) {
            currentRow.push(Math.min(
                previousRow[j + 1] + 1,
                currentRow[j] + 1,
                previousRow[j] + (a[i] === b[j] ? 0 : 1),
            ));
        }
        previousRow = currentRow;
    }
    return previousRow[b.length];
}

function levenshteinSimilarity(a: string, b: string): number {
    const maxLength = Math.max(a.length, b.length);
    return maxLength === 0 ? 1 : 1 - levenshtein(a, b) / maxLength;
}

/**
 * Similarity of two name tokens. Besides edit distance, a shared prefix counts
 * a lot, because Hungarian nicknames are usually prefixes of the full name
 * ("András" ~ "Andris", "Benedek" ~ "Beni").
 */
function tokenSimilarity(a: string, b: string): number {
    if (a === b) {
        return 1;
    }
    let commonPrefixLength = 0;
    while (commonPrefixLength < Math.min(a.length, b.length) && a[commonPrefixLength] === b[commonPrefixLength]) {
        commonPrefixLength++;
    }
    const prefixScore = commonPrefixLength >= 3 ? 0.7 + 0.05 * Math.min(commonPrefixLength - 3, 4) : 0;
    return Math.max(levenshteinSimilarity(a, b), prefixScore);
}

/**
 * Similarity of two full names, comparing each token of the shorter name to
 * its best counterpart in the other one. Word order does not matter, and extra
 * tokens on one side (e.g. a middle name only recorded in one place) only
 * apply a mild penalty.
 */
function nameSimilarity(a: string, b: string): number {
    const tokensA = a.split(" ").filter(token => token !== "");
    const tokensB = b.split(" ").filter(token => token !== "");
    if (tokensA.length === 0 || tokensB.length === 0) {
        return 0;
    }
    const [shorter, longer] = tokensA.length <= tokensB.length ? [tokensA, tokensB] : [tokensB, tokensA];
    const scores = shorter.map(token => Math.max(...longer.map(other => tokenSimilarity(token, other))));
    const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const lengthPenalty = 1 - 0.05 * (longer.length - shorter.length);
    return meanScore * lengthPenalty;
}

const SUGGESTION_THRESHOLD = 0.6;
const MAX_SUGGESTIONS = 3;

/**
 * Finds the person a pasted name refers to. Returns a confident "match" only
 * for a unique normalized-exact hit; close names come back as "suggestion"
 * candidates for the user to confirm. People in `preferredGroup` (the camp's
 * group) rank slightly higher, since campers usually come from that group.
 */
export function matchNameToPerson(rawName: string, persons: IPerson[], preferredGroup?: string): IMatchResult {
    const normalized = normalizeName(rawName);
    if (normalized === "") {
        return { status: "none" };
    }
    const exactMatches = persons.filter(person => normalizeName(person.name) === normalized);
    if (exactMatches.length === 1) {
        return { status: "match", person: exactMatches[0] };
    }
    if (exactMatches.length > 1) {
        const preferred = exactMatches.filter(person => person.group === preferredGroup);
        if (preferred.length === 1) {
            return { status: "match", person: preferred[0] };
        }
        return { status: "suggestion", candidates: exactMatches.map(person => ({ person, score: 1 })) };
    }
    const candidates = persons
        .map(person => {
            const baseScore = nameSimilarity(normalizeName(person.name), normalized);
            const groupBonus = preferredGroup !== undefined && person.group === preferredGroup ? 0.05 : 0;
            return { person, score: baseScore + groupBonus };
        })
        .filter(candidate => candidate.score >= SUGGESTION_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SUGGESTIONS);
    return candidates.length === 0 ? { status: "none" } : { status: "suggestion", candidates };
}
