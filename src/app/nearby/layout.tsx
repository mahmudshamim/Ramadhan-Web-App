import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nearby Mosques & Halal Food | R-Ramadhan",
    description: "Find the nearest mosques and halal food places based on your location. Get directions and distance information.",
    openGraph: {
        title: "Nearby Mosques & Halal Food | R-Ramadhan",
        description: "Find the nearest mosques and halal food places based on your location.",
        images: ["/og-nearby.png"], // Assuming a default or specific image
    },
};

export default function NearbyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
