import React, { FC, useCallback, useMemo, useState } from 'react';
import MaterialReactTable, { MaterialReactTableProps, MRT_Cell, MRT_ColumnDef, MRT_Row } from 'material-react-table';
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
import { DateRangeTwoTone, Delete, Edit } from '@mui/icons-material';
import styles from '../styles/Home.module.css';
import Head from 'next/head'
import Image from 'next/image'
import { PrismaClient, ProjTable, PatTable, Prisma } from '@prisma/client';
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import type { GetServerSidePropsContext } from "next"
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import Autocomplete from '@mui/material/Autocomplete';

const prisma = new PrismaClient();

type Proj = {
    projId: string,
    org: string,
    project: string, 
    query: string,
    url: string,
    patId: string,
    queryName: string,
    ownerId: string,
    patTablePatId:string
};

let pats: PatTable[];

export async function getServerSideProps(context: GetServerSidePropsContext) { 
    
    const session = await unstable_getServerSession(
        context.req,
        context.res,
        authOptions
      );
    const projs: ProjTable[] = await prisma.projTable.findMany({
        where: {
            ownerId: {
                equals: session?.user?.id,
            }
        }
    });
    const patsLocal: PatTable[] = await prisma.patTable.findMany({
        where: {
            ownerId: {
                equals: session?.user?.id,
            }
        }
    });
    return {
        props: {
            session: session,
            initialProjTable: JSON.parse(JSON.stringify(projs)),
            initialPatTable: JSON.parse(JSON.stringify(patsLocal))
        }
    };
}

async function saveProjs(proj: Prisma.ProjTableCreateInput) {
    const responce = await fetch('/api/projTable', {
        method: 'POST',
        body: JSON.stringify(proj)
    });

    if (!responce.ok) {
        throw new Error(responce.statusText);
    }

    return await responce.json();
}

async function updateProjs(proj: Prisma.ProjTableCreateInput) {
    const responce = await fetch('/api/projTable', {
        method: 'PUT',
        body: JSON.stringify(proj)
    });

    if (!responce.ok) {
        throw new Error(responce.statusText);
    }

    return await responce.json();
}

async function deleteProjs(proj: Prisma.ProjTableCreateInput) {
    const responce = await fetch('/api/projTable', {
        method: 'DELETE',
        body: JSON.stringify(proj)
    });

    if (!responce.ok) {
        throw new Error(responce.statusText);
    }

    return await responce.json();
}


