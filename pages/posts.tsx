import React from 'react'
import { useSession } from "next-auth/react";



const posts = () => {
  const { data: session, status } = useSession();
  const st = JSON.stringify(session);
  return (
    <h2>post {st}</h2>
    
    
  )
}

export default posts