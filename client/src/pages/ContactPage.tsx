import { FC } from 'react';
import { ContactForm } from '../components/editorial/ContactForm.js';
import { CalendarBooking } from '../components/editorial/CalendarBooking.js';
import { SocialLinks } from '../components/editorial/SocialLinks.js';
import { LocationInfo } from '../components/editorial/LocationInfo.js';

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