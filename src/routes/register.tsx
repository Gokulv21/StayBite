import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return <Navigate to="/login" replace />;
}
