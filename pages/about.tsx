import React from 'react';
import { useSession } from "next-auth/react";
import styles from '../styles/Home.module.css';
import Head from 'next/head';

const About = () => {
  const { data: session, status } = useSession();
  return (
    <div className={styles.container}>
      <Head>
        <title>About</title>
        <meta name="description" content="About ADO query list" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          About
        </h1>
        <br />
        
      </main>
      <br />
      {JSON.stringify(session)}
    </div>
  )
}

export default About