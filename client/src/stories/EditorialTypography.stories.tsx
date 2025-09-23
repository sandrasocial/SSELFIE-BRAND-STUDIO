import React from 'react';
import { EditorialHeading, EditorialText } from '../components/editorial/EditorialTypography';

export default {
  title: 'Editorial/EditorialTypography',
};

export const Headings = () => (
  <>
    <EditorialHeading level={1}>Heading 1</EditorialHeading>
    <EditorialHeading level={2}>Heading 2</EditorialHeading>
    <EditorialHeading level={3}>Heading 3</EditorialHeading>
    <EditorialHeading level={4}>Heading 4</EditorialHeading>
    <EditorialHeading level={5}>Heading 5</EditorialHeading>
    <EditorialHeading level={6}>Heading 6</EditorialHeading>
  </>
);

export const TextVariants = () => (
  <>
    <EditorialText variant="body">Body Text</EditorialText>
    <EditorialText variant="caption">Caption Text</EditorialText>
    <EditorialText variant="small">Small Text</EditorialText>
  </>
);
