import React from 'react'
import { useSession } from "next-auth/react";

const Posts = () => {
  //const st = JSON.stringify(getSession());
  const st = JSON.stringify(useSession().data);
  return (
    <h2>post: {st}</h2>

    
  )
}

export default Posts

// posts.getLayout = function getLayout(page) {
//   return (
//     <Layout>
//       <Sidebar />
//       {page}
//     </Layout>
//   )
// }