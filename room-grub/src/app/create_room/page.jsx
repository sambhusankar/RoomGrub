import React from 'react';

export default async function page(){
    return(
        <div>
            <h2>You are not joined any room</h2>
            <div>
                <Button>Create & Manage Your room</Button>
                <p>------------</p>
                <p>Tell your friend to add you as a member</p>
            </div>
        </div>
    )
}