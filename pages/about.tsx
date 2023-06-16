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
        <meta name="description" content="ADO Query runner for" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          About
        </h1>
        <br />
        <p><strong>The main goal of this project is to create a simple web application that allows the querying of ADO work items and displays them in a list.</strong></p>

        <div>
          <h2>Main menu</h2>
          <Image src='/images/01.Menu.png' width={238} height={588} alt=''/>
        </div>
        <h2>PAT</h2>
        <p>The tool has a Personal Access Token (PAT) to authenticate to Azure DevOps (ADO), enabling the querying of work items using the ADO REST API.</p>

        <p>How to create a personal access token: <a href="https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops">MS documentation</a></p>
        <div>
          <h3>PAT listpage</h3>
          <Image src='/images/02.PATsetup.png' width={1881} height={597} alt=''/>
        </div>
        <div>
          <p>All necessary information about the PAT can be entered into the form and saved to the database, where:</p>
          <ul>
            <li>Pat id - identifier of the token in the site</li>
            <li>Description - description of the token</li>
            <li>Pat - token from Azure DevOps</li>
            <li>Expiration date - the date when the token will expire</li>
          </ul>
        </div>





        <h2>Project</h2>
        <p>Afterward, projects can be created. A project represents any query from Azure DevOps and has the following list of properties:</p>

        <div>
          <h3>Project listpage</h3>
          <Image src='/images/03.Projectlist.png' width={1649} height={651} alt=''/>
        </div>
        <ul>
          <li>ProjId - internal identifier of the project</li>
          <li>Organization, project name - there are two types of projects in ADO.
            <ul>
              <li>First type is https://dev.azure.com/[organisation]/[project name]/</li>
              <li>Second type is https://[fixed value].visualstudio.com/[project name]/</li>
            </ul>
          </li>
          <li>Query Id - identifier of the query in ADO</li>
          <li>URL to Project - link to the project in ADO</li>
          <li>PAT - personal access token for this project</li>
          <li>query Name - name of the Query</li>
          <li>Disabled - indicates whether this project is disabled or enabled for update</li>
        </ul>
        <div>
          <h3>Project property</h3>
          <Image src='/images/04.ProjectPropertyes.png' width={456} height={769} alt=''/>
        </div>

        <h2>Items</h2>
        <p>Project items - this is a list of work items from ADO for each project associated with the ADO query</p>
        <ul>
          <li>Project - project field from the project table</li>
          <li>Query name - query name from the project table</li>
          <li>Item type - type of ADO Item</li>
          <li>State - ADO state</li>
          <li>Assigned to - name of the person the item is assigned to (each project can have a different name assigned to it)</li>
          <li>Email - email of the person the item is assigned to</li>
          <li>id - id for the item in ADO. You can click on the URL in this field and be directed to ADO itself</li>
          <li>Title - title of the item</li>
          <li>Priority - priority of the item</li>
          <li>Severity - severity of the item</li>
          <li>Changed date - date when the item was last changed</li>
          <li>Changed by - name of the person who last changed the item</li>
          <li>Inactive days - how many days the item has been inactive</li>
          <li>Description - description of the item</li>
          <li>Last message - last message for the item</li>
        </ul>

        <div>
          <h3>List of ADO items</h3>
          <Image src='/images/05.ListOfItems.png' width={1901} height={869} alt=''/>
        </div>

        <div>
          <p>You can filter, sort, group, and expand items on the page.</p>
          <p>You can group items by fields and filter by the entire dataset or individual fields.</p>
          <p>You can have several group by fields.</p>
        </div>
        <div>
          <h3>Column actions</h3>
          <Image src='/images/06.TablesProperty.png' width={1879} height={656} alt=''/>
        </div>

        <h2>Authentication</h2>
        <div>Next-auth is used to authenticate users. Currently, you can authenticate using a custom email or a GitHub account.
        </div>

        <h2>Known issues</h2>
        <ul>
          <li>Refresh button: When you press the refresh button, it starts the update process but does not display any changes on the main page. The workaround is to refresh the page in the browser.</li>
          <li>After creating an access token, the Expiration date field shows the date and time. The workaround is to refresh the page in the browser.</li>
          <li>The Project disable field can only accept the string value true or false. The workaround is to manually enter true or false.</li>
        </ul>

        <h2>Future plans</h2>
        <ul>
          <li>Add more authentication providers (e.g., Google).</li>
          <li>Add the ability to replace one value with another. For example, you can have different email or nickname for each project. The main idea here is to have one standard list for comfortable grouping, filtering, and so on.</li>
          <li>Update index page items on page load.</li>
          <li>Mark new lines in some way (possibly with a new field tick box and color-coded lines).</li>
          <li>Remember the table state for each user. The best choice is to implement it similar to D365FO/CE, where you can save several views and make one of them the default.</li>
        </ul>
      </main>
      <br />
      <p className={styles.footer}>{sessionInfo}</p>
    </div>
  )
}

export default About