
import React from 'react';


export default async function page({params}){
    const { room_id} = params;
    console.log(params)
    return(
        <div>
            <h2>Manage your room wisely {room_id}</h2>
            <div>
                <ul>
                    <li><a href = "">Members</a></li>
                    <li><a href = "">Balance</a></li>
                    <li><a href = "">Expenses</a></li>
                    <li><a href = "">Paymets</a></li>
                </ul>
            </div>
        </div>
    )
}