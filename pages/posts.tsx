import React from 'react'
import getSession from "./api/getSession"

const posts = () => {
  //const st = JSON.stringify(getSession());
  const st = JSON.stringify(getSession());
  return (
    <h2>post {st}</h2>

    
  )
}

export default posts

// posts.getLayout = function getLayout(page) {
//   return (
//     <Layout>
//       <Sidebar />
//       {page}
//     </Layout>
//   )
// }