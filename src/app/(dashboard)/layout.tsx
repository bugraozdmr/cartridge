import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/admin-shell";
import { getAll as getAllDepartments } from "@/features/departments/repo";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
	const departments = await getAllDepartments();

	return <AdminShell departments={departments}>{children}</AdminShell>;
}
