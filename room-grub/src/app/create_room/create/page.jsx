
export default function page(){
    return(
        <div>
            <h1>Create a room</h1>
            <form className="flex flex-col gap-4 p-4">
                <input 
                    type="text" 
                    placeholder="Room Name" 
                    className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                    type="number" 
                    placeholder="Max Participants" 
                    className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                    type="submit" 
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => {
                        
                        console.log('Room created');
                    }}
                >   
                    Create Room
                </button>
            </form>
        </div>
    )
}