// standard nextjs api route
// this route is called from the client side to get the project data
// for the current user

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (session) {
    res.status(200).json({ name: 'John Doe' })
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
}