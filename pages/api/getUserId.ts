import { PatTable } from '@prisma/client';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

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
            ret = await prisma.PatTable.create({
                data: patsData
            })
          break;
        case 'DELETE':
            ret = await prisma.PatTable.delete({
                where: {
                    patId: patsData.patId,
                },
              })
          break;
        case 'PUT':
            patsData.dateExp = strDate;
            ret = await prisma.PatTable.update({
                where: {
                    patId: patsData.patId,
                },
                data : patsData,
              })
          break;
        default:
            status = 401;
            ret = `Sorry, we are out of ${req.method}.`;
            console.log(ret);
      }
      
    res.status(status).json(ret);
}
