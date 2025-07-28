'use server'
import { LoginRequired } from "@/policies/LoginRequired";
import { validRoom } from "@/policies/validRoom";
import AddGrocery from './_components/AddGroccery'

export default async function page({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });

  return (
      <AddGrocery />
  );
}