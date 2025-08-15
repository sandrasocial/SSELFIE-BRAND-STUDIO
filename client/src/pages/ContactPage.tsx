import React from 'react';
import { ContactForm } from '../components/editorial/ContactForm';
import { CalendarBooking } from '../components/editorial/CalendarBooking';
import { SocialLinks } from '../components/editorial/SocialLinks';
import { LocationInfo } from '../components/editorial/LocationInfo';

const ContactPage: React.FC = () => {
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