
import { signIn } from "next-auth/react";
import { IExtSession, IProjItem } from '../components/types';
import type { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

import React, { useMemo, useState } from 'react';
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Head from 'next/head'
import {
  Box,
  Button,
  Stack,
  Typography 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getProjItemData } from './api/projItemTable'


type serverRet = {
  session: IExtSession | null;
  initialItemProjTable?: any | null;
}

async function getTableData(ownerId: string) {
  console.log('ownerId',ownerId)
  try 
  {
    const responce = await fetch('/api/projItemTable', {
      method: 'GET',
    });
    
    
    if (!responce.ok) {
      throw new Error(responce.statusText);
    }
    const ret = await responce.json();
    console.log('ret',ret)
    return ret;

  } catch (err) {
    console.log(err);
  }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

  const extSession: IExtSession | null = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

  
  let pItems: IProjItem[] | undefined = [];
  
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
  //console.log('ret',ret)
  const extSession: IExtSession | null = ret.session;
  
  const [showProgressBars,setShowProgressBars]=useState(false)
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
      setShowProgressBars(true);

      await getTableData(ownerIdLocal);
      alert('Refresh page manually, please (temp issue)');
      

    } catch (err) {
      console.log(err);
    }
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
          Cell: ({ cell, row }) => (<Link href={row.original.url ? row.original.url : ""} passHref target="_blank">{row.original.bodyId}</Link>),
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
      {
        accessorKey: 'changedDate', 
        header: 'Changed Date',
        size: 80, //medium column
    },
    {
      accessorKey: 'changedBy', 
      header: 'Changed By',
      size: 80, //medium column
    },
    {
      accessorKey: 'inactiveDays', 
      header: 'Inactive Days',
      align: 'right',
      muiTableBodyCellProps: {
        align: 'right',
      },
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
      enableGrouping
      enableColumnOrdering
      enableColumnResizing 
      columnResizeMode="onChange"
      initialState={{ density: 'compact',
      pagination: {
        pageSize: 20,
        pageIndex: 0
      }}}
      state={{showProgressBars:showProgressBars}}
      renderDetailPanel={({ row }) => (
        <Box
          sx={{
            display: 'grid',
            margin: '10px 70px 20px 0px',
            gridTemplateColumns: '1fr 1fr',
            width: '100%',
            gap: '10px',
          }}
        >
          <Typography><b>Description:</b> {row.original.description}</Typography>
          <Typography><b>Last message:</b> {row.original.history}</Typography>
        </Box>
      )}      
      renderTopToolbarCustomActions={() => (
        <Stack direction='row'><Button 
            onClick={() => {
              try
              {
                refreshData(ownerId);
              }              
              catch (err) {
                console.log(err);
              }
            }}
            variant="contained"
            endIcon={<SendIcon />}
        >
            Refresh
        </Button>
        
        </Stack> 
    )}
    />
  </div>
);

};

export default IndexPage;