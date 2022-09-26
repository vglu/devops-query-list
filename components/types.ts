import { Session } from "next-auth"

export interface IProj {
    projId?: string | null;
    org?: string | null;
    project?: string | null;
    query?: string | null;
    url?: string | null;
    patId?: string | null;
    queryName?: string | null;
    ownerId?: string | null;
    patTablePatId?: string | null;
    PatTableCreateNestedOneWithoutProjTableInput?: string | null;
};

export interface IPat {
    patId?: string | null;
    pat?: string | null;
    dateExp?: string | Date | null;
    ownerId?: string | null;
    description?: string | null;
};

export interface IExtUser {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

export interface IExtSession extends Session {
    user?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
};

  