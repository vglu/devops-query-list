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
import { Delete, Edit } from '@mui/icons-material';
import styles from '../styles/Home.module.css';
import Head from 'next/head'
import Image from 'next/image'
import { PrismaClient, PatTable, Prisma } from '@prisma/client';
import Layout from "../components/Layout";
import 
const prisma = new PrismaClient();

type Pat = {
    patId: string,
    pat: string,
    dateExp: string,
    ownerId: string,
    description: string
}

export async function getServerSideProps(context) { 
    const pats: PatTable[] = await prisma.PatTable.findMany();
    return {
        props: {
            initialPatTable: JSON.parse(JSON.stringify(pats))
        }
    };
}

async function savePats(pat: Prisma.PatTableCreateInput) {
    const responce = await fetch('/api/patTable', {
        method: 'POST',
        body: JSON.stringify(pat)
    });

    if (!responce.ok) {
        throw new Error(responce.statusText);
    }

    return await responce.json();
}

async function updatePats(pat: Prisma.PatTableCreateInput) {
    const responce = await fetch('/api/patTable', {
        method: 'PUT',
        body: JSON.stringify(pat)
    });

    if (!responce.ok) {
        throw new Error(responce.statusText);
    }

    return await responce.json();
}

async function deletePats(pat: Prisma.PatTableCreateInput) {
    const responce = await fetch('/api/patTable', {
        method: 'DELETE',
        body: JSON.stringify(pat)
    });

    if (!responce.ok) {
        throw new Error(responce.statusText);
    }

    return await responce.json();
}


function PatTable({ initialPatTable }) {

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState<PatTable[]>(() => initialPatTable);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    const handleCreateNewRow = async (values: Pat) => {
        tableData.push(values);
        setTableData([...tableData]);
        try {
            await savePats(values);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSaveRowEdits: MaterialReactTableProps<Pat>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
        if (validationErrors && !Object.keys(validationErrors).length) {
            tableData[row.index] = values;
            // send/receive api updates here, then refetch or update local table data for re-render
            setTableData([...tableData]);
            exitEditingMode(); // required to exit editing mode and close modal
            try {
                await updatePats(values)
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleDeleteRow = useCallback(async (row: MRT_Row<Pat>) => {
        console.log(row);
        const delPat = tableData;
        if (!confirm(`Are you sure you want to delete ${row.getValue('patId')}`)) {
            return;
        }
        // send api delete request here, then refetch or update local table data for re-render
        tableData.splice(row.index, 1);
        setTableData([...tableData]);
        try {
            await deletePats(delPat)
        } catch (err) {
            console.log(err);
        }

    }, [tableData],);

    const getCommonEditTextFieldProps = useCallback((cell: MRT_Cell<Pat>,): MRT_ColumnDef<Pat>['muiTableBodyCellEditTextFieldProps'] => {
        return {
            error: !!validationErrors[cell.id],
            helperText: validationErrors[cell.id],
            onBlur: (event) => {
                const isValid = cell.column.id === 'PatId' ? validateRequired(event.target.value): true;
                if (!isValid) { // set validation error for cell if invalid
                    setValidationErrors({
                        ...validationErrors,
                        [cell.id]: `${cell.column.columnDef.header
                            } is required`
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

    const columns = useMemo<MRT_ColumnDef<Pat>[]>(() => [
        {
            accessorKey: 'patId', // access nested data with dot notation
            header: 'Pat Id',
            enableEditing: false
        },
        {
            accessorKey: 'description',
            header: 'Description',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        },
        {
            accessorKey: 'pat',
            header: 'Pat',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        },
        {
            accessorKey: 'dateExp', // normal accessorKey
            header: 'Expiration date',
            type: "date",
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        }, {
            accessorKey: 'ownerId',
            header: 'Owner',
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        },
    ], [getCommonEditTextFieldProps],);


    //const [pats, setPats] = useState(initialPatTable);
    return (
        <Layout>
        <div className={styles.container}>
            <Head>
                <title>Setup personal access token</title>
                <meta name="description" content="Setup access token" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className={styles.title}>
                Setup personal Access token (PAT)
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
                        Create New Access token
                    </Button>
                )}
            />
            <CreateNewPatModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateNewRow}
            />
        </div>
        </Layout>
    )
}

export const CreateNewPatModal: FC<{
    columns: MRT_ColumnDef<Pat>[];
    onClose: () => void;
    onSubmit: (values: Pat) => void;
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
  
    return (
      <Dialog open={open}>
        <DialogTitle textAlign="center">Create New PAT</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack
              sx={{
                width: '100%',
                minWidth: { xs: '300px', sm: '360px', md: '400px' },
                gap: '1.5rem',
              }}
            >
              {columns.map((column) => (
                <TextField
                key={column.accessorKey}
                label={column.header}
                name={column.accessorKey}
                onChange={(e) =>
                    setValues({ ...values, [e.target.name]: e.target.value })
                }
                />
            ))}
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
                Create New PAT
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


export default PatTable;
