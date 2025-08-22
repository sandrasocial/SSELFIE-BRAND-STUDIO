const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1440px'
};

export const devices = {
  mobile: `@media (min-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  laptop: `@media (min-width: ${breakpoints.laptop})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`
};

export const typography = {
  h1: {
    fontSize: '2.5rem',
    lineHeight: '1.2',
    fontFamily: '"Times New Roman", serif',
    [`${devices.tablet}`]: {
      fontSize: '3rem'
    },
    [`${devices.laptop}`]: {
      fontSize: '3.5rem'
    }
  },
  h2: {
    fontSize: '2rem',
    lineHeight: '1.3',
    fontFamily: '"Times New Roman", serif',
    [`${devices.tablet}`]: {
      fontSize: '2.5rem'
    }
  },
  body: {
    fontSize: '1rem',
    lineHeight: '1.5',
    [`${devices.tablet}`]: {
      fontSize: '1.125rem'
    }
  }
};