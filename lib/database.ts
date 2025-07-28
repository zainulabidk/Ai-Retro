// Database operations for leave management system

export interface LeaveApplication {
  id?: number
  employeeId: string
  leaveTypeId: number
  startDate: string
  endDate: string
  totalDays: number
  isHalfDay: boolean
  reason: string
  emergencyContact?: string
  medicalCertificateRequired: boolean
  medicalCertificateUploaded: boolean
  status: "pending" | "approved" | "rejected" | "cancelled"
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  comments?: string
}

export interface LeaveBalance {
  leaveTypeId: number
  leaveTypeName: string
  leaveTypeCode: string
  allocatedDays: number
  usedDays: number
  pendingDays: number
  remainingDays: number
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  managerId?: string
  joinDate: string
  isActive: boolean
}

// Mock database operations (replace with actual database calls)
export class LeaveDatabase {
  static async submitLeaveApplication(application: Omit<LeaveApplication, "id">): Promise<LeaveApplication> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock database insert
    const newApplication: LeaveApplication = {
      id: Date.now(),
      ...application,
      appliedDate: new Date().toISOString(),
      status: "pending",
    }

    // Update leave balance (reduce remaining days)
    await this.updateLeaveBalance(application.employeeId, application.leaveTypeId, application.totalDays, "pending")

    // Send notification to manager
    await this.sendNotificationToManager(newApplication)

    return newApplication
  }

  static async getLeaveBalance(employeeId: string): Promise<LeaveBalance[]> {
    // Mock leave balance data
    return [
      {
        leaveTypeId: 1,
        leaveTypeName: "Annual Leave",
        leaveTypeCode: "AL",
        allocatedDays: 21,
        usedDays: 3,
        pendingDays: 0,
        remainingDays: 18,
      },
      {
        leaveTypeId: 2,
        leaveTypeName: "Sick Leave",
        leaveTypeCode: "SL",
        allocatedDays: 12,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 12,
      },
      {
        leaveTypeId: 3,
        leaveTypeName: "Casual Leave",
        leaveTypeCode: "CL",
        allocatedDays: 12,
        usedDays: 4,
        pendingDays: 0,
        remainingDays: 8,
      },
    ]
  }

  static async getLeaveApplications(employeeId: string): Promise<LeaveApplication[]> {
    // Mock leave applications data
    return [
      {
        id: 1,
        employeeId: "EMP001",
        leaveTypeId: 1,
        startDate: "2024-12-23",
        endDate: "2024-12-27",
        totalDays: 3,
        isHalfDay: false,
        reason: "Christmas vacation with family",
        medicalCertificateRequired: false,
        medicalCertificateUploaded: false,
        status: "approved",
        appliedDate: "2024-12-01T10:30:00Z",
        approvedBy: "MGR001",
        approvedDate: "2024-12-02T14:15:00Z",
      },
    ]
  }

  static async validateLeaveApplication(application: Omit<LeaveApplication, "id">): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check leave balance
    const leaveBalance = await this.getLeaveBalance(application.employeeId)
    const selectedLeaveType = leaveBalance.find((lb) => lb.leaveTypeId === application.leaveTypeId)

    if (!selectedLeaveType) {
      errors.push("Invalid leave type selected")
    } else if (application.totalDays > selectedLeaveType.remainingDays) {
      errors.push(`Insufficient leave balance. Available: ${selectedLeaveType.remainingDays} days`)
    }

    // Check date validations
    const startDate = new Date(application.startDate)
    const endDate = new Date(application.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      errors.push("Start date cannot be in the past")
    }

    if (endDate < startDate) {
      errors.push("End date cannot be before start date")
    }

    // Check advance notice requirements
    const diffTime = startDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (application.leaveTypeId === 1 && diffDays < 3) {
      // Annual leave
      errors.push("Annual leave requires 3 days advance notice")
    }

    // Check for overlapping applications
    const existingApplications = await this.getLeaveApplications(application.employeeId)
    const hasOverlap = existingApplications.some((existing) => {
      if (existing.status === "rejected" || existing.status === "cancelled") return false

      const existingStart = new Date(existing.startDate)
      const existingEnd = new Date(existing.endDate)

      return startDate <= existingEnd && endDate >= existingStart
    })

    if (hasOverlap) {
      errors.push("Leave dates overlap with existing application")
    }

    // Check company holidays
    const holidays = await this.getCompanyHolidays(application.startDate, application.endDate)
    if (holidays.length > 0) {
      warnings.push(`Your leave period includes ${holidays.length} company holiday(s)`)
    }

    // Medical certificate requirement
    if (application.leaveTypeId === 2 && application.totalDays > 3 && !application.medicalCertificateRequired) {
      errors.push("Medical certificate required for sick leave exceeding 3 days")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  static async updateLeaveBalance(
    employeeId: string,
    leaveTypeId: number,
    days: number,
    type: "used" | "pending" | "restore",
  ): Promise<void> {
    // Mock database update
    console.log(`Updating leave balance for ${employeeId}: ${type} ${days} days for leave type ${leaveTypeId}`)
  }

  static async sendNotificationToManager(application: LeaveApplication): Promise<void> {
    // Mock notification sending
    console.log(`Notification sent to manager for leave application ${application.id}`)
  }

  static async getCompanyHolidays(startDate: string, endDate: string): Promise<any[]> {
    // Mock company holidays
    const holidays = [
      { name: "Christmas", date: "2024-12-25" },
      { name: "New Year", date: "2025-01-01" },
    ]

    return holidays.filter((holiday) => {
      const holidayDate = new Date(holiday.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return holidayDate >= start && holidayDate <= end
    })
  }

  static async getEmployeeDetails(employeeId: string): Promise<Employee | null> {
    // Mock employee data
    const employees: Employee[] = [
      {
        id: "EMP001",
        name: "John Doe",
        email: "john.doe@company.com",
        role: "Software Engineer",
        department: "Engineering",
        managerId: "MGR001",
        joinDate: "2022-01-15",
        isActive: true,
      },
    ]

    return employees.find((emp) => emp.id === employeeId) || null
  }
}
