import { io, Socket } from "socket.io-client";
import Config from "@/config";
import { onUnmounted } from 'vue';

export function useNotificationService() {
    let socket: Socket | null = null;

    /**
     * Inicializace socketu.
     * Vrátí Promise, která se vyřeší po "connect".
     */
    async function init() {
        socket = io(Config.statusBackendUrl); // Ujistěte se, že používáte správnou URL

        socket.on("disconnect", () => {
            console.log("Socket.io: disconnected");
        });

        // Lze registrovat i další globální eventy, např. 'warning', 'error' apod.

        return new Promise<void>((resolve) => {
            socket?.on("connect", () => {
                console.log("Socket.io: connected");
                resolve();
            });
        });
    }

    /**
     * Přihlášení k odběru notifikací pro daný teamId.
     * `callback` se zavolá při každé příchozí notifikaci.
     */
    function subscribeToTeam(teamId: string, onHistory: (history: Notification[]) => void, onNewNotification: (notif: Notification) => void) {
        if (!socket) return;

        // Když přijde historie
        socket.on("notificationHistory", (data: Notification[]) => {
            console.log("Socket.io: received notificationHistory", data);
            onHistory(data);
        });

        // Když přijde nová notifikace
        socket.on("notification", (data: Notification) => {
            console.log("Socket.io: received notification", data);
            onNewNotification(data);
        });

        // Pošleme signál, že chceme odebírat daný tým
        socket.emit("subscribeToTeam", teamId);
    }


    /**
     * Odpojení soketu
     */
    function disconnect() {
        socket?.disconnect();
    }

    // Automatické odpojení při odmountování komponenty
    onUnmounted(() => {
        disconnect();
    });

    return {
        init,
        subscribeToTeam,
        disconnect,
    };
}
