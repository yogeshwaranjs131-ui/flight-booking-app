import PDFDocument from 'pdfkit';

/**
 * Generates a flight ticket PDF from booking details.
 * @param {object} booking - The populated booking object from Mongoose.
 * @returns {Promise<Buffer>} A promise that resolves with the PDF buffer.
 */
const generateTicketPDF = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- PDF Content ---

      // Header
      doc.fontSize(25).font('Helvetica-Bold').text('Flight E-Ticket', { align: 'center' });
      doc.moveDown(2);

      // PNR and Booking Status
      doc.fontSize(16).text(`PNR: ${booking.pnr}`, { continued: true });
      doc.fontSize(16).text(`Status: ${booking.status}`, { align: 'right' });
      doc.moveDown(2);

      // Flight Details
      doc.fontSize(18).font('Helvetica-Bold').text('Flight Details', { underline: true });
      doc.moveDown();
      doc.font('Helvetica').fontSize(12);
      doc.text(`Airline: ${booking.flight.airline}`);
      doc.text(`Flight Number: ${booking.flight.flightNumber}`);
      doc.moveDown();
      doc.text(`From: ${booking.flight.departureAirport.name} (${booking.flight.departureAirport.code})`);
      doc.text(`To: ${booking.flight.arrivalAirport.name} (${booking.flight.arrivalAirport.code})`);
      doc.moveDown();
      doc.text(`Departure: ${new Date(booking.flight.departureTime).toLocaleString()}`);
      doc.text(`Arrival: ${new Date(booking.flight.arrivalTime).toLocaleString()}`);
      doc.moveDown(2);

      // Passenger Details
      doc.fontSize(18).font('Helvetica-Bold').text('Passenger Details', { underline: true });
      doc.moveDown();
      doc.font('Helvetica').fontSize(12);
      booking.passengers.forEach((passenger, index) => {
        doc.text(`${index + 1}. ${passenger.name} (Age: ${passenger.age}, Gender: ${passenger.gender})`);
      });
      doc.moveDown(3);

      // Footer
      doc.fontSize(10).text('Thank you for booking with us. Have a safe journey!', { align: 'center' });

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

export default generateTicketPDF;