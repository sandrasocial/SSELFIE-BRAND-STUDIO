import { AccountSettings } from '@stackframe/stack';

// Replace with your actual icon and content components
function SettingsIcon() {
  return <span className="inline-block w-4 h-4 bg-[#bfa77a] rounded-full" />;
}
function CustomContent() {
  return <div className="text-[#6b5e4e]">Luxury custom content goes here.</div>;
}

export default function MyAccountPage() {
  return (
    <AccountSettings
      fullPage={true}
      extraItems={[{
        id: 'custom-section',
        title: 'Custom Section',
        icon: <SettingsIcon />,
        content: <CustomContent />
      }]}
    />
  );
}
