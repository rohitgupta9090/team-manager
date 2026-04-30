import { Navigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import TeamPage from "./TeamPage.jsx";

/** Inside MainLayout; only admins may open /team. */
export default function AdminTeamPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <TeamPage />;
}
