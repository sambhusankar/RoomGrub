import NavBarContainer from '@/components/NavBarContainer';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';

export default async function RoomLayout({ children, params }) {
  await LoginRequired();
  await validRoom({ params });
  return <NavBarContainer>{children}</NavBarContainer>;
}
