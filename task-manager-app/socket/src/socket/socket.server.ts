import { Server } from "socket.io";
import * as http from "node:http";
import { notificationService } from "../business/notification.service";

let sockets: Record<string, any> = {};
let io: Server = null;

// Map<teamId, Array<socketId>>
let subscriptions: Map<string, Array<string>> = new Map();

export const socketServer = {

    init(httpServer: http.Server) {
        io = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN.split(',')
            }
        });

        io.on("connection", (socket) => {
            console.log("Socket.io: A new user " + socket.id + " connected");

            // Uložíme do seznamu
            sockets[socket.id] = socket;

            // Předplatné na teamId
            socket.on('subscribeToTeam', async (teamId: string) => {
                await this.subscribeToTeam(socket.id, teamId);
            });

            socket.on('disconnect', () => {
                console.log('Socket.io: User ' + socket.id + ' disconnected');
                // Odebrání socketu ze všech předplatných
                this.unsubscribeSocket(socket.id);
                delete sockets[socket.id];
            });
        });

        console.log('Socket.io: Initialized');
    },

    async subscribeToTeam(socketId: string, teamId: string) {
        console.log('Socket.io: User ' + socketId + ' subscribed to team ' + teamId);

        // Přidáme socket do subscription
        if (!subscriptions.has(teamId)) {
            subscriptions.set(teamId, []);
        }
        subscriptions.get(teamId).push(socketId);

        // 1) Načíst historické notifikace z DB
        const history = await notificationService.getNotificationsByTeam(teamId);

        // 2) Odeslat je konkrétnímu socketu (klientovi) – dejme tomu event "notificationHistory"
        if (sockets[socketId]) {
            sockets[socketId].emit("notificationHistory", history);
        }
    },

    // Volané z NotificationController.create (nebo odkudkoli), když je nová notifikace
    sendNotificationToSubscribers(teamId: string, notification: any) {
        console.log('Socket.io: Broadcasting notification for team ' + teamId, notification);

        const subscribedSocketIds = subscriptions.get(teamId) || [];
        subscribedSocketIds.forEach(socketId => {
            this.send(socketId, 'notification', notification);
        });
    },

    send(socketId: string, event: string, data: any) {
        if (sockets[socketId]) {
            console.log('Socket.io: Sending to ' + socketId + ' event ' + event, data);
            sockets[socketId].emit(event, data);
        }
    },

    unsubscribeSocket(socketId: string) {
        subscriptions.forEach((socketArray, teamId) => {
            const filtered = socketArray.filter(id => id !== socketId);
            if (filtered.length > 0) {
                subscriptions.set(teamId, filtered);
            } else {
                subscriptions.delete(teamId);
            }
        });
    },
};
