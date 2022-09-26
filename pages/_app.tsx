import { SessionProvider } from "next-auth/react"
import { Session } from "next-auth";
import type { AppProps } from "next/app"
import Sidebar from "../components/slide-menu-bar"
//import "./styles.css"

export default function App({ Component, pageProps }: AppProps<{
  session: Session;
}>) {
  
  return (

    <SessionProvider session={pageProps.session} >
      <Sidebar />
      <Component {...pageProps} />
    </SessionProvider>
  )
}