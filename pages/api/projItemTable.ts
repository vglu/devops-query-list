import { IPat, IProj, IProjItem } from './../../components/types';
import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../components/client';
import { PatTable, Prisma, ProjItem, ProjTable } from '@prisma/client';

export async function getProjItemData(ownerId: string | undefined) {
  const projItems = await prisma.projItem.findMany({
    where: {
      ownerId: { 
        equals: ownerId,
      },
    }
  });
  return projItems;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("req.body: ", req.body);
    const   bodyData = JSON.parse(req.body);
    const   ownerId : string | undefined = bodyData.ownerId;

    await fillProjItemData(ownerId);
    const tableData = await getProjItemData(ownerId);

    res.status(200).json(tableData);
  } catch (error) {
    console.log("error: ", error);
  }
}

export async function fillProjItemData(ownerId: string | undefined) {
  
  try {

    const projects: ProjTable[] = await prisma.projTable.findMany({
      where: {
        ownerId: {
            equals: ownerId,
        }
      }
    });

    const pats: PatTable[] = await prisma.patTable.findMany({
      where: {
        ownerId: {
            equals: ownerId,
        }
      }
    });

    const deleteUser = await prisma.projItem.deleteMany({
      where: {
        ownerId: ownerId,
      },
    });
    
    // for each project
    for (let proj of projects) {
      console.log("proj: ", proj);
      let pat = pats.find((pat) => pat.patId === proj.patTablePatId);
      if (pat) {
        console.log("pat: ", pat);
        const auth = 'Basic ' + btoa(':' + pat.pat);
        getWorkItemsForProject(proj, auth).then((workItems) => {
          console.log("workItems: ", workItems);
          for (let workItem of workItems) {
            console.log("workItem ", workItem);
            getWorkItemDetails(workItem.url, auth).then((workItemDetailsJson) => {
              console.log("workItemDetails ", workItemDetailsJson);
              /*const workItemDetails = JSON.parse(workItemDetailsJson);
              if (workItemDetails.bodyId) {
                workItemDetails.project = proj.projId; 
                workItemDetails.queryName = proj.queryName; 
                workItemDetails.url =  workItem.url; 
                workItemDetails.lastComment = "TBD"; 
                workItemDetails.ownerId = ownerId; 
                console.log("workItemDetails ", workItemDetails);
                prisma.projItem.create({
                  data: workItemDetails
                });
              }*/
            });
          }
        }, (error) => {
        console.log("error: ", error); 
        });} 
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

//GET https://dev.azure.com/{organization}/{project}/_apis/wit/workItems/{workItemId}/comments?$top={$top}&continuationToken={continuationToken}&includeDeleted={includeDeleted}&$expand={$expand}&order={order}&api-version=7.0-preview.3

async function getWorkItemsForProject(projectId: IProj, auth: string) {
  try {

    const urlLocal = projectId.url;
    const org = projectId.org;
    const project = projectId.project;
    const query = projectId.query;

    let url = urlLocal + '/';

    if (org) {
      url += org + '/';
    }
  
    url += project;
    url += '/_apis/wit/wiql/';
    url += query;
    url += '?$expand=clauses&api-version=6.0';
    url += '&Authorization=Basic BASE64PATSTRING';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Cookie': 'VstsSession=%7B%22PersistentSessionId%22%3A%22e1befab2-8f1a-4074-9523-58bc6b54ea4b%22%2C%22PendingAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22CurrentAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22SignInState%22%3A%7B%7D%7D'
      }});
  
    const data = await response.json();
    return JSON.stringify(data.workItems);

  } catch (error) {
    console.log("error: ", error);
    return "";
  }  
}

async function getWorkItemDetails(url: string, auth: string) {
  try {

    let urlLocal = url + '?api-version=6.0' + '&Authorization=Basic BASE64PATSTRING';

    const response = await fetch(urlLocal, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Cookie': 'VstsSession=%7B%22PersistentSessionId%22%3A%22e1befab2-8f1a-4074-9523-58bc6b54ea4b%22%2C%22PendingAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22CurrentAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22SignInState%22%3A%7B%7D%7D'
      }});
  
    const data = await response.json();
    const body = JSON.parse(data);
    const fields = body.fields;

    const itemDetails: ProjItem = {
      workItemType: fields["System.WorkItemType"],
      state: fields["System.State"],
      assignToName: fields["System.AssignedTo"]["displayName"],
      assignToEmail: fields["System.AssignedTo"]["uniqueName"],
      topic: fields["System.Title"],
      priority: fields["Microsoft.VSTS.Common.Priority"],
      severity: fields["Microsoft.VSTS.Common.Severity"],
      bodyId: fields["Id"],
      url: url
    }

    return itemDetails;

  } catch (error) {
    console.log("error: ", error);
    const itemDetails: ProjItem = {
      bodyId: "",
    }  
    return itemDetails;
  }
}

