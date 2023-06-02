import { IExtSession, IPat, IProj, IProjItem } from './../../components/types';
import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../components/client';
import { PatTable, Prisma, ProjItem, ProjTable } from '@prisma/client';
import { stripHtml } from "string-strip-html";
import dateFormat from 'dateformat';
import { getServerSession } from 'next-auth';
import { authOptions } from "./auth/[...nextauth]"


export async function getProjItemData(ownerId: string | undefined) {
  try {
    const projItems = await prisma.projItem.findMany({
      where: {
        ownerId: { 
          equals: ownerId,
        },
      }
  });
    return projItems;
  } catch (error) {
    console.log("error: ", error);      
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method === 'POST') {
    try {
      console.log("req.body: ", req.body);
      const   bodyData = JSON.parse(req.body);
      const   ownerId : string | undefined = bodyData.ownerId;

      await fillProjItemData(ownerId);
      const tableData = await getProjItemData(ownerId);
      //console.log("tableData: ", tableData?.length? tableData.length: '');
      res.status(200).json(tableData);

    } catch (error) {
      console.log("error: ", error);
    }
  } else {

    const extSession: IExtSession | null = await getServerSession(
      req,
      res,
      authOptions
    );

    const ownerId  = String(extSession?.user?.id);
    const ret = await refreshItems(ownerId);
    console.log("ret: ", ret);
    
    if (ret)
    {
      const tableData = await getProjItemData(ownerId);
      //console.log("tableData: ", tableData);
      res.status(200).json(tableData);
  
    }
    
    //res.status(200).json({ name: 'John Doe' })
  }
}

async function refreshItems(ownerId: string) {
  try
  {
    await fillProjItemData(ownerId);
    return true;
  }
  catch (error) {
    console.log("error: ", error);
  }
  return false;
}

export async function fillProjItemData(ownerId: string | undefined) {
  
  try {
    //console.log("fillProjItemData ownerId: ", ownerId);
    
    const projects: ProjTable[] = await prisma.projTable.findMany({
      where: {
        ownerId: ownerId,
        disabled: false,
     },
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
      //console.log("proj: ", proj);
      let pat = pats.find((pat) => pat.patId === proj.patTablePatId);
      if (pat) {
        //console.log("pat: ", pat);
        const auth = 'Basic ' + btoa(':' + pat.pat);
       
        getWorkItemsForProject(proj, auth).then((workItems) => {
          //console.log("workItems: ", workItems);
          //console.log(typeof workItems)
          for (let workItem of workItems) {
            //console.log("workItem ", workItem);
            
            getWorkItemDetails(workItem.url, auth).then(async (workItemDetailsJson) => {
              
              //console.log("workItemDetails ", workItemDetailsJson);
              const workItemDetails = workItemDetailsJson;
              if (workItemDetails.bodyId) {

                workItemDetails.project = proj.projId; 
                workItemDetails.queryName = proj.queryName; 
                workItemDetails.url = proj.url + (proj.org ? '/' + proj.org : '') + '/' + proj.project + '/_workitems/edit/' + workItemDetails.bodyId; 
                workItemDetails.lastComment = "TBD"; 
                workItemDetails.ownerId = ownerId?ownerId:""; 
                
                //console.log("workItemDetails ", workItemDetails);
                prisma.projItem.create({
                  data: workItemDetails
                });
                const some= await prisma.projItem.create({
                  data: workItemDetails
                });
                //console.log('DEBUG 5______________________________',some);
              }
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
    url += '&Authorization=BasicBASE64PATSTRING';
  
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': auth,
        'Cookie': 'VstsSession=%7B%22PersistentSessionId%22%3A%22e1befab2-8f1a-4074-9523-58bc6b54ea4b%22%2C%22PendingAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22CurrentAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22SignInState%22%3A%7B%7D%7D'
      }});
  
    const data = await response.json();

    if (data['innerException'] && data['message']) {
      console.log("Project", projectId);
      console.log("error: ", data['message']);
      throw new Error(data['message']);
    }

    if (response.status !== 200) {
      console.log("Project", projectId);
      console.log("error: ", data);
      throw new Error(data);
    }
    //console.log('DEBUG 2 r________',response.status);
    //console.log('DEBUG 2________',data.workItems);
    return data.workItems;

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
    //console.log('INSIDE DEBUG 1_______________________________________')
    //console.log(data)
    const fields = data.fields;
    //console.log('INSIDE DEBUG 2________________________________________')
    //console.log(fields);
    //console.log('BULLS EYE ',fields["System.AssignedTo"].id )
    const date = new Date(fields["System.ChangedDate"]);
    // define constant with current datetime
    const currDateTime = new Date();
    const dateStr = dateFormat(date, "yyyy.mm.dd HH:MM"); 
    const diffTime = Math.abs(currDateTime.getTime() - date.getTime());
    const inactiveDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    const itemDetails: ProjItem = {
      workItemType: fields["System.WorkItemType"],
      state: fields["System.State"],
      assignToName: fields["System.AssignedTo"]["displayName"],
      assignToEmail: fields["System.AssignedTo"]["uniqueName"],
      topic: fields["System.Title"],
      priority: fields["Microsoft.VSTS.Common.Priority"] ? fields["Microsoft.VSTS.Common.Priority"].toString() : '',
      severity: fields["Microsoft.VSTS.Common.Severity"] ? fields["Microsoft.VSTS.Common.Severity"].toString() : '',
      bodyId: data.id.toString(),
      title: fields["System.Title"],
      description: fields["System.Description"] ? stripHtml(fields["System.Description"]).result : '',
      history: fields["System.History"] ? stripHtml(fields["System.History"]).result : '',
      url: url,
      changedDate: dateStr,
      changedBy: fields["System.CreatedBy"]["displayName"] ? fields["System.CreatedBy"]["displayName"] : '',
      inactiveDays:inactiveDays ,
      // id: '',
      // project: null,
      // queryName: null,
      // lastComment: null,
      // ownerId: null
    }
    //console.log('INSIDE DEBUG 3_____________________________________________')
    //console.log(itemDetails)
    return itemDetails;

  } catch (error) {
    console.log("error: ", error);
    const itemDetails: ProjItem = {
      bodyId: "",
      id: '',
      project: null,
      queryName: null,
      workItemType: null,
      state: null,
      assignToName: null,
      assignToEmail: null,
      title: null,
      priority: null,
      severity: null,
      topic: null,
      lastComment: null,
      url: null,
      ownerId: null,
      description: null,
      history: null,
      changedDate: null,
      changedBy: null,
      inactiveDays: null
    }  
    return itemDetails;
  }
}

// I need function to 

//class 