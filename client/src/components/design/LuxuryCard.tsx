import { FC } from 'react';
import styled from 'styled-components';

interface LuxuryCardProps {
  title: string;
  subtitle?: string;
  content: string;
  imageSrc?: string;
}

const CardContainer = styled.div`
  background: #ffffff;
  border: 1px solid #0a0a0a;
  padding: 2.5rem;
  margin: 2rem 0;
  max-width: 800px;
  font-family: 'Times New Roman', Times, serif;
`;

const CardTitle = styled.h2`
  color: #0a0a0a;
  font-family: 'Times New Roman', Times, serif;
  font-size: 2.5rem;
  font-weight: normal;
  letter-spacing: 0.02em;
  margin: 0 0 1rem 0;
  line-height: 1.2;
`;

const CardSubtitle = styled.h3`
  color: #666666;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.5rem;
  font-weight: normal;
  font-style: italic;
  margin: 0 0 2rem 0;
`;

const CardContent = styled.div`
  color: #0a0a0a;
  font-family: 'Times New Roman', Times, serif;
  font-size: 1.125rem;
  line-height: 1.8;
  margin: 0;
`;

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