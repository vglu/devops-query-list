import { useSession } from "next-auth/react";

export default function getOwnerUserId() {
  const { data: session } = useSession();
  return session?.user?.id;
}