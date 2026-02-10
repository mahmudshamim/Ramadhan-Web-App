"use client";

import HomeClient from "../components/HomeClient";
import { FiMoon } from "react-icons/fi";
import { useLang } from "../lib/i18n";

export default function HomePage() {
  const { t } = useLang();
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-6 pt-2">

      <HomeClient />
    </main>
  );
}
