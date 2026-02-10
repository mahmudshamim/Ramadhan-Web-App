import { Lang } from "./i18n";

const enDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBanglaDigits(str: string | number): string {
    const input = String(str);
    return input.split("").map(char => {
        const index = enDigits.indexOf(char);
        return index !== -1 ? bnDigits[index] : char;
    }).join("");
}

const weekdays: Record<string, string> = {
    Sunday: "রবিবার",
    Monday: "সোমবার",
    Tuesday: "মঙ্গলবার",
    Wednesday: "বুধবার",
    Thursday: "বৃহস্পতিবার",
    Friday: "শুক্রবার",
    Saturday: "শনিবার"
};

export function translateWeekday(day: string, lang: Lang): string {
    if (lang !== "bn") return day;
    return weekdays[day] || day;
}
