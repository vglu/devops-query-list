import React from 'react'
import { useSession } from "next-auth/react";

const About = () => {
  const { data: session, status } = useSession();
  return (
    <>About 
        <br />
        {JSON.stringify(session)}
    </>
  )
}

export default About