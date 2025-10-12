import { FC } from 'react';
import styled from 'styled-components';

// Note: styled-components has type resolution issues with Node16 module resolution
// Using @ts-expect-error to suppress these known TypeScript errors

interface LuxuryCardProps {
  title: string;
  subtitle?: string;
  content: string;
  imageSrc?: string;
}

// @ts-expect-error TS2339: styled-components type resolution issue
const CardContainer = styled.div`
  background: #ffffff;
  border: 1px solid #0a0a0a;
  padding: 2.5rem;
  margin: 2rem 0;
  max-width: 800px;
  font-family: 'Times New Roman', Times, serif;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const CardTitle = styled.h2`
  color: #0a0a0a;
  font-family: 'Times New Roman', Times, serif;
  font-size: 2.5rem;
  font-weight: normal;
  letter-spacing: 0.02em;
  margin: 0 0 1rem 0;
  line-height: 1.2;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const CardSubtitle = styled.h3`
  color: #666666;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.5rem;
  font-weight: normal;
  font-style: italic;
  margin: 0 0 2rem 0;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const CardContent = styled.div`
  color: #0a0a0a;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 0;
`;

// @ts-expect-error TS2339: styled-components type resolution issue
const LuxuryImage = styled.img`
  width: 100%;
  height: auto;
  margin: 2rem 0;
  display: block;
`;

const LuxuryCard: FC<LuxuryCardProps> = ({
  title,
  subtitle,
  content,
  imageSrc
}) => {
  return (
    <CardContainer>
      <CardTitle>{title}</CardTitle>
      {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
      {imageSrc && <LuxuryImage src={imageSrc} alt={title} />}
      <CardContent>{content}</CardContent>
    </CardContainer>
  );
};

export default LuxuryCard;