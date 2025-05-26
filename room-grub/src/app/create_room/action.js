'use client'
import {createClient} from "@/utils/supabase/client"
export function PrepareRoom(){
    const supabase = createClient()
    console.log("Get into action")
    const getSession = async function(){
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log(session);
    if (error || !session) {
        console.error('Auth error:', error)
        //return router.push('/login?message=Authentication failed')
      }

      const user = session?.user
      return user;
    }
      console.log("==========================");
      console.log(getSession);
    console.log("Retived user session")
    console.log("===========================");

    async function InsertRoom(session){
        const user = await session;
    const { error: insertError } = await supabase
          .from("Rooms")
          .insert({
            members: 1,
            admin: user.email
    })
    }
    InsertRoom(getSession)

}
