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

    const   projData = JSON.parse(req.body);
    let     ret;
    let     status = 200;

    switch (req.method) {
        case 'POST':
            if (projData.disabled === 'true') {
              projData.disabled = true;
            } else if (projData.disabled === 'false') {
              projData.disabled = false;
            } else if (projData.disabled === false) {
              projData.disabled = false;
            } else if (projData.disabled === true) {
              projData.disabled = true;
            } else {
              projData.disabled = true;
            }

            ret = await prisma.projTable.create({
                data: projData
            })
          break;
        case 'DELETE':
            ret = await prisma.projTable.delete({
                where: {
                  ProjIdOwnerId: {
                    ownerId: projData.ownerId,
                    projId: projData.projId,
                  },
                },
              })
          break;
        case 'PUT':
          //projData.disabled = (projData.disabled === 'true') ? true : (projData.disabled === 'false') ? false : true;
            ret = await prisma.projTable.update({
              where: {
                ProjIdOwnerId: {
                  ownerId: projData.ownerId,
                  projId: projData.projId,
                },
              },
              data : projData,
              })
          break;
        default:
            status = 401;
            ret = `Sorry, we are out of ${req.method}.`;
            console.log(ret);
      }
      
    res.status(status).json(ret);
}
