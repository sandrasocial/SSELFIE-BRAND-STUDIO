import { FC } from 'react';
import { ChatInterface } from './ChatInterface';

interface DeveloperPreviewProps {
  currentPage: string;
  onEdit: (edit: {
    component: string;
    property: string;
    value: any;
  }) => void;
}

const DeveloperPreview: FC<DeveloperPreviewProps> = ({
  currentPage,
  onEdit
}) => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  return (
    <div className="developer-preview-container">
      <div className="preview-window">
        <div className="preview-header">
          <h2>Real-time Preview</h2>
          <div className="device-toggle">
            <button>Desktop</button>
            <button>Tablet</button>
            <button>Mobile</button>
          </div>
        </div>
        
        <div className="preview-frame">
          <iframe 
            src={`/preview/${currentPage}`}
            title="Website Preview"
            className="preview-iframe"
          />
        </div>
      </div>

      <ChatInterface
        onSendMessage={(message) => {
          // Handle chat messages and live edits
        }}
        activeComponent={activeComponent}
        onComponentSelect={(component) => setActiveComponent(component)}
      />
    </div>
  );
};

export default DeveloperPreview;