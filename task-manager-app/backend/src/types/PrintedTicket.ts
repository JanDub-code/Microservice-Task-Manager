
export interface PrintedTicket {
    userId: string;
    flightId: string;
    seatNumber: string;
    departure: {
        airport: string;
        city: string;
        time: string;
    };
}