
import { signIn, signOut, useSession } from "next-auth/react";

const IndexPage = () => {
  const { data: session, status } = useSession();
  
  if (status == "loading") {
    return <div>Loading...</div>;
  }
  
  if (session) {
    return (
      <div>
        Hello, {session?.user?.email ?? session?.user?.name} and {JSON.stringify(session)}<br />
        <button onClick={() => signOut()}>Sign out</button>
      </div>

    );
  } else {
    return (
      <div>
        You are not logged in! <br />
        <button onClick={() => signIn()}>Sign in</button>
      </div>
    );
  }
};

export default IndexPage;