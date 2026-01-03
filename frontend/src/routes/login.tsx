import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { Login } from "../components/Login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Login
        onSuccess={() => {
          navigate({ to: "/_auth/dashboard/" });
        }}
      />
    </div>
  );
}
