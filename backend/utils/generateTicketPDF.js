
import PDFDocument from "pdfkit";

/**
 * Generate professional flight e-ticket PDF
 *
 * Supports:
 * - One-way booking
 * - Round-trip booking
 * - Multiple passengers
 * - Multiple seats
 * - Payment details
 * - Airport details
 *
 * @param {object} booking - Populated Booking document
 * @returns {Promise<Buffer>}
 */

const generateTicketPDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      if (!booking) {
        return reject(
          new Error("Booking data is required")
        );
      }

      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
      });

      const buffers = [];

      doc.on("data", (chunk) => {
        buffers.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      doc.on("error", (error) => {
        reject(error);
      });

      // ========================================================
      // HELPERS
      // ========================================================

      const getAirportName = (airport) => {
        if (!airport) return "N/A";

        return (
          airport.airportName ||
          airport.name ||
          airport.city ||
          "N/A"
        );
      };

      const getAirportCode = (airport) => {
        if (!airport) return "N/A";

        return (
          airport.airportCode ||
          airport.code ||
          "N/A"
        );
      };

      const formatDateTime = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
          return "N/A";
        }

        return parsedDate.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
      };

      const formatCurrency = (amount) => {
        const numericAmount = Number(amount || 0);

        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        }).format(numericAmount);
      };

      const drawLine = () => {
        const y = doc.y;

        doc
          .moveTo(45, y)
          .lineTo(550, y)
          .stroke();

        doc.moveDown(0.8);
      };

      const safePassengers = Array.isArray(
        booking.passengers
      )
        ? booking.passengers
        : [];

      const safeOutboundSeats =
        Array.isArray(booking.seats)
          ? booking.seats
          : [];

      const safeReturnSeats =
        Array.isArray(booking.returnSeats)
          ? booking.returnSeats
          : [];

      // ========================================================
      // HEADER
      // ========================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(25)
        .text("FLIGHT E-TICKET", {
          align: "center",
        });

      doc.moveDown(0.3);

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(
          "Electronic Passenger Ticket",
          {
            align: "center",
          }
        );

      doc.moveDown(1.2);

      // ========================================================
      // BOOKING SUMMARY
      // ========================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(
          `PNR: ${booking.pnr || "N/A"}`,
          {
            continued: true,
          }
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(
          `Status: ${booking.status || "Pending"}`,
          {
            align: "right",
          }
        );

      doc.moveDown(1);

      drawLine();

      // ========================================================
      // TRIP TYPE
      // ========================================================

      const tripType =
        booking.tripType === "round-trip"
          ? "ROUND TRIP"
          : "ONE WAY";

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text(`Trip Type: ${tripType}`);

      doc.moveDown(1);

      // ========================================================
      // FLIGHT SECTION
      // ========================================================

      const drawFlightSection = (
        flight,
        seats,
        title
      ) => {
        if (!flight) {
          return;
        }

        doc
          .font("Helvetica-Bold")
          .fontSize(17)
          .text(title);

        doc.moveDown(0.6);

        // ------------------------------------------------------
        // Airline
        // ------------------------------------------------------

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(
            `${flight.airline || "Airline"}  |  ${
              flight.flightNumber || "N/A"
            }`
          );

        doc.moveDown(0.5);

        // ------------------------------------------------------
        // Route
        // ------------------------------------------------------

        const fromCode =
          getAirportCode(
            flight.departureAirport
          );

        const toCode =
          getAirportCode(
            flight.arrivalAirport
          );

        const fromName =
          getAirportName(
            flight.departureAirport
          );

        const toName =
          getAirportName(
            flight.arrivalAirport
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(17)
          .text(
            `${fromCode}  →  ${toCode}`,
            {
              align: "center",
            }
          );

        doc
          .font("Helvetica")
          .fontSize(9)
          .text(
            `${fromName}  →  ${toName}`,
            {
              align: "center",
            }
          );

        doc.moveDown(0.8);

        // ------------------------------------------------------
        // Departure
        // ------------------------------------------------------

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Departure");

        doc
          .font("Helvetica")
          .fontSize(10)
          .text(
            formatDateTime(
              flight.departureTime
            )
          );

        doc.moveDown(0.4);

        // ------------------------------------------------------
        // Arrival
        // ------------------------------------------------------

        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Arrival");

        doc
          .font("Helvetica")
          .fontSize(10)
          .text(
            formatDateTime(
              flight.arrivalTime
            )
          );

        // ------------------------------------------------------
        // Duration
        // ------------------------------------------------------

        if (flight.duration) {
          doc.moveDown(0.4);

          doc
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("Duration");

          doc
            .font("Helvetica")
            .fontSize(10)
            .text(
              String(flight.duration)
            );
        }

        doc.moveDown(0.5);

        // ------------------------------------------------------
        // Seats
        // ------------------------------------------------------

        const seatList =
          Array.isArray(seats) &&
          seats.length > 0
            ? seats.join(", ")
            : "N/A";

        doc
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(
            `Seat(s): ${seatList}`
          );

        doc.moveDown(1);

        drawLine();
      };

      // ========================================================
      // OUTBOUND
      // ========================================================

      drawFlightSection(
        booking.flight,
        safeOutboundSeats,
        "OUTBOUND FLIGHT"
      );

      // ========================================================
      // RETURN
      // ========================================================

      if (
        booking.tripType === "round-trip" &&
        booking.returnFlight
      ) {
        drawFlightSection(
          booking.returnFlight,
          safeReturnSeats,
          "RETURN FLIGHT"
        );
      }

      // ========================================================
      // PASSENGER DETAILS
      // ========================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .text("PASSENGER DETAILS");

      doc.moveDown(0.7);

      if (safePassengers.length === 0) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .text("No passenger information available.");
      } else {
        safePassengers.forEach(
          (passenger, index) => {
            doc
              .font("Helvetica-Bold")
              .fontSize(11)
              .text(
                `${index + 1}. ${
                  passenger?.name ||
                  "Passenger"
                }`
              );

            doc
              .font("Helvetica")
              .fontSize(9)
              .text(
                `Age: ${
                  passenger?.age ?? "N/A"
                }   |   Gender: ${
                  passenger?.gender ||
                  "N/A"
                }`
              );

            if (passenger?.email) {
              doc.text(
                `Email: ${passenger.email}`
              );
            }

            if (passenger?.phone) {
              doc.text(
                `Phone: ${passenger.phone}`
              );
            }

            doc.moveDown(0.7);
          });
      }

      drawLine();

      // ========================================================
      // PAYMENT DETAILS
      // ========================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .text("PAYMENT DETAILS");

      doc.moveDown(0.7);

      doc
        .font("Helvetica")
        .fontSize(11)
        .text(
          `Total Amount: ${formatCurrency(
            booking.totalPrice
          )}`
        );

      if (
        booking.paymentDetails
      ) {
        const paymentStatus =
          booking.paymentDetails
            .status;

        const paymentCurrency =
          booking.paymentDetails
            .currency;

        if (paymentStatus) {
          doc
            .fontSize(10)
            .text(
              `Payment Status: ${paymentStatus}`
            );
        }

        if (paymentCurrency) {
          doc
            .fontSize(10)
            .text(
              `Currency: ${String(
                paymentCurrency
              ).toUpperCase()}`
            );
        }

        if (
          booking.paymentDetails
            .stripe_payment_intent_id
        ) {
          doc
            .fontSize(9)
            .text(
              `Payment ID: ${booking.paymentDetails.stripe_payment_intent_id}`
            );
        }
      }

      doc.moveDown(1);

      drawLine();

      // ========================================================
      // IMPORTANT INFORMATION
      // ========================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(
          "IMPORTANT INFORMATION"
        );

      doc.moveDown(0.5);

      const importantNotes = [
        "Please carry a valid government-issued photo ID.",
        "Please arrive at the airport well before departure.",
        "Seat numbers may be changed by the airline due to operational requirements.",
        "Please check your flight status before travelling.",
        "This ticket is valid only for the passenger(s) named above.",
      ];

      importantNotes.forEach((note) => {
        doc
          .font("Helvetica")
          .fontSize(9)
          .text(`• ${note}`, {
            lineGap: 2,
          });
      });

      doc.moveDown(1.5);

      // ========================================================
      // FOOTER
      // ========================================================

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          "Thank you for booking with us!",
          {
            align: "center",
          }
        );

      doc.moveDown(0.3);

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(
          "Have a safe and pleasant journey.",
          {
            align: "center",
          }
        );

      doc.moveDown(0.8);

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Generated on ${new Date().toLocaleString(
            "en-IN"
          )}`,
          {
            align: "center",
          }
        );

      // ========================================================
      // PAGE NUMBERS
      // ========================================================

      const pageRange =
        doc.bufferedPageRange();

      for (
        let i = 0;
        i < pageRange.count;
        i++
      ) {
        doc.switchToPage(
          pageRange.start + i
        );

        doc
          .font("Helvetica")
          .fontSize(8)
          .text(
            `Page ${i + 1} of ${
              pageRange.count
            }`,
            45,
            805,
            {
              align: "center",
              width: 505,
            }
          );
      }

      // ========================================================
      // FINISH PDF
      // ========================================================

      doc.end();
    } catch (error) {
      console.error(
        "Error generating PDF:",
        error
      );

      reject(error);
    }
  });
};

export default generateTicketPDF;

