import { LoginRequired } from '@/policies/LoginRequired';
import NavBarContainer from '@/components/NavBarContainer';
import { getUserRooms } from '../actions';
import RoomsPage from './_components/RoomsPage';

export default async function Home() {
  await LoginRequired();
  const initialData = await getUserRooms();

  return (
    <NavBarContainer>
      <RoomsPage initialData={initialData} />
    </NavBarContainer>
  );
}
