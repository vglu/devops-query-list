import { NotListedLocation } from "@mui/icons-material";
import {Session} from "next-auth"

type ProjectId = string | null; 
type PatId = string | null;
type QueryName = string | null;

// This is the type of the project object. 
export interface IProj {
    projId?: ProjectId;         // The project identification
    org?: string | null;            // The organization ID from ADO
    project?: string | null;        // The project ID from ADO
    query?: string | null;          // The query ID from ADO
    url?: string | null;            // The URL to the project
    patId?: string | null;          // The PAT ID from ADO
    queryName?: QueryName;      // The name of the query  
    ownerId?: string | null;        // The owner of the project
    patTablePatId?: string | null;  
    PatTableCreateNestedOneWithoutProjTableInput?: string | null;
    disabled?: boolean | null;      // Is the project disabled?
}

// This is the type of the personal access token object.
export interface IPat {
    patId?: PatId;                      // Pat identification
    pat?: string | null;                // Personal access token value
    dateExp?: string | Date | null;     // Date of PAT expiration
    ownerId?: string | null;            // Owner  this record
    description?: string | null;        // Simple description
}

// This is the type of the user object.
export interface IExtUser {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

// This is the type of the session object. ID is the user id.
export interface IExtSession extends Session {
    user?: {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }
}

// This is the type of the project item object.  
export interface IProjItem {
    project?: ProjectId;             // User Friendly ProjectId
    queryName?: QueryName;           // User Friendly QueryName
    workItemType?: string | null;    // Work Item Type
    state?: string | null;           // State of the work item
    assignToName?: string | null;
    assignToEmail?: string | null;
    bodyId?: string | null;
    title?: string | null;
    priority?: string | null;
    severity?: string | null;
    topic?: string | null;
    lastComment?: string | null;
    url?: string | null;
    description?: string | null;
    history?: string | null;
    changedDate?: string | null;
    changedBy?: string | null;
    inactiveDays?: number | null;
}

// work items short information
export interface IWorkItemShort {
    id?: string | null;
    url?: string | null;
}

  