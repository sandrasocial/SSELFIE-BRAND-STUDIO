import { FC } from 'react';
import { ServicesList } from '../components/editorial/ServicesList.js';
import { PricingPackages } from '../components/editorial/PricingPackages.js';
import { Testimonials } from '../components/editorial/Testimonials.js';
import { BookingWidget } from '../components/editorial/BookingWidget.js';

const ServicesPage: FC = () => {
  return (
    <div className="services-page luxury-layout">
      <ServicesList />
      <PricingPackages />
      <Testimonials style="editorial" />
      <BookingWidget integration="stripe" />
    </div>
  );
};

export default ServicesPage;