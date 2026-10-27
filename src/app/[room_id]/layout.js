import NavBarContainer from '@/components/NavBarContainer';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import RememberRoom from './_components/RememberRoom';

export default async function RoomLayout({ children, params }) {
  await LoginRequired();
  const membership = await validRoom({ params });
  return (
    <NavBarContainer>
      {membership && <RememberRoom roomId={membership.room} />}
      {children}
    </NavBarContainer>
  );
}