function ProjTable({ session, initialProjTable, initialPatTable }) {

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState<ProjTable[]>(() => initialProjTable);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});
    pats = initialPatTable;
    const patList = pats.map(element => element.patId);
    
    const ownerId = session?.user?.id;

    const handleCreateNewRow = async (values) => {
        values.ownerId = ownerId;
        tableData.push(values);
        setTableData([...tableData]);
        try {
            await saveProjs(values);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSaveRowEdits: MaterialReactTableProps<Proj>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
        if (validationErrors && !Object.keys(validationErrors).length) {
            values.ownerId = ownerId;
            tableData[row.index] = values;
            // send/receive api updates here, then refetch or update local table data for re-render
            setTableData([...tableData]);
            exitEditingMode(); // required to exit editing mode and close modal
            try {
                await updateProjs(values)
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleDeleteRow = useCallback(async (row: MRT_Row<Proj>) => {
        const delProj = row.original;

        if (!confirm(`Are you sure you want to delete ${delProj.projId}`)) {
            return;
        }
        // send api delete request here, then refetch or update local table data for re-render
        tableData.splice(row.index, 1);
        setTableData([...tableData]);
        try {
            await deleteProjs(delProj)
        } catch (err) {
            console.log(err);
        }

    }, [tableData],);

    const getCommonEditTextFieldProps = useCallback((cell: MRT_Cell<Proj>,): MRT_ColumnDef<Proj>['muiTableBodyCellEditTextFieldProps'] => {
        return {
            error: !!validationErrors[cell.id],
            helperText: validationErrors[cell.id],
            onBlur: (event) => {
                const isValid = cell.column.id === 'projId' ? validateRequired(event.target.value): true;
                if (!isValid) { // set validation error for cell if invalid
                    setValidationErrors({
                        ...validationErrors,
                        [cell.id]: `${cell.column.columnDef.header} is required`
                    });
                } else { // remove validation error for cell if valid
                    delete validationErrors[cell.id];
                    setValidationErrors({
                        ...validationErrors
                    });
                }
            }
        };
    }, [validationErrors],);

    const columns = useMemo<MRT_ColumnDef<Proj>[]>(() => [
        {
            accessorKey: 'projId', // access nested data with dot notation
            header: 'ProjId',
            enableEditing: false
        },
        {
            accessorKey: 'org',
            header: 'Organisation',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        },
        {
            accessorKey: 'project',
            header: 'Project name',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        },
        {
            accessorKey: 'query', 
            header: 'Query Id',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        }, 
        {
            accessorKey: 'url',
            header: 'URL to Project',
            type: 'url',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        }, 
        {
            accessorKey: 'patTablePatId',
            header: 'PAT',

            muiTableBodyCellEditTextFieldProps: {
                select: true, //change to select for a dropdown
                children: patList.map((pt) => (
                  <MenuItem key={pt} value={pt}>
                    {pt}
                  </MenuItem>
                )),
                },
        }, 
        {
            accessorKey: 'queryName',
            header: 'queryName',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        }, 
    ], [getCommonEditTextFieldProps],);

    if (!session || !session.user) {
        return (
            <div>
                <h1>Not signed in</h1>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Setup personal access token</title>
                <meta name="description" content="Setup projects property" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className={styles.title}>
                Setup projects property
                </h1>
                <br />
            </main>
        <MaterialReactTable
            displayColumnDefOptions={{
                'mrt-row-actions': {
                    muiTableHeadCellProps: {
                        align: 'center',
                    },
                    size: 120,
                },
            }} 
            columns={columns}
            data={tableData}
            editingMode="modal" // default
            enableColumnOrdering
            enableEditing
            onEditingRowSave={handleSaveRowEdits}
            renderRowActions={({ row, table }) => (
                <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip arrow placement="left" title="Edit">
                    <IconButton onClick={() => table.setEditingRow(row)}>
                    <Edit />
                    </IconButton>
                </Tooltip>
                <Tooltip arrow placement="right" title="Delete">
                    <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                    <Delete />
                    </IconButton>
                </Tooltip>
                </Box>
                )}
            renderTopToolbarCustomActions={() => (
                    <Button 
                        onClick={() => setCreateModalOpen(true)}
                        variant="contained"
                    >
                        Create New project
                    </Button>
                )}
            />
            <CreateNewProjModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateNewRow}
            />
        </div>
    )
}

export const CreateNewProjModal: FC<{
    columns: MRT_ColumnDef<Proj>[];
    onClose: () => void;
    onSubmit: (values: Proj) => void;
    open: boolean;
    }> = ({ open, columns, onClose, onSubmit }) => {
    const [values, setValues] = useState<any>(() =>
      columns.reduce((acc, column) => {
        acc[column.accessorKey ?? ''] = '';
        return acc;
      }, {} as any),
    );
  
    const handleSubmit = () => {
      //put your validation logic here
      onSubmit(values);
      onClose();
    };
    

    // const patList = pats.map(element => { 
    //     return {value: element.patId, label: element.description}
    // });
    const patList = pats.map(element => element.patId); 
    
    const [pat, setPat] = React.useState<string | null>(patList[0]?.value);
    const [inputPatValue, setInputPatValue] = React.useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPat(event.target.value);
      };


    return (
      <Dialog open={open}>
        <DialogTitle textAlign="center">Create New project</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack
                sx={{
                    width: '100%',
                    minWidth: { xs: '300px', sm: '360px', md: '400px' },
                    gap: '1.5rem',
                }}
                >
                {columns.map((column) => {
                    if (column.accessorKey === 'patTablePatId') {
                        return <Autocomplete
                            key={column.accessorKey}
                            value = {pat}
                            onChange={(event: any, newValue: string | null) => {
                                setValues({ ...values, [event.target.name]: event.target.value })
                                setPat(event.target.value);
                            }}
                            inputValue={inputPatValue}
                            onInputChange={(event, newInputPatValue) => {
                            setInputPatValue(newInputPatValue);
                            }}
                            id="controllable-states-demo"
                            options={patList}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label={column.header} />}
                        />
                    }      

                    return <TextField
                        key={column.accessorKey}
                        label={column.header}
                        name={column.accessorKey}
                        type={column.type}
                        onChange={(e) =>
                            setValues({ ...values, [e.target.name]: e.target.value })
                        }
                    />
                    })}    
                </Stack>
            </LocalizationProvider>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
                Create New project
            </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const validateRequired = (value: string) => !!value.length;
  const validateEmail = (email: string) =>
    !!email.length &&
    email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );

  const validateAge = (age: number) => age >= 18 && age <= 50;


export default ProjTable;
