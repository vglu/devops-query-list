import { useSession } from "next-auth/react";

export default function getSession() {
    const { data: session } = useSession();
    return session;
}