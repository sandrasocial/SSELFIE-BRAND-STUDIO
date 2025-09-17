import { UserButton } from "@stackframe/stack";

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
