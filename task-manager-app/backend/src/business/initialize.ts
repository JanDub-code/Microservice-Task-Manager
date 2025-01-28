import {Aircraft} from "../persistence/models/aircraft.model";

export async function initializeAircrafts() {
    const existingAircrafts = await Aircraft.countDocuments();

    if (existingAircrafts === 0) {
        const aircrafts = [
            {
                _id: "a00000000000000000000001",
                name: "N123AB",
                model: "Boeing 737",
                capacity: 150,
                rangeKm: 6000,
                seats: ["12A", "12B", "12C", "15A", "15B", "15C", "18A", "18B", "18C"],
            },
            {
                _id: "a00000000000000000000002",
                name: "JA123A",
                model: "Airbus A320",
                capacity: 180,
                rangeKm: 5700,
                seats: ["7A", "7B", "7C", "12A", "12B", "12C", "18D", "18E", "18F"],
            },
        ];

        await Aircraft.insertMany(aircrafts);
        console.log("Initial aircraft data inserted.");
    } else {
        console.log("Aircraft data already exists.");
    }
}