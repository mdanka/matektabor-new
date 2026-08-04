import { IPerson } from "../commons";

export interface IParsedRoom {
    roomName: string;
    names: string[];
}

export type IMatchResult =
    | { status: "match"; person: IPerson }
    | { status: "suggestion"; candidates: IPerson[] }
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

/**
 * Key for exact-match comparison: the normalized name with spaces removed too,
 * so that "Nagy-Kovács Anna", "Nagy Kovács Anna" and "Nagykovács Anna" all
 * compare equal.
 */
export function normalizeNameKey(name: string): string {
    return normalizeName(name).replace(/ /g, "");
}

const MAX_SUGGESTIONS = 5;

/**
 * True if every token of `shorter` appears in `longer` (with multiplicity).
 */
function isTokenSubset(shorter: string[], longer: string[]): boolean {
    const remaining = [...longer];
    return shorter.every(token => {
        const index = remaining.indexOf(token);
        if (index === -1) {
            return false;
        }
        remaining.splice(index, 1);
        return true;
    });
}

/**
 * Finds the person a pasted name refers to. Only a unique normalized-exact hit
 * is a confident "match"; everything else needs a human decision. The
 * "suggestion" tier is deliberately narrow: multiple exact hits, a word-order
 * swap, or one name missing a token of the other (e.g. a middle name), with at
 * least two tokens in common — a shared first name alone never suggests.
 */
export function matchNameToPerson(rawName: string, persons: IPerson[]): IMatchResult {
    const key = normalizeNameKey(rawName);
    if (key === "") {
        return { status: "none" };
    }
    const exactMatches = persons.filter(person => normalizeNameKey(person.name) === key);
    if (exactMatches.length === 1) {
        return { status: "match", person: exactMatches[0] };
    }
    if (exactMatches.length > 1) {
        return { status: "suggestion", candidates: exactMatches };
    }
    const rawTokens = normalizeName(rawName).split(" ");
    const candidates = persons
        .filter(person => {
            const personTokens = normalizeName(person.name).split(" ");
            const [shorter, longer] =
                rawTokens.length <= personTokens.length ? [rawTokens, personTokens] : [personTokens, rawTokens];
            return shorter.length >= 2 && isTokenSubset(shorter, longer);
        })
        .sort((a, b) => a.name.localeCompare(b.name, "hu"))
        .slice(0, MAX_SUGGESTIONS);
    return candidates.length === 0 ? { status: "none" } : { status: "suggestion", candidates };
}
