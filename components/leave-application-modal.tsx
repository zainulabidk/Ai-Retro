"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Clock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface LeaveApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (leaveData: any) => void
  userData: any
}

export function LeaveApplicationModal({ isOpen, onClose, onSubmit, userData }: LeaveApplicationModalProps) {
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    medicalCertificate: false,
    halfDay: false,
    totalDays: 0,
  })
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const leaveTypes = [
    {
      value: "annual",
      label: "Annual Leave",
      balance: userData.leaveBalance.annual,
      color: "bg-blue-100 text-blue-800",
    },
    { value: "sick", label: "Sick Leave", balance: userData.leaveBalance.sick, color: "bg-red-100 text-red-800" },
    {
      value: "casual",
      label: "Casual Leave",
      balance: userData.leaveBalance.casual,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "maternity",
      label: "Maternity Leave",
      balance: userData.leaveBalance.maternity,
      color: "bg-pink-100 text-pink-800",
    },
    {
      value: "paternity",
      label: "Paternity Leave",
      balance: userData.leaveBalance.paternity,
      color: "bg-purple-100 text-purple-800",
    },
  ]

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

      setFormData((prev) => ({
        ...prev,
        totalDays: formData.halfDay ? 0.5 : diffDays,
      }))
    }
  }, [formData.startDate, formData.endDate, formData.halfDay])

  const validateForm = () => {
    const newErrors: any = {}

    // Required field validations
    if (!formData.leaveType) newErrors.leaveType = "Please select a leave type"
    if (!formData.startDate) newErrors.startDate = "Please select start date"
    if (!formData.endDate) newErrors.endDate = "Please select end date"
    if (!formData.reason.trim()) newErrors.reason = "Please provide a reason for leave"

    // Date validations
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (start < today) {
        newErrors.startDate = "Start date cannot be in the past"
      }
      if (end < start) {
        newErrors.endDate = "End date cannot be before start date"
      }

      // Advance notice validation (3 days minimum)
      const diffTime = start.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays < 3 && formData.leaveType === "annual") {
        newErrors.startDate = "Annual leave requires 3 days advance notice"
      }
    }

    // Leave balance validation
    if (formData.leaveType && formData.totalDays > 0) {
      const selectedLeaveType = leaveTypes.find((type) => type.value === formData.leaveType)
      if (selectedLeaveType && formData.totalDays > selectedLeaveType.balance) {
        newErrors.totalDays = `Insufficient ${selectedLeaveType.label.toLowerCase()} balance`
      }
    }

    // Sick leave specific validations
    if (formData.leaveType === "sick" && formData.totalDays > 3 && !formData.medicalCertificate) {
      newErrors.medicalCertificate = "Medical certificate required for sick leave > 3 days"
    }

    // Emergency contact for long leaves
    if (formData.totalDays > 5 && !formData.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact required for leaves > 5 days"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Submit to database (mock)
      const leaveApplication = {
        ...formData,
        employeeId: userData.id,
        employeeName: userData.name,
        department: userData.department,
        manager: userData.manager,
        appliedDate: new Date().toISOString(),
        status: "pending",
      }

      onSubmit(leaveApplication)

      // Reset form
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        emergencyContact: "",
        medicalCertificate: false,
        halfDay: false,
        totalDays: 0,
      })
      setErrors({})
    } catch (error) {
      console.error("Error submitting leave application:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const selectedLeaveType = leaveTypes.find((type) => type.value === formData.leaveType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <CardTitle className="text-lg">Apply for Leave</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Leave Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} disabled={type.balance === 0}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        <Badge className={`ml-2 ${type.color}`}>{type.balance} days</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveType && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.leaveType}
                </p>
              )}
            </div>

            {/* Half Day Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="halfDay"
                checked={formData.halfDay}
                onChange={(e) => setFormData({ ...formData, halfDay: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="halfDay" className="text-sm">
                Half Day Leave
              </Label>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate || new Date().toISOString().split("T")[0]}
                  disabled={formData.halfDay}
                />
                {errors.endDate && <p className="text-xs text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            {/* Total Days Display */}
            {formData.totalDays > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Days:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {formData.totalDays} {formData.totalDays === 1 ? "day" : "days"}
                  </Badge>
                </div>
                {selectedLeaveType && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">Remaining Balance:</span>
                    <span className="text-xs font-medium">{selectedLeaveType.balance - formData.totalDays} days</span>
                  </div>
                )}
              </div>
            )}

            {errors.totalDays && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.totalDays}
              </p>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Leave *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a detailed reason for your leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
              {errors.reason && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.reason}
                </p>
              )}
            </div>

            {/* Emergency Contact for long leaves */}
            {formData.totalDays > 5 && (
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                <Input
                  type="tel"
                  id="emergencyContact"
                  placeholder="Emergency contact number"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                />
                {errors.emergencyContact && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.emergencyContact}
                  </p>
                )}
              </div>
            )}

            {/* Medical Certificate for sick leave */}
            {formData.leaveType === "sick" && formData.totalDays > 3 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="medicalCertificate"
                    checked={formData.medicalCertificate}
                    onChange={(e) => setFormData({ ...formData, medicalCertificate: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="medicalCertificate" className="text-sm">
                    I will provide medical certificate
                  </Label>
                </div>
                {errors.medicalCertificate && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.medicalCertificate}
                  </p>
                )}
              </div>
            )}

            {/* Manager Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Reporting Manager</span>
              </div>
              <p className="text-sm text-gray-600">{userData.manager}</p>
              <p className="text-xs text-gray-500 mt-1">Your leave request will be sent to your manager for approval</p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
