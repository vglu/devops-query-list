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
    MenuItem,
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
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import Autocomplete from '@mui/material/Autocomplete';
import { IExtSession, IPat, IProj } from '../components/types';
import prisma from '../components/client';
import { Prisma } from '@prisma/client';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';


type serverRet = {
    session: IExtSession | null;
    initialProjTable?: any | null;
    initialPatTable?: any | null;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {

    const extSession: IExtSession | null = await getServerSession(
        context.req,
        context.res,
        authOptions
      );

    
    let projs: IProj[] = [];
    let patsLocal: IPat[] = [];


    if (extSession?.user?.id) {
        projs = await prisma.projTable.findMany({
            where: {
                ownerId: {
                    equals: extSession?.user?.id,
                }
            }
        });
        patsLocal = await prisma.patTable.findMany({
            where: {
                ownerId: {
                    equals: extSession?.user?.id,
                }
            }
        });
    } 
    patsLocal.map((pat) => {
        pat.dateExp = dayjs(pat.dateExp).format('YYYY-MM-DD').toString();
    });
    const ret: serverRet = {
        session: extSession,
        initialProjTable: projs,
        initialPatTable: patsLocal
    };

    return {
        props: ret
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


function ProjTable(ret: serverRet) {

    const extSession: IExtSession | null = ret.session;

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState<IProj[]>(() => ret.initialProjTable);
    const [validationErrors, setValidationErrors] = useState<{
        [cellId: string]: string;
    }>({});

    const pats: IPat[] = ret.initialPatTable;
    const patList: string[] = [];
    pats.forEach((pat) => {
        patList.push(pat.patId?.toString() ?? '');
    });

    const ownerId = extSession?.user?.id as string;

    const handleCreateNewRow = async (values: any) => {
        values.ownerId = ownerId;
        tableData.push(values);
        setTableData([...tableData]);
        try {
            await saveProjs(values);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSaveRowEdits: MaterialReactTableProps<IProj>['onEditingRowSave'] = async ({ exitEditingMode, row, values }) => {
        if (validationErrors && !Object.keys(validationErrors).length) {
            const savedRow: Prisma.ProjTableCreateInput = values as Prisma.ProjTableCreateInput;
            savedRow.ownerId = ownerId;
            //savedRow.disabled = (savedRow.disabled  === 'true') ? true : (savedRow.disabled === 'false') ? false : true;
            console.log("savedRow.disabled)", savedRow.disabled);
            tableData[row.index] = savedRow as IProj;
            // send/receive api updates here, then refetch or update local table data for re-render
            setTableData([...tableData]);
            exitEditingMode(); // required to exit editing mode and close modal
            try {
                await updateProjs(savedRow)
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleDeleteRow = useCallback(async (row: MRT_Row<IProj>) => {
        const delProj:Prisma.ProjTableCreateInput = row.original as Prisma.ProjTableCreateInput;

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

    const getCommonEditTextFieldProps = useCallback((cell: MRT_Cell<IProj>,): MRT_ColumnDef<IProj>['muiTableBodyCellEditTextFieldProps'] => {
        return {
            error: !!validationErrors[cell.id],
            helperText: validationErrors[cell.id],
            onBlur: (event) => {
                const isValid = cell.column.id === 'projId' ? validateRequired(event.target.value) : true;
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

    const columns = useMemo<MRT_ColumnDef<IProj>[]>(() => [
        {
            accessorKey: 'projId', // access nested data with dot notation
            header: 'ProjId',
            enableEditing: false
        },
        {
            accessorKey: 'org',
            header: 'Organization',
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
        {
            accessorKey: 'disabled',
            header: 'Disabled',
            type: 'boolean',
            Cell: ({ cell  }) => (
                <Checkbox checked={cell.getValue()? true: false} />),
            muiTableBodyCellEditTextFieldProps: ({ cell }) => (
                {
                    ...getCommonEditTextFieldProps(cell)
                }
            )
        },
    ], [getCommonEditTextFieldProps],);

    return (
        <div className={styles.container}>
            <Head>
                <title>Setup property for projects</title>
                <meta name="description" content="Setup property for projects" />
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
                patListVar={patList}
            />
        </div>
    )
}

export const CreateNewProjModal: FC<{
    columns: MRT_ColumnDef<IProj>[];
    onClose: () => void;
    onSubmit: (values: IProj) => void;
    open: boolean;
    patListVar: string[];
}> = ({ open, columns, onClose, onSubmit, patListVar}) => {
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


    //const patList: any = pats.map(element => element.patId);

    const [pat, setPat] = React.useState<string | null>(patListVar[0]);
    const [inputPatValue, setInputPatValue] = React.useState('');
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPat(event.target.value);
    };
    const [enabled, setEnabled] = React.useState<boolean>(false);


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
                                    options={patListVar}
                                    renderInput={(params) => <TextField {...params} label={column.header} />}
                                    onChange={(event: any, newValue: string | null) => {
                                        setValues({ ...values, ['patTablePatId']: newValue })
                                        setPat(newValue);
                                    }}
                                />
                                }
                                if (column.accessorKey === 'disabled') { // checked={cell.getValue()? true: false}
                                    return <Autocomplete
                                    key={column.accessorKey}
                                    options={["true", "false"]}
                                    renderInput={(params) => <TextField {...params} label={column.header} />}
                                    onChange={(event: any, newValue: string | null) => {
                                        setValues({ ...values, ['disabled']: newValue })
                                        setPat(newValue);
                                    }}  
                                    />                               
                                }
                                return <TextField
                                    key={column.accessorKey}
                                    label={column.header}
                                    name={column.accessorKey}
                                    //type={column.type}
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
