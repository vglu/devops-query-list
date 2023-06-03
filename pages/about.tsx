import React from 'react';
import { useSession } from "next-auth/react";
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import Image from "next/legacy/image"
import { IExtSession } from '../components/types';

const About = () => {
  const { data: session, status } = useSession();
  const sessionInfo = JSON.stringify(session?.user, null , 2);
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
        <p><strong>Main goal of this project is to create a simple web application to query ADO work items and display them in a list.</strong></p>

        <div>
          <h2>Main menu</h2>
          <Image src='/images/01.Menu.png' width={238} height={588} />
        </div>
        <h2>PAT</h2>
        <p>We have Personal access token (PAT) to authenticate to ADO and we can query work items using ADO REST API.</p>

        <p>How create personal access token: <a href="https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops">MS documentation</a></p>
        <div>
          <h3>PAT listpage</h3>
          <Image src='/images/02.PATsetup.png' width={1881} height={597} />
        </div>
        <div>
          <p>You can enter all necessary information about PAT to the form and save it to the database, where</p>
          <ul>
            <li>Pat id - identifier of your token in the site</li>
            <li>Description - description of your token</li>
            <li>Pat - token from Azure DevOps</li>
            <li>Expiration date - date when token will be expired</li>
          </ul>
        </div>





        <h2>Project</h2>
        <p>After than you can create projects. Project this is representation of any query from Azure DevOps. Project has this list of properties:</p>

        <div>
          <h3>Project listpage</h3>
          <Image src='/images/03.Projectlist.png' width={1649} height={651} />
        </div>
        <ul>
          <li>ProjId - internal identifier of project</li>
          <li>Organization, project name - we have 2 type of projects in ADO.
            <ul>
              <li>First type is https://dev.azure.com/[organisation]/[project name]/</li>
              <li>Second type is https://[fixed value].visualstudio.com/[project name]/</li>
            </ul>
          </li>
          <li>Query Id - identifier of query in ADO</li>
          <li>URL to Project - link to project in ADO</li>
          <li>PAT - personal access token for this project</li>
          <li>query Name - name of the Query</li>
          <li>Disabled - is this project disable or enable for update</li>
        </ul>
        <div>
          <h3>Project property</h3>
          <Image src='/images/04.ProjectPropertyes.png' width={456} height={769} />
        </div>

        <h2>Items</h2>
        <p>Project items - this is list of work items from ADO for each project associated with ADO query</p>
        <ul>
          <li>Project - project field from project table</li>
          <li>Query name - query name from project table</li>
          <li>Item type - type of ADO Item</li>
          <li>State - ADO state</li>
          <li>Assigned to - name of person for item assigned to (each project can have you with different name)</li>
          <li>Email - email of person for item assigned to</li>
          <li>id - id for item in ADO. You can click url on this field and follow to the ADO itself</li>
          <li>Title - title of item</li>
          <li>Priority - priority of item</li>
          <li>Severity - severity of item</li>
          <li>Changed date - date when item was changed last time</li>
          <li>Changed by - name of person who changed item last time</li>
          <li>Inactive days - how many days item was inactive</li>
          <li>Description - description of item</li>
          <li>Last message - last message for item</li>
        </ul>

        <div>
          <h3>List of ADO items</h3>
          <Image src='/images/05.ListOfItems.png' width={1901} height={869} />
        </div>

        <div>
          <p>you can filter,sort,group expand items on the page</p>
          <p>you can group by fields, filter by all set of data or for individual fields</p>
          <p>you can have several group by fields</p>
        </div>
        <div>
          <h3>Column actions</h3>
          <Image src='/images/06.TablesProperty.png' width={1879} height={656} />
        </div>

        <h2>Authentication</h2>
        <div>We use next-auth to authenticate users.
          Now you can authenticate over custom email or over github account.
        </div>

        <h2>Known issues</h2>
        <ul>
          <li>Refresh button: when you press refresh button it start update process but not show any changes in the main page. Workaround it is refresh page in browser.</li>
          <li>After create access token Expiration date field shows date and time. Workaround it is refresh page in browser.</li>
          <li>Project disable field can accept only string value true and false. Workaround it is enter true or false manually.</li>
        </ul>

        <h2>Future plans</h2>
        <ul>
          <li>add more authentication providers google ...</li>
          <li>add possibility to make replace one value to another. Example - on each project you can have different email or nick name. Main idea here it is has one standard list to comfortable group by, filtering and so on</li>
          <li>update index page items on load page</li>
          <li>mark somehow new lines (probably new field tick box and color line somehow)</li>
          <li>remember state for table for each user. Best choice to do like in D365FO/CE where you can save several views and make one of them like default</li>
        </ul>
      </main>
      <br />
      <p className={styles.footer}>{sessionInfo}</p>
    </div>
  )
}

export default About