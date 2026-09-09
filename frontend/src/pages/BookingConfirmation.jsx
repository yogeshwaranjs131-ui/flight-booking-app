import React, { useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate, formatDateTime } from '../utils/formatDate';
import { FaPlane, FaCheckCircle, FaDownload, FaHome, FaUser, FaTicketAlt } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef(null);

  const { booking } = location.state || {};

  if (!booking) {
    return <Navigate to="/" replace />;
  }

  const downloadPDF = async () => {
    const input = ticketRef.current;
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Flight-Ticket-${booking.pnr || 'Confirm'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to download ticket. Please try again.');
    }
  };

  const flight = booking.flight || {};

  const passengers = booking.passengers && booking.passengers.length > 0
    ? booking.passengers
    : [{ name: booking.passengerName || 'Yogeshwaran' }];

  const seats = booking.seats && booking.seats.length > 0
    ? booking.seats
    : [booking.seatNumber || '12A'];

  const qrValue = booking.pnr ? booking.pnr : `https://example.com/booking/${booking._id || 'ticket'}`;
  const departureDateTime = flight.departureTime ? formatDateTime(flight.departureTime) : 'Time not available';
  const arrivalDateTime = flight.arrivalTime ? formatDateTime(flight.arrivalTime) : 'Time not available';
  const departureDisplayDate = flight.departureTime ? formatDate(flight.departureTime) : 'Date not available';
  const arrivalDisplayDate = flight.arrivalTime ? formatDate(flight.arrivalTime) : 'Date not available';

  const totalPrice = booking.totalPrice || booking.amount || 4500;

  return (
    <div className="ticket-confirmation-page">
      <div className="ticket-confirmation-head">
        <FaCheckCircle className="ticket-confirmation-check" />
        <h1>Booking Confirmed Successfully!</h1>
        <p>Your e-ticket has been generated. You can download it below.</p>
      </div>

      <article className="ticket-card-print" ref={ticketRef}>
        <section className="ticket-card-top">
          <div className="ticket-brand-block">
            <span className="ticket-logo-icon"><FaPlane /></span>
            <div>
              <h2>AIRLINES E-TICKET</h2>
              <p>PNR: {booking.pnr || booking._id?.substring(0, 8).toUpperCase() || 'PNR12345'}</p>
            </div>
          </div>
          <span className="ticket-status-tag">{booking.status || 'Confirmed'}</span>
        </section>

        <section className="ticket-card-body">
          <div className="ticket-card-main">
            <section className="ticket-flight-strip">
              <div className="ticket-strip-head">
                <span>Flight Details</span>
                <span className="ticket-flight-label">{flight.airline || 'Air Express'} ({flight.flightNumber || 'AX-404'})</span>
              </div>
              <div className="ticket-strip-route">
                <div className="ticket-strip-location">
                  <span className="ticket-strip-code">{flight.departureAirport?.code || flight.from || 'COK'}</span>
                  <span className="ticket-strip-place">{flight.departureAirport?.city || 'Cochin'}</span>
                </div>
                <div className="ticket-strip-plane">
                  <span className="ticket-strip-dash" />
                  <FaPlane className="ticket-strip-icon" />
                  <span className="ticket-strip-dash" />
                  <small>{flight.departureTime ? formatDateTime(flight.departureTime) : 'Scheduled'}</small>
                </div>
                <div className="ticket-strip-location ticket-strip-location-right">
                  <span className="ticket-strip-code">{flight.arrivalAirport?.code || flight.to || 'MAA'}</span>
                  <span className="ticket-strip-place">{flight.arrivalAirport?.city || 'Chennai'}</span>
                </div>
              </div>
              <div className="ticket-strip-schedule">
                <div className="ticket-schedule-block">
                  <span className="ticket-schedule-label">Departure</span>
                  <span className="ticket-schedule-date">{departureDisplayDate}</span>
                  <span className="ticket-schedule-time">{departureDateTime}</span>
                </div>
                <div className="ticket-schedule-block">
                  <span className="ticket-schedule-label">Arrival</span>
                  <span className="ticket-schedule-date">{arrivalDisplayDate}</span>
                  <span className="ticket-schedule-time">{arrivalDateTime}</span>
                </div>
              </div>
            </section>

            <section className="ticket-passenger-panel">
              <h3><FaUser /> Passenger & Seat Manifest</h3>
              <div className="ticket-passenger-table-wrap">
                <table className="ticket-passenger-table">
                  <thead>
                    <tr>
                      <th>Passenger Name</th>
                      <th>Seat Number</th>
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map((p, index) => (
                      <tr key={index}>
                        <td>{typeof p === 'string' ? p : (p.name || 'Passenger')}</td>
                        <td><FaTicketAlt /> {seats[index] || seats[0] || '12A'}</td>
                        <td>Economy</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ticket-payment-summary">
              <div>
                <p>Payment Status: <span className="ticket-payment-status">SUCCESSFUL</span></p>
                <small>Please present this e-ticket at the airport check-in counter.</small>
              </div>
              <div className="ticket-total-box">
                <span>Total Amount Paid</span>
                <strong>{formatCurrency ? formatCurrency(totalPrice) : `₹ ${totalPrice}`}</strong>
              </div>
            </section>
          </div>

          <aside className="ticket-card-side">
            <div className="ticket-side-qr">
              <div className="ticket-qr-frame">
                <QRCodeSVG
                  value={qrValue}
                  size={96}
                  bgColor="#eef4ff"
                  fgColor="#07111f"
                  level="M"
                  includeMargin={false}
                  className="ticket-real-qr"
                />
              </div>
              <span className="ticket-scan-label">SCAN BOARDING PASS</span>
            </div>

            <div className="ticket-side-meta">
              <div>
                <span className="ticket-side-label">Gate</span>
                <span className="ticket-side-value">B12</span>
              </div>
              <div>
                <span className="ticket-side-label">Boarding</span>
                <span className="ticket-side-value">21:40</span>
              </div>
              <div>
                <span className="ticket-side-label">Seat</span>
                <span className="ticket-side-value">{seats.join(', ') || '12A'}</span>
              </div>
            </div>

            <div className="ticket-side-total">
              <span className="ticket-side-label">Passenger</span>
              <span className="ticket-side-value">{passengers.map(p => typeof p === 'string' ? p : (p.name || 'Passenger')).filter(Boolean).join(', ') || 'Passenger'}</span>
            </div>
          </aside>
        </section>
      </article>

      <div className="ticket-confirmation-actions">
        <button onClick={downloadPDF} className="ticket-download-button">
          <FaDownload /> Download Ticket (PDF)
        </button>
        <button onClick={() => navigate('/')} className="ticket-home-button">
          <FaHome /> Back to Home
        </button>
      </div>
    </div>
  );
}

export default BookingConfirmation;