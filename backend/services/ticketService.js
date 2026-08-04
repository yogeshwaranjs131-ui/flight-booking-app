import { generateTicketPDF } from "../utils/generateTicketPDF.js";

/**
 * Generate Ticket Number
 */
export const generateTicketNumber = () => {
  return `TKT${Date.now()}`;
};

/**
 * Generate Complete Ticket
 */
export const generateTicket = async (
  booking
) => {
  try {
    const ticketNumber =
      generateTicketNumber();

    const pdfBuffer =
      await generateTicketPDF(
        booking
      );

    return {
      success: true,
      ticketNumber,
      pnr: booking.pnr,
      bookingId: booking._id,
      generatedAt: new Date(),
      pdfBuffer,
    };
  } catch (error) {
    throw new Error(
      `Ticket generation failed: ${error.message}`
    );
  }
};

/**
 * Download Ticket PDF
 */
export const downloadTicket = async (
  booking,
  res
) => {
  try {
    const pdfBuffer =
      await generateTicketPDF(
        booking
      );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ticket-${booking.pnr}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    throw new Error(
      `PDF download failed: ${error.message}`
    );
  }
};