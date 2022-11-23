import type { NextApiRequest, NextApiResponse } from 'next';
//import { PrismaClient} from '@prisma/client';
import prisma from '../../components/client';

//const prisma = new PrismaClient({
//  log: ['query', 'info', 'warn', 'error'],
//});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const   patsData = JSON.parse(req.body);
    const   date: Date = new Date(patsData.dateExp);
    const   strDate = date.toISOString();
    let     ret;
    let     status = 200;

    switch (req.method) {
        case 'POST':
            patsData.dateExp = strDate;
            ret = await prisma.patTable.create({
                data: patsData
            })
          break;
        case 'DELETE':
            ret = await prisma.patTable.delete({
              where: {
                PatIdOwnerId: {
                  patId: patsData.patId, 
                  ownerId: patsData.ownerId,
                }
              }
            });
          break;
        case 'PUT':
            patsData.dateExp = strDate;
            ret = await prisma.patTable.update({
              where: {
                PatIdOwnerId: {
                  patId: patsData.patId, 
                  ownerId: patsData.ownerId,
                }
              },
              data : patsData,
              });
          break;
        default:
            status = 401;
            ret = `Sorry, we are out of ${req.method}.`;
            console.log(ret);
      }
      
    res.status(status).json(ret);
}
