"use client";

import { useEffect, useState } from "react";
import { FiX, FiMapPin, FiBell } from "react-icons/fi";

interface PermissionModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type: "location" | "notification" | "location_denied" | "notification_denied";
    confirmText: string;
    cancelText: string;
}

export default function PermissionModal({
    isOpen,
    onRequestClose,
    onConfirm,
    title,
    message,
    type,
    confirmText,
    cancelText,
}: PermissionModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Prevent body scroll
            document.body.style.overflow = "hidden";
        } else {
            setTimeout(() => setIsVisible(false), 300); // Wait for animation
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onRequestClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-deep/90 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    }`}
            >
                {/* Close Button */}
                <button
                    onClick={onRequestClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                    <FiX className="text-xl" />
                </button>

                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/10 ring-1 ring-brand-gold/30">
                        {(type === "location" || type === "location_denied") ? (
                            <FiMapPin className="text-4xl text-brand-gold animate-bounce-slow" />
                        ) : (
                            <FiBell className="text-4xl text-brand-gold animate-shake" />
                        )}
                    </div>
                </div>

                {/* Text */}
                <div className="mb-8 text-center">
                    <h2 className="mb-3 font-display text-2xl text-brand-sand">{title}</h2>
                    <p className="text-sm leading-relaxed text-slate-300">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={onRequestClose}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-brand-gold px-4 py-3 text-sm font-bold text-brand-deep transition-all hover:bg-brand-gold/90 hover:shadow-lg hover:shadow-brand-gold/20"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
