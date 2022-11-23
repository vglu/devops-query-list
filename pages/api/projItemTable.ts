import type { NextApiRequest, NextApiResponse } from 'next';
//import { PrismaClient} from '@prisma/client';

import prisma from '../../components/client';

//const prisma = new PrismaClient({
//  log: ['query', 'info', 'warn', 'error'],
//});

export async function getProjItemData(ownerId: String) {
  const projItems = await prisma.projItem.findMany({
    where: {
      ownerId: ownerId,
    }
  });
  return projItems;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    console.log("req.body: ", req.body);
    //const   bodyData = JSON.parse(req.body);
    const   bodyData = req.body;
    const   ownerId : String = bodyData.ownerId;

    const tableData = await getProjItemData(ownerId);

      res.status(200).json(tableData);
}