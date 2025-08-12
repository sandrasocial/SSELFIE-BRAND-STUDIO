import { FC } from 'react';
interface VisualDesignPreviewProps {
  designContent?: string;
  previewType?: 'component' | 'layout' | 'page' | 'email';
  onApprove?: (approved: boolean) => void;
}

export const VisualDesignPreview: FC<VisualDesignPreviewProps> = ({
  designContent,
  previewType = 'component',
  onApprove
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!designContent) {
    return (
      <div className="border border-gray-200 bg-gray-50 p-6 text-center">
        <div className="text-sm text-gray-600">No design preview available</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 bg-white">
      {/* Preview Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 uppercase tracking-wide">Design Preview</div>
          <div className="font-serif text-lg">{previewType.charAt(0).toUpperCase() + previewType.slice(1)} Design</div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm uppercase tracking-wide text-gray-600 hover:text-black"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {/* Preview Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-screen' : 'max-h-96'} overflow-auto`}>
        <div className="p-6">
          {/* Design Content Renderer */}
          <div className="space-y-6">
            {previewType === 'component' && (
              <ComponentPreview content={designContent} />
            )}
            {previewType === 'layout' && (
              <LayoutPreview content={designContent} />
            )}
            {previewType === 'page' && (
              <PagePreview content={designContent} />
            )}
            {previewType === 'email' && (
              <EmailPreview content={designContent} />
            )}
          </div>
        </div>
      </div>
      
      {/* Approval Actions */}
      {onApprove && (
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={() => onApprove(true)}
            className="px-6 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-gray-800"
          >
            Approve & Implement
          </button>
          <button
            onClick={() => onApprove(false)}
            className="px-6 py-2 border border-gray-300 text-sm uppercase tracking-wide hover:bg-gray-50"
          >
            Request Changes
          </button>
        </div>
      )}
    </div>
  );
};

function ComponentPreview({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 uppercase tracking-wide">Component Structure</div>
      <div className="bg-gray-50 p-4 font-mono text-sm overflow-x-auto">
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>
      <div className="text-sm text-gray-600 uppercase tracking-wide">Visual Mockup</div>
      <div className="border border-gray-300 bg-white p-8 min-h-32">
        <div className="text-center text-gray-500">
          Interactive preview would render here
        </div>
      </div>
    </div>
  );
}

function LayoutPreview({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 uppercase tracking-wide">Layout Design</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-gray-500 mb-2">DESIGN SPECIFICATIONS</div>
          <div className="bg-gray-50 p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-2">VISUAL PREVIEW</div>
          <div className="border border-gray-300 bg-white aspect-[4/3] p-4">
            <div className="h-full flex items-center justify-center text-gray-500">
              Layout preview mockup
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PagePreview({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 uppercase tracking-wide">Page Design</div>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4">
          <div className="text-xs text-gray-500 mb-2">PAGE STRUCTURE</div>
          <div className="font-mono text-sm">
            <pre className="whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
        <div className="border border-gray-300 bg-white">
          <div className="text-xs text-gray-500 p-4 border-b border-gray-200">FULL PAGE PREVIEW</div>
          <div className="aspect-[16/10] p-8 flex items-center justify-center text-gray-500">
            Full page mockup would render here
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ content }: { content: string }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 uppercase tracking-wide">Email Design</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-gray-500 mb-2">EMAIL CONTENT</div>
          <div className="bg-gray-50 p-4 font-mono text-sm max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{content}</pre>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-2">EMAIL PREVIEW</div>
          <div className="border border-gray-300 bg-white max-h-64 overflow-y-auto">
            <div className="p-4 space-y-3">
              <div className="border-b border-gray-200 pb-2 text-sm">
                <div className="font-medium">Sandra Social &lt;hello@sselfie.ai&gt;</div>
                <div className="text-gray-600">Subject: Email preview</div>
              </div>
              <div className="text-sm">
                <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}