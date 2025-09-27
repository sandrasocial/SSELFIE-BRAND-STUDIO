import React, { useState, useEffect } from 'react';
import { MobileTabLayout } from './MobileTabLayout.js';

// Editorial Luxury AppLayout - Simplified Container Only
export function AppLayout() {
  // Simply render MobileTabLayout directly without double layout nesting
  return <MobileTabLayout />;
}

export default AppLayout;