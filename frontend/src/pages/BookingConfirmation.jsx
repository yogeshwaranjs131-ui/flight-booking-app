import React, { useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDateTime } from '../utils/formatDate';
import { FaPlane, FaCheckCircle, FaDownload, FaHome, FaUser, FaTicketAlt } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef(null);

  const { booking } = location.state || {};

  console.log("Full Booking Data:", booking);

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
      console.error("Error generating PDF:", err);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const flight = booking.flight || {};
  
  const passengers = booking.passengers && booking.passengers.length > 0 
    ? booking.passengers 
    : [{ name: booking.passengerName || 'Yogeshwaran' }];
    
  const seats = booking.seats && booking.seats.length > 0 
    ? booking.seats 
    : [booking.seatNumber || '12A'];

  const totalPrice = booking.totalPrice || booking.amount || 4500;

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '2.5rem 1rem' }}>
      {/* Success Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <FaCheckCircle style={{ color: '#22c55e', fontSize: '3.75rem', margin: '0 auto 0.75rem auto' }} />
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>Booking Confirmed Successfully!</h1>
        <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Your e-ticket has been generated. You can download it below.</p>
      </div>

      {/* Printable Ticket Container */}
      <div 
        ref={ticketRef} 
        style={{ 
          backgroundColor: '#ffffff', 
          color: '#111827',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          padding: '2rem',
          marginBottom: '1.5rem',
          position: 'relative'
        }}
      >
        {/* Ticket Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#4f46e5', padding: '0.75rem', borderRadius: '0.75rem', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaPlane size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.05em', margin: 0 }}>AIRLINES E-TICKET</h2>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', margin: '0.25rem 0 0 0' }}>PNR: {booking.pnr || booking._id?.substring(0, 8).toUpperCase() || 'PNR12345'}</p>
            </div>
          </div>
          <div>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {booking.status || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Flight Route & Info */}
        <div style={{ backgroundColor: '#312e81', color: '#ffffff', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c7d2fe', fontWeight: '600' }}>Flight Details</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: '#3730a3', padding: '0.25rem 0.75rem', borderRadius: '0.375rem' }}>
              {flight.airline || 'Air Express'} ({flight.flightNumber || 'AX-404'})
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0 }}>{flight.departureAirport?.code || flight.from || 'COK'}</p>
              <p style={{ fontSize: '0.75rem', color: '#c7d2fe', margin: '0.25rem 0 0 0' }}>Departure City</p>
            </div>
            <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem', position: 'relative' }}>
              <div style={{ borderTop: '2px dashed #818cf8', margin: '0.5rem 0', position: 'relative' }}>
                <FaPlane style={{ color: '#c7d2fe', backgroundColor: '#312e81', padding: '0 0.5rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} size={16} />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#c7d2fe', margin: '0.25rem 0 0 0' }}>{flight.departureTime ? formatDateTime(flight.departureTime) : 'Scheduled'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0 }}>{flight.arrivalAirport?.code || flight.to || 'MAA'}</p>
              <p style={{ fontSize: '0.75rem', color: '#c7d2fe', margin: '0.25rem 0 0 0' }}>Arrival City</p>
            </div>
          </div>
        </div>

        {/* Passengers & Seats Grid */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaUser style={{ color: '#4f46e5' }} /> Passenger & Seat Manifest
          </h3>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', color: '#374151', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Passenger Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Seat Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Class</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, index) => (
                  <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1f2937' }}>
                      {typeof p === 'string' ? p : (p.name || 'Passenger')}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FaTicketAlt size={14} /> {seats[index] || seats[0] || '12A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#4b5563' }}>Economy</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
          <div>
            <p style={{ color: '#6b7280', margin: 0 }}>Payment Status: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>SUCCESSFUL</span></p>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Please present this e-ticket at the airport check-in counter.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>Total Amount Paid</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#4f46e5', margin: '0.25rem 0 0 0' }}>
              {formatCurrency ? formatCurrency(totalPrice) : `₹ ${totalPrice}`}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={downloadPDF}
          style={{ backgroundColor: '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', cursor: 'pointer', border: 'none' }}
        >
          <FaDownload /> Download Ticket (PDF)
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#e5e7eb', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
        >
          <FaHome /> Back to Home
        </button>
      </div>
    </div>
  );
}

export default BookingConfirmation;