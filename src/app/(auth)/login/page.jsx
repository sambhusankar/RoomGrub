import LoginPage from './_components/LoginPage';

export default async function Login({ searchParams }) {
  const params = await searchParams;
  return <LoginPage inviteToken={params?.invite_token || null} />;
}
