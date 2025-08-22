import { act } from '@testing-library/react';

// Utility to check if styles are properly applied
export const checkStylesApplied = async (element, expectedStyles) => {
  await act(async () => {
    const computedStyles = window.getComputedStyle(element);
    return Object.entries(expectedStyles).every(
      ([property, value]) => computedStyles[property] === value
    );
  });
};

// Utility to test ref forwarding
export const testRefForwarding = async (Component, props = {}) => {
  const ref = React.createRef();
  await act(async () => {
    render(<Component {...props} ref={ref} />);
  });
  return ref.current !== null;
};

// Utility to test style consistency during concurrent updates
export const testStyleConsistency = async (Component, props = {}) => {
  let result;
  await act(async () => {
    result = render(<Component {...props} />);
  });
  return result.container;
};