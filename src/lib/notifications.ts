/**
 * Browser Notification System for Iftar Reminders
 */

const REMINDER_STORAGE_KEY = "rramadhan_active_reminder";

export type ReminderStatus = {
    isActive: boolean;
    scheduledFor?: string; // ISO timestamp
    timeoutId?: number;
};

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
}

/**
 * Show a notification
 */
export function showNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            ...options,
        });
    }
}

/**
 * Schedule an Iftar reminder notification
 */
export async function scheduleIftarReminder(
    iftarTime: string,
    lang: "en" | "bn",
    reminderMinutes: number = 15
): Promise<boolean> {
    // Request permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
        return false;
    }

    // Parse Iftar time (format: "HH:MM AM/PM")
    const now = new Date();
    const iftarDate = parseTimeToDate(iftarTime);

    if (!iftarDate || iftarDate <= now) {
        console.warn("Iftar time has already passed or is invalid");
        return false;
    }

    // Calculate reminder time (custom minutes before Iftar)
    const reminderTime = new Date(iftarDate.getTime() - reminderMinutes * 60 * 1000);
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder <= 0) {
        console.warn("Reminder time has already passed");
        return false;
    }

    // Clear any existing reminder
    cancelReminder();

    // Schedule the notification
    const timeoutId = window.setTimeout(() => {
        const title = lang === "bn"
            ? "ইফতারের সময় হয়ে এসেছে!"
            : "Iftar Time Approaching!";

        const body = lang === "bn"
            ? `${reminderMinutes} মিনিটের মধ্যে ইফতার (${iftarTime})`
            : `Iftar in ${reminderMinutes} minutes (${iftarTime})`;

        showNotification(title, {
            body,
            tag: "iftar-reminder",
            requireInteraction: true,
        });

        // Clear the reminder from storage after showing
        localStorage.removeItem(REMINDER_STORAGE_KEY);
    }, timeUntilReminder);

    // Save reminder state
    const reminderState: ReminderStatus = {
        isActive: true,
        scheduledFor: reminderTime.toISOString(),
        timeoutId,
    };
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminderState));

    return true;
}

/**
 * Cancel active reminder
 */
export function cancelReminder(): void {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (stored) {
        try {
            const state: ReminderStatus = JSON.parse(stored);
            if (state.timeoutId) {
                window.clearTimeout(state.timeoutId);
            }
        } catch (e) {
            console.error("Failed to parse reminder state", e);
        }
    }
    localStorage.removeItem(REMINDER_STORAGE_KEY);
}

/**
 * Check if a reminder is currently active
 */
export function getReminderStatus(): ReminderStatus {
    const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!stored) {
        return { isActive: false };
    }

    try {
        const state: ReminderStatus = JSON.parse(stored);

        // Check if the scheduled time has passed
        if (state.scheduledFor) {
            const scheduledTime = new Date(state.scheduledFor);
            if (scheduledTime <= new Date()) {
                // Reminder has expired
                cancelReminder();
                return { isActive: false };
            }
        }

        return state;
    } catch (e) {
        console.error("Failed to parse reminder state", e);
        cancelReminder();
        return { isActive: false };
    }
}

/**
 * Restore reminder on page load (if still valid)
 */
export async function restoreReminder(
    iftarTime: string,
    lang: "en" | "bn",
    reminderMinutes: number = 15
): Promise<void> {
    const status = getReminderStatus();

    if (status.isActive && status.scheduledFor) {
        const scheduledTime = new Date(status.scheduledFor);
        const now = new Date();

        if (scheduledTime > now) {
            // Reschedule the reminder
            await scheduleIftarReminder(iftarTime, lang, reminderMinutes);
        } else {
            // Clear expired reminder
            cancelReminder();
        }
    }
}

/**
 * Parse time string (e.g., "5:55 PM") to today's Date object
 */
function parseTimeToDate(timeStr: string): Date | null {
    try {
        // Match "HH:MM" (optional AM/PM)
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!match) return null;

        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3] ? match[3].toUpperCase() : null;

        if (period) {
            // Convert 12-hour to 24-hour format
            if (period === "PM" && hours !== 12) {
                hours += 12;
            } else if (period === "AM" && hours === 12) {
                hours = 0;
            }
        }
        // If no period, assume 24-hour format (hours are already correct)

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date;
    } catch (e) {
        console.error("Failed to parse time", e);
        return null;
    }
}
