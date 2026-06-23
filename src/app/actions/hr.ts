"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getEmployees(organizationId?: string) {
  try {
    const employees = await prisma.employee.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        department: true,
      },
      orderBy: { joinDate: 'desc' }
    });

    return employees.map(emp => ({
      id: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: emp.phone || "N/A",
      dept: emp.department?.name || "N/A",
      designation: emp.designation,
      type: emp.employmentType,
      status: emp.status,
      join: emp.joinDate.toISOString().split('T')[0],
      salary: Number(emp.salary) || 0,
      avatar: emp.avatarUrl,
      location: "HQ" // Since location isn't on Employee model directly, fallback to HQ
    }));
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return null;
  }
}

export async function getAttendanceToday(organizationId?: string) {
  try {
    // Assuming attendance date is stored without time or using date bounds
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
        },
        employee: organizationId ? { organizationId } : undefined
      },
      include: { employee: true },
      orderBy: { clockIn: 'asc' }
    });

    return attendance.map(att => {
      // Calculate hours if clockOut exists
      let hrs = "0h 0m";
      if (att.clockIn && att.clockOut) {
        const diff = att.clockOut.getTime() - att.clockIn.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        hrs = `${hours}h ${minutes}m`;
      }

      return {
        emp: `${att.employee.firstName} ${att.employee.lastName}`,
        clockIn: att.clockIn ? att.clockIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--",
        clockOut: att.clockOut ? att.clockOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--",
        status: att.status,
        hrs
      };
    });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return null;
  }
}

export async function getLeaveRequests(organizationId?: string) {
  try {
    const leaves = await prisma.leaveRequest.findMany({
      where: organizationId ? { employee: { organizationId } } : undefined,
      include: {
        employee: true,
        leaveType: true
      },
      orderBy: { startDate: 'desc' },
      take: 20
    });

    return leaves.map(leave => ({
      emp: `${leave.employee.firstName} ${leave.employee.lastName}`,
      type: leave.leaveType.name,
      from: leave.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      to: leave.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      days: Number(leave.days),
      status: leave.status
    }));
  } catch (error) {
    console.error("Failed to fetch leave requests:", error);
    return null;
  }
}

export async function getPayrollRecords(organizationId?: string) {
  try {
    const payrolls = await prisma.payrollRun.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        records: true
      },
      orderBy: { periodStart: 'desc' },
      take: 12
    });

    return payrolls.map(pr => {
      const gross = pr.records.reduce((acc, curr) => acc + Number(curr.grossPay), 0);
      const deductions = pr.records.reduce((acc, curr) => acc + Number(curr.deductions) + Number(curr.taxAmount), 0);
      const net = pr.records.reduce((acc, curr) => acc + Number(curr.netPay), 0);

      return {
        period: `${pr.periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        employees: pr.records.length,
        gross,
        deductions,
        net,
        status: pr.status
      };
    });
  } catch (error) {
    console.error("Failed to fetch payroll records:", error);
    return null;
  }
}
