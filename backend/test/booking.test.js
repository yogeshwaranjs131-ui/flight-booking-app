import request from "supertest";
import app from "../app.js";

describe("Booking API", () => {
  it("should create booking", async () => {
    const res = await request(app)
      .post("/api/bookings")
      .send({
        flightId: "YOUR_FLIGHT_ID",
        passengers: [
          {
            firstName: "Yogesh",
            lastName: "Kumar",
            age: 25,
            gender: "Male",
          },
        ],
      });

    expect(res.statusCode).toBe(201);
  });
});
