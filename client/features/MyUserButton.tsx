import * as stackAuth from "@stackframe/react";
// @ts-ignore - Stack Auth has broken ESM exports, using workaround
const { UserButton } = (stackAuth as any).default || stackAuth;

// Replace with your actual icon component
function CustomIcon() {
  return <span className="inline-block w-4 h-4 bg-[#bfa77a] rounded-full" />;
}

export function MyUserButton() {
  return (
    <UserButton
      showUserInfo={true}
      extraItems={[{
        text: 'Custom Action',
        icon: <CustomIcon />,
        onClick: () => console.log('Custom action clicked')
      }]}
    />
  );
}
