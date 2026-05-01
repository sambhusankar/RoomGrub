import { LoginRequired } from '@/policies/LoginRequired';
import NavBarContainer from '@/components/NavBarContainer';
import RoomsPage from './_components/RoomsPage';

export default async function Home() {
  await LoginRequired();

  return (
    <NavBarContainer>
      <RoomsPage />
    </NavBarContainer>
  );
}
