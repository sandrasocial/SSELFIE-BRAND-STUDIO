import React from 'react';
import { ServicesList } from '../components/editorial/ServicesList';
import { PricingPackages } from '../components/editorial/PricingPackages';
import { Testimonials } from '../components/editorial/Testimonials';
import { BookingWidget } from '../components/editorial/BookingWidget';

const ServicesPage: React.FC = () => {
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