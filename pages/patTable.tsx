/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
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
    Stack,
    TextField,
    Tooltip
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import styles from '../styles/Home.module.css';
import Head from 'next/head'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import type { GetServerSidePropsContext } from "next"
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { IExtSession, IPat } from '../components/types';
import prisma from '../components/client';
import { Prisma } from '@prisma/client';

type serverRet = {
    session: IExtSession | null;
    initialPatTable?: any | null;
}


export async function getServerSideProps(context: GetServerSidePropsContext) { 
    
    const extSession: IExtSession | null = await getServerSession(
        context.req,
        context.res,
        authOptions
      );

    
    let pats: IPat[] = [];
    
    if (extSession?.user?.id) {
        pats = await prisma.patTable.findMany({
            where: {
                ownerId: {
                    equals: extSession?.user?.id,
                }
            }
        });
    }
    pats.map((pat) => {
        pat.dateExp = dayjs(pat.dateExp).format('YYYY-MM-DD').toString();
    });
    const ret:serverRet = {
        session: extSession,
        initialPatTable: pats
    };

    return {
        props: ret
    }
};


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


function PatTable(ret: serverRet) {

    const extSession: IExtSession | null = ret.session;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState<IPat[]>(() => ret.initialPatTable);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    const ownerId = extSession?.user?.id;

    if (!ownerId) {
        return (
            <div>
                <h1>Not signed in</h1>
            </div>
        );
    }
    
    const handleCreateNewRow = async (values: any) => {
        values.ownerId = ownerId;
        tableData.push(values);
        setTableData([...tableData]);
        try {
            await savePats(values);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSaveRowEdits: MaterialReactTableProps<IPat>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
        if (validationErrors && !Object.keys(validationErrors).length) {
            const savedRow: Prisma.PatTableCreateInput = values as Prisma.PatTableCreateInput;
            savedRow.ownerId = ownerId;
            savedRow.dateExp = dayjs(savedRow.dateExp).format('YYYY-MM-DD').toString();

            tableData[row.index] = savedRow;
            // send/receive api updates here, then refetch or update local table data for re-render
            setTableData([...tableData]);
            exitEditingMode(); // required to exit editing mode and close modal
            try {
                await updatePats(savedRow)
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleDeleteRow = useCallback(async (row: MRT_Row<IPat>) => {
        const delPat:Prisma.PatTableCreateInput = row.original as Prisma.PatTableCreateInput;
        if (!confirm(`Are you sure you want to delete ${delPat.patId}`)) {
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

    const getCommonEditTextFieldProps = useCallback((cell: MRT_Cell<IPat>,): MRT_ColumnDef<IPat>['muiTableBodyCellEditTextFieldProps'] => {
        return {
            error: !!validationErrors[cell.id],
            helperText: validationErrors[cell.id],
            onBlur: (event) => {
                //console.log(cell);
                //console.log(event);
                const isValid = cell.column.id === 'pat' ? validateRequired(event.target.value): true;
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

    const columns = useMemo<MRT_ColumnDef<IPat>[]>(() => [
        {
            accessorKey: 'patId', // access nested data with dot notation
            header: 'Pat Id',
            enableEditing: false,
            muiTableBodyCellEditTextFieldProps: {
                error: !!validationErrors.patId, //highlight mui text field red error color
                helperText: validationErrors.patId, //show error message in helper text.
                required: true,
                type: 'string',
                onChange: (event) => {
                  const value = event.target.value;
                  //validation logic
                  if (!value) {
                    setValidationErrors((prev) => ({ ...prev, patId: 'ParId is required' }));
                  } else {
                    delete validationErrors.patId;
                    setValidationErrors({ ...validationErrors });
                  }
                },
            },
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
            accessorKey: 'dateExp', 
            header: 'Expiration date',
            type: "date",
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        }, 
    ], [getCommonEditTextFieldProps],);

    //const [pats, setPats] = useState(initialPatTable);
    return (
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
    )
}

export const CreateNewPatModal: FC<{
    columns: MRT_ColumnDef<IPat>[];
    onClose: () => void;
    onSubmit: (values: IPat) => void;
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
      values['dateExp'] = dateExpValue?.toISOString();
      onSubmit(values);
      onClose();
    };
  
    const [dateExpValue, setDateExpValue] = React.useState<Dayjs | null>(
        dayjs(new Date()).add(1, 'year')
      );
      //setValues({ ...values, ['dateExp']: dateExpValue })
    
    return (
      <Dialog open={open}>
        <DialogTitle textAlign="center">Create New PAT</DialogTitle>
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
                    if (column.accessorKey === 'dateExp') {
                        return <DesktopDatePicker
                            key="dateExp"
                            label="Expiration date"
                            
                            value={dateExpValue}
                            minDate={dayjs('2017-01-01')}
                            onChange={(newValue: Dayjs | null) => {
                                setValues({ ...values, ['dateExp']: newValue })
                                setDateExpValue(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    }
                    return <TextField
                        key={column.accessorKey}
                        label={column.header}
                        name={column.accessorKey}
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
                Create New PAT
            </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const validateRequired = (value: string) => {
    //console.log(value);
    //console.log("pat");
    return !!value.length;
}

  const validateEmail = (email: string) =>
    !!email.length &&
    email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );

  const validateAge = (age: number) => age >= 18 && age <= 50;


export default PatTable;
