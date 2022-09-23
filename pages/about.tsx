import React from 'react'
import getSession from "./api/getSession"

const about = () => {
  return (
    <>About 
        <br />
        {JSON.stringify(getSession())}
    </>
  )
}

export default about

// posts.getLayout = function getLayout(page) {
//   return (
//     <Layout>
//       <Sidebar />
//       {page}
//     </Layout>
//   )
// }