"use client"
import { Clock, BarChart3, TrendingUp, X, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  attendanceData: any
  attendanceHistory: any[]
  onCheckIn: () => void
  onCheckOut: () => void
  onBreakToggle: () => void
  userData: any
}

export function AttendanceModal({
  isOpen,
  onClose,
  attendanceData,
  attendanceHistory,
  onCheckIn,
  onCheckOut,
  onBreakToggle,
  userData,
}: AttendanceModalProps) {
  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      case "absent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4" />
      case "late":
        return <AlertCircle className="h-4 w-4" />
      case "absent":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 border-b bg-gradient-to-r from-green-50 to-blue-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Attendance Tracker</CardTitle>
              <p className="text-sm text-gray-500">Manage your daily attendance and view history</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <Tabs defaultValue="today" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-6 mb-0">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="today" className="space-y-6 mt-0">
                {/* Current Status Card */}
                <Card className="border-2 border-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Today's Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            attendanceData.todayStatus === "checked-in"
                              ? "bg-green-500 animate-pulse"
                              : attendanceData.todayStatus === "checked-out"
                                ? "bg-gray-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        <span className="font-medium">
                          {attendanceData.todayStatus === "checked-in"
                            ? "Currently Working"
                            : attendanceData.todayStatus === "checked-out"
                              ? "Day Completed"
                              : "Not Started"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">Current Time: {currentTime}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600">Check In</p>
                        <p className="font-semibold text-blue-600">{attendanceData.checkInTime || "--:--"}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-gray-600">Check Out</p>
                        <p className="font-semibold text-purple-600">{attendanceData.checkOutTime || "--:--"}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">Total Hours</p>
                        <p className="font-semibold text-green-600">{attendanceData.totalHours || "0h 0m"}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-600">Break Time</p>
                        <p className="font-semibold text-orange-600">{attendanceData.breakTime || "0h 0m"}</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      {attendanceData.todayStatus === "checked-out" ? (
                        <Button disabled className="flex-1 bg-gray-100 text-gray-500">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Day Completed
                        </Button>
                      ) : attendanceData.todayStatus === "checked-in" ? (
                        <>
                          <Button onClick={onCheckOut} className="flex-1 bg-red-600 hover:bg-red-700">
                            <Clock className="mr-2 h-4 w-4" />
                            Check Out
                          </Button>
                          <Button
                            onClick={onBreakToggle}
                            variant="outline"
                            className={`flex-1 ${
                              attendanceData.isOnBreak
                                ? "bg-orange-50 border-orange-200 text-orange-700"
                                : "hover:bg-orange-50"
                            }`}
                          >
                            {attendanceData.isOnBreak ? "End Break" : "Take Break"}
                          </Button>
                        </>
                      ) : (
                        <Button onClick={onCheckIn} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Check In
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-xs text-gray-600">This Month</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">22</div>
                      <div className="text-xs text-gray-600">Present Days</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">8.5h</div>
                      <div className="text-xs text-gray-600">Avg Hours</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">2</div>
                      <div className="text-xs text-gray-600">Late Days</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Attendance History</h3>
                  <Badge variant="outline">{attendanceHistory.length} records</Badge>
                </div>

                <div className="space-y-2">
                  {attendanceHistory.map((record, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {new Date(record.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">{record.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex space-x-4 text-sm">
                              <span>In: {record.checkIn}</span>
                              <span>Out: {record.checkOut}</span>
                            </div>
                            <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                              <span>Total: {record.totalHours}</span>
                              <span>OT: {record.overtime}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span>Monthly Performance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Attendance Rate</span>
                          <span className="font-medium">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>On-time Rate</span>
                          <span className="font-medium">87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overtime Hours</span>
                          <span className="font-medium">12h</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span>Weekly Pattern</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
                          <div key={day} className="flex items-center space-x-3">
                            <span className="w-8 text-sm font-medium">{day}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${85 + Math.random() * 15}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">8.{Math.floor(Math.random() * 6)}h</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insights & Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">Excellent Attendance</p>
                        <p className="text-sm text-green-700">
                          You've maintained 95% attendance this month. Keep up the great work!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-800">Consistent Schedule</p>
                        <p className="text-sm text-blue-700">
                          Your check-in times are consistent. Consider arriving 10 minutes earlier to avoid any delays.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-800">Overtime Management</p>
                        <p className="text-sm text-orange-700">
                          You've worked 12 hours of overtime this month. Consider work-life balance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
