
import { signIn, signOut, useSession } from "next-auth/react";
import { IExtSession, IPat, IProj, IProjItem } from '../components/types';
import type { GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import React, { FC, useCallback, useMemo, useState } from 'react';
import MaterialReactTable, { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from 'material-react-table';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Head from 'next/head'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getProjItemData } from './api/projItemTable'


type serverRet = {
  session: IExtSession | null;
  initialItemProjTable?: any | null;
}

async function getTableData(ownerId: string) {

  try 
  {
    const responce = await fetch('/api/projItemTable', {
      method: 'POST',
      body: JSON.stringify({ ownerId: ownerId }),
    });
  
    if (!responce.ok) {
      throw new Error(responce.statusText);
    }
    return await responce.json();
  } catch (err) {
    console.log(err);
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const extSession: IExtSession | null = await unstable_getServerSession(
      context.req,
      context.res,
      authOptions
    );

  
  let pItems: IProjItem[] = [];
  
  if (extSession?.user?.id) {
    try {
      pItems = await getProjItemData(extSession.user.id);
    } catch (err) {
      console.log(err);
    }
  } 

  const ret: serverRet = {
    session: extSession,
    initialItemProjTable: pItems,
  }
  return {
      props: ret
  };
}

function IndexPage(ret: serverRet) {

  const extSession: IExtSession | null = ret.session;

  const [tableData, setTableData] = useState<IProjItem[]>(() => ret.initialItemProjTable);
  const [validationErrors, setValidationErrors] = useState<{
      [cellId: string]: string;
  }>({});

  const [ownerId, setOwnerId] = useState(() => extSession?.user?.id);

  //const ownerId = extSession?.user?.id;

  async function refreshData(ownerIdLocal: string) {

    try
    {
      console.log("refreshData");
      getTableData(ownerIdLocal);
    } catch (err) {
      console.log(err);
    }
    //.then((data) => {
    //  setTableData(data);
    //});
  }

  
  const columns = useMemo<MRT_ColumnDef<IProjItem>[]>(() => [
      {
          accessorKey: 'project', 
          header: 'Project',
          size: 80, //medium column
      },
      {
          accessorKey: 'queryName', 
          header: 'Query',
          size: 80, //medium column
      },
      {
          accessorKey: 'workItemType', 
          header: 'Item Type',
          size: 80, //medium column
      },
      {
          accessorKey: 'state', 
          header: 'State',
          size: 110, //medium column
      },
      {
          accessorKey: 'assignToName', 
          header: 'Assigned To',
          size: 80, //medium column
      },
      {
          accessorKey: 'assignToEmail', 
          header: 'Email',
          size: 100, //medium column
      },
      {
          accessorKey: 'bodyId', 
          header: 'id',
          Cell: ({ cell, row }) => (<Link href={row.original.url ? row.original.url : ""} passHref><a target="_blank">{row.original.bodyId}</a></Link>),
          size: 50, //medium column
      },
      {
          accessorKey: 'title', 
          header: 'Title',
          size: 150, //medium column
      },
      {
          accessorKey: 'priority', 
          header: 'Priority',
          size: 80, //medium column
      },
      {
          accessorKey: 'severity', 
          header: 'Severity',
          size: 80, //medium column
      },
    ], []
  );

if (!ownerId) {
  return (
      <div>
      You are not logged in! <br />
      <button onClick={() => signIn()}>Sign in</button>
      </div>
  );
}

return (
  <div className={styles.container}>
    <Head>
      <title>List of items</title>
      <meta name="description" content="List of items" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <h1 className={styles.title}>
          List of items
      </h1>
      <br />
    </main>
    <MaterialReactTable
      columns={columns}
      data={tableData}
      enableRowSelection //enable some features
      enableColumnOrdering
      enableColumnResizing 
      columnResizeMode="onChange"
      initialState={{ density: 'compact' }}
      renderTopToolbarCustomActions={() => (
        <Button 
            onClick={() => {
              alert('clicked');
              refreshData(ownerId)}
            }
            variant="contained"
            endIcon={<SendIcon />}
        >
            Refresh
        </Button>
    )}
    />
  </div>
);

};

export default IndexPage;