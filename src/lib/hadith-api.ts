export type HadithData = {
    id: number;
    arabic?: string;
    bangla: string;
    english: string;
    reference: string;
    source: string;
};

const MAX_RETRIES = 5;
const BUKHARI_RANGE = 7563; // Approx max hadith number in Sahih Bukhari

async function fetchHadith(edition: string, number: number): Promise<any> {
    try {
        const res = await fetch(
            `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}/${number}.json`
        );
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchRandomHadith(): Promise<HadithData | null> {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        const randomNum = Math.floor(Math.random() * BUKHARI_RANGE) + 1;

        // Fetch both English and Bangla in parallel
        const [engData, benData] = await Promise.all([
            fetchHadith("eng-bukhari", randomNum),
            fetchHadith("ben-bukhari", randomNum)
        ]);

        // Check if we got valid data for at least English
        // (Bangla might be missing for some numbers, but ideally we want both)
        if (engData && engData.hadiths?.[0]) {
            const engText = engData.hadiths[0].text;
            const benText = benData?.hadiths?.[0]?.text || "অনুবাদ উপলব্ধ নেই"; // Translation not available

            return {
                id: randomNum,
                english: engText,
                bangla: benText,
                reference: `Sahih al-Bukhari ${randomNum}`,
                source: "Sahih al-Bukhari",
                arabic: "", // We could fetch arabic if needed (ara-bukhari)
            };
        }

        attempts++;
    }

    return null;
}
