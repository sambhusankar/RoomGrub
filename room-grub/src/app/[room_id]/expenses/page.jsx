import ExpenseHistory from './_components/ExpenseHistory';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';

export default async function ExpensesPage({ params }) {
    const user = await LoginRequired();
    await validRoom({ params });
    
    return <ExpenseHistory />;
}