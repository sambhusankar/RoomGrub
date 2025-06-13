
import { LoginRequired } from "@/policies/LoginRequired";
import AddGrocery from './_components/AddGroccery'

export default function page() {
    const session = LoginRequired();
    
    
    return (
        <AddGrocery />
    );
}