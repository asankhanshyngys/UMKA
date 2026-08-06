import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";
import Courses from "./Courses";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm text-foreground-subtle">Личный кабинет</p>
        <h1 className="mt-1 font-serif text-4xl text-foreground">Здравствуйте, {user.name}</h1>
        <p className="mt-3 text-foreground-muted">Здесь будут все ваши приобретённые курсы и ваш прогресс.</p>
        <Courses />
      </main>
    </div>
  );
}
