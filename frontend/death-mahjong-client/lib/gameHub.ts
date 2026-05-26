import * as signalR from "@microsoft/signalr";

declare var process: {
    env: {
        NEXT_PUBLIC_SIGNALR_URL?: string;
    };
};

const SIGNALR_URL = process.env.NEXT_PUBLIC_SIGNALR_URL as string;

if (!SIGNALR_URL) {
    throw new Error("NEXT_PUBLIC_SIGNALR_URL is not defined");
}

export function createGameHubConnection(){
    return new signalR.HubConnectionBuilder()
        .withUrl(SIGNALR_URL)
        .withAutomaticReconnect()
        .build();
}