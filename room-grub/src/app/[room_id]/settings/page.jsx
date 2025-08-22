'use server'
import Month from './_components/Month'
import {LoginRequired} from '@/policies/LoginRequired'
import { validRoom } from '@/policies/validRoom';

export default async function page({params}){
  const userr = await LoginRequired();
  await validRoom({params});
  return(
    <>
    <Month />
    </>
  )
}