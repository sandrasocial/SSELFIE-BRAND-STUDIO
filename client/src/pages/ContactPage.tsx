import { FC } from 'react';

// Placeholder components to avoid import errors
const ContactForm: FC<{ leadCapture?: boolean }> = ({ leadCapture }) => (
  <div className="placeholder-component">
    <h2>Contact Form (Placeholder)</h2>
    <p>Lead capture: {leadCapture ? 'enabled' : 'disabled'}</p>
  </div>
);

const CalendarBooking: FC<{ integration?: string }> = ({ integration }) => (
  <div className="placeholder-component">
    <h2>Calendar Booking (Placeholder)</h2>
    <p>Integration: {integration}</p>
  </div>
);

const SocialLinks: FC<{ style?: string }> = ({ style }) => (
  <div className="placeholder-component">
    <h2>Social Links (Placeholder)</h2>
    <p>Style: {style}</p>
  </div>
);

const LocationInfo: FC = () => (
  <div className="placeholder-component">
    <h2>Location Info (Placeholder)</h2>
  </div>
);

const ContactPage: FC = () => {
  return (
    <div className="contact-page luxury-layout">
      <ContactForm leadCapture={true} />
      <CalendarBooking integration="calendar" />
      <SocialLinks style="editorial" />
      <LocationInfo />
    </div>
  );
};

export default ContactPage;