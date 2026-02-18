import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Islamic Quiz | R-Ramadhan",
    description: "Test your knowledge of Islam with our interactive quiz. Learn about Quran, Hadith, and Islamic history.",
    openGraph: {
        title: "Islamic Quiz | R-Ramadhan",
        description: "Test your knowledge of Islam with our interactive quiz.",
        images: ["/og-quiz.png"],
    },
};

export default function QuizLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
