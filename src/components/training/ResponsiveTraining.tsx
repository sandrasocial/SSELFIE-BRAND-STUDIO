import React from 'react';
import styles from './ResponsiveTraining.module.css';
import { ImageUploader } from './ImageUploader';
import { TrainingProgress } from './TrainingProgress';

interface TrainingProps {
  onUpload: (files: File[]) => Promise<void>;
  progress: number;
  status: string;
}

export const ResponsiveTraining: React.FC<TrainingProps> = ({
  onUpload,
  progress,
  status
}) => {
  return (
    <div className={styles.trainingContainer}>
      <div className={styles.uploadSection}>
        <ImageUploader onUpload={onUpload} />
      </div>
      
      <div className={styles.progressSection}>
        <TrainingProgress 
          progress={progress}
          status={status}
        />
      </div>
      
      <div className={styles.instructionsSection}>
        <h3>Training Instructions</h3>
        <ul>
          <li>Upload 10-20 high-quality selfies</li>
          <li>Ensure good lighting and clear faces</li>
          <li>Mix different angles and expressions</li>
          <li>Avoid group photos or busy backgrounds</li>
        </ul>
      </div>
    </div>
  );
};