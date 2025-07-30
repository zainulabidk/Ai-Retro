"use client"

import { useState, useRef, useEffect } from "react"
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Settings,
  Bell,
  Mic,
  MicOff,
  MessageCircle,
  X,
  Send,
  Volume2,
  User,
  LogOut,
  Menu,
  Home,
  BarChart3,
  Award,
  Briefcase,
  ChevronRight,
  CalendarDays,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { LeaveApplicationModal } from "./components/leave-application-modal"

export default function OfficeKitMobileDashboard() {
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content:
        "Hello! I'm your Nemo Ai. I can help you apply for leave, check attendance, view payslips, and answer any HR questions. How can I help you today?",
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [activeTab, setActiveTab] = useState("home")
  const [leaveApplications, setLeaveApplications] = useState([])
  const recognitionRef = useRef(null)

  // Mock user data
  const userData = {
    id: "EMP001",
    name: "John Doe",
    role: "Software Engineer",
    department: "Engineering",
    avatar: "/placeholder.svg?height=40&width=40&text=JD",
    leaveBalance: {
      annual: 18,
      sick: 12,
      casual: 8,
      maternity: 0,
      paternity: 5,
    },
    pendingRequests: 3,
    attendance: 95,
    manager: "Jane Smith",
    joinDate: "2022-01-15",
  }

  const quickStats = [
    {
      title: "Annual Leave",
      value: `${userData.leaveBalance.annual} days`,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    { title: "Attendance", value: "95%", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
    { title: "Pending", value: "3", icon: FileText, color: "text-orange-600", bg: "bg-orange-50" },
    {
      title: "Sick Leave",
      value: `${userData.leaveBalance.sick} days`,
      icon: DollarSign,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  const hrModules = [
    { name: "Apply Leave", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", action: "leave" },
    { name: "Check In/Out", icon: Clock, color: "text-green-600", bg: "bg-green-50", action: "attendance" },
    { name: "View Payslip", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50", action: "payroll" },
    { name: "Performance", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50", action: "performance" },
    { name: "Documents", icon: FileText, color: "text-red-600", bg: "bg-red-50", action: "documents" },
    { name: "Training", icon: Award, color: "text-indigo-600", bg: "bg-indigo-50", action: "training" },
  ]

  const recentActivities = [
    { action: "Annual leave approved (Dec 25-27)", time: "2h ago", type: "success" },
    { action: "Payslip generated for November", time: "1d ago", type: "info" },
    { action: "Performance review scheduled", time: "3d ago", type: "warning" },
  ]

  const bottomNavItems = [
    { name: "Home", icon: Home, key: "home" },
    { name: "Calendar", icon: Calendar, key: "calendar" },
    { name: "Reports", icon: BarChart3, key: "reports" },
    { name: "Profile", icon: User, key: "profile" },
  ]

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setVoiceText(finalTranscript)
          setCurrentMessage(finalTranscript)
        }
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false)
      recognitionRef.current.stop()
    }
  }

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const userMessage = currentMessage.trim()

      // Immediately add user message for instant feedback
      setMessages((prev) => [...prev, { type: "user", content: userMessage }])
      setCurrentMessage("")
      setVoiceText("")

      // Add typing indicator
      setMessages((prev) => [...prev, { type: "assistant", content: "Typing...", isTyping: true }])

      // Simulate AI processing with faster response
      setTimeout(() => {
        const response = getAIResponse(userMessage)
        const aiMessage = response?.message || "I'm here to help with HR-related queries. Please try again."
        const aiAction = response?.action || null

        // Replace typing indicator with actual response
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => !msg.isTyping)
          return [...newMessages, { type: "assistant", content: aiMessage, action: aiAction }]
        })

        // Handle actions
        if (aiAction === "open_leave_modal") {
          setTimeout(() => {
            setIsLeaveModalOpen(true)
            setIsVoiceAssistantOpen(false)
          }, 500)
        }
      }, 800) // Faster response time
    }
  }

  const getAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Leave related queries
    if (lowerMessage.includes("leave") || lowerMessage.includes("vacation") || lowerMessage.includes("time off")) {
      if (lowerMessage.includes("apply") || lowerMessage.includes("request") || lowerMessage.includes("take")) {
        return {
          message: `I'll help you apply for leave. You have ${userData.leaveBalance.annual} annual leave days, ${userData.leaveBalance.sick} sick days, and ${userData.leaveBalance.casual} casual days remaining. Let me open the leave application form for you.`,
          action: "open_leave_modal",
        }
      } else if (lowerMessage.includes("balance") || lowerMessage.includes("remaining")) {
        return {
          message: `Here's your current leave balance:\n• Annual Leave: ${userData.leaveBalance.annual} days\n• Sick Leave: ${userData.leaveBalance.sick} days\n• Casual Leave: ${userData.leaveBalance.casual} days\n• Paternity Leave: ${userData.leaveBalance.paternity} days\n\nWould you like to apply for leave?`,
          action: null,
        }
      } else if (lowerMessage.includes("policy") || lowerMessage.includes("rules")) {
        return {
          message:
            "Here are the key leave policies:\n• Annual leave: 21 days per year\n• Sick leave: 12 days per year\n• Casual leave: 12 days per year\n• Maternity leave: 180 days\n• Paternity leave: 15 days\n• Leave requests must be submitted 3 days in advance\n• Medical certificate required for sick leave > 3 days",
          action: null,
        }
      }
    }

    // Attendance queries
    else if (
      lowerMessage.includes("attendance") ||
      lowerMessage.includes("check in") ||
      lowerMessage.includes("check out")
    ) {
      return {
        message: `Your current attendance is ${userData.attendance}%. You've been quite regular this month! Your last check-in was today at 9:15 AM. Would you like to check in/out now or view your attendance history?`,
        action: null,
      }
    }

    // Salary/Payroll queries
    else if (lowerMessage.includes("salary") || lowerMessage.includes("payroll") || lowerMessage.includes("payslip")) {
      return {
        message:
          "Your November payslip has been generated. Gross salary: ₹50,000, Net salary: ₹42,500 after deductions. Your salary is credited on the last working day of each month. Would you like me to show you the detailed payslip?",
        action: null,
      }
    }

    // Performance queries
    else if (
      lowerMessage.includes("performance") ||
      lowerMessage.includes("review") ||
      lowerMessage.includes("appraisal")
    ) {
      return {
        message:
          "Your performance review is scheduled for next week with Jane Smith. Your current rating is 4.2/5. Key achievements this quarter: Project delivery on time, excellent team collaboration. Areas for improvement: Technical documentation. Would you like to prepare for the review?",
        action: null,
      }
    }

    // Holiday queries
    else if (lowerMessage.includes("holiday") || lowerMessage.includes("public holiday")) {
      return {
        message:
          "Upcoming public holidays:\n• December 25: Christmas Day\n• January 1: New Year's Day\n• January 26: Republic Day\n• March 8: Holi\n\nThese are paid holidays. Would you like to plan your leave around these dates?",
        action: null,
      }
    }

    // HR contact queries
    else if (
      lowerMessage.includes("hr contact") ||
      lowerMessage.includes("hr team") ||
      lowerMessage.includes("hr support")
    ) {
      return {
        message:
          "HR Team Contact Information:\n• HR Manager: Sarah Johnson (sarah.j@company.com)\n• HR Executive: Mike Chen (mike.c@company.com)\n• Phone: +91-80-1234-5678\n• Office Hours: 9 AM - 6 PM\n• Emergency Contact: +91-98765-43210",
        action: null,
      }
    }

    // Benefits queries
    else if (
      lowerMessage.includes("benefits") ||
      lowerMessage.includes("insurance") ||
      lowerMessage.includes("medical")
    ) {
      return {
        message:
          "Your employee benefits include:\n• Health Insurance: ₹5,00,000 coverage\n• Life Insurance: ₹10,00,000\n• Provident Fund: 12% contribution\n• Gratuity: As per company policy\n• Flexible work hours\n• Work from home options\n\nNeed help with any specific benefit?",
        action: null,
      }
    }

    // Default response
    return {
      message:
        "I'm here to help with HR-related queries. I can assist you with:\n• Leave applications and balance\n• Attendance tracking\n• Payroll and salary information\n• Performance reviews\n• Company policies\n• Benefits information\n• HR contacts\n\nWhat would you like to know?",
      action: null,
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleModuleClick = (action: string) => {
    if (action === "leave") {
      setIsLeaveModalOpen(true)
    }
    // Handle other module actions here
  }

  const handleLeaveSubmit = (leaveData: any) => {
    // Add to leave applications
    const newApplication = {
      id: Date.now(),
      ...leaveData,
      status: "pending",
      appliedDate: new Date().toISOString(),
      employeeId: userData.id,
      employeeName: userData.name,
    }

    setLeaveApplications([...leaveApplications, newApplication])
    setIsLeaveModalOpen(false)

    // Show success message
    setMessages([
      ...messages,
      {
        type: "assistant",
        content: `✅ Your leave application has been submitted successfully!\n\nDetails:\n• Type: ${leaveData.leaveType}\n• From: ${leaveData.startDate}\n• To: ${leaveData.endDate}\n• Days: ${leaveData.totalDays}\n• Reason: ${leaveData.reason}\n\nYour manager (${userData.manager}) will review and approve your request. You'll receive an email notification once it's processed.`,
      },
    ])
  }

  // Add this useEffect for custom styles
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
    .scrollbar-thin {
      scrollbar-width: thin;
    }
    .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
      background-color: #d1d5db;
      border-radius: 6px;
    }
    .scrollbar-track-transparent::-webkit-scrollbar-track {
      background-color: transparent;
    }
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
    }
    .scrollbar-none {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
  `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center space-x-2 mb-6">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                    <h2 className="text-lg font-bold">OfficeKit HR</h2>
                  </div>

                  <div className="flex-1 space-y-2">
                    {hrModules.map((module, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => handleModuleClick(module.action)}
                      >
                        <div className={`p-2 rounded-lg ${module.bg} mr-3`}>
                          <module.icon className={`h-4 w-4 ${module.color}`} />
                        </div>
                        {module.name}
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      </Button>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">OfficeKit</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">3</Badge>
            </Button>

            <Avatar className="h-8 w-8">
              <AvatarImage src={userData.avatar || "/placeholder.svg"} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back!</h2>
          <p className="text-sm text-gray-600">
            {userData.name} • {userData.role}
          </p>
        </div>

        {/* Quick Stats - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-1">{stat.title}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsLeaveModalOpen(true)}
            >
              <CalendarDays className="mr-3 h-4 w-4" />
              Apply for Leave
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 bg-transparent">
                <Clock className="mr-2 h-4 w-4" />
                Check In
              </Button>
              <Button variant="outline" className="h-12 bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Payslip
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* HR Modules - Mobile List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">HR Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hrModules.slice(0, 4).map((module, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-12 hover:bg-gray-50"
                onClick={() => handleModuleClick(module.action)}
              >
                <div className={`p-2 rounded-lg ${module.bg} mr-3`}>
                  <module.icon className={`h-4 w-4 ${module.color}`} />
                </div>
                <span className="flex-1 text-left">{module.name}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>
            ))}
            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
              View All Services
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <span className="text-sm text-gray-900">{activity.action}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>

      {/* Floating AI Assistant Button */}
      <Button
        onClick={() => setIsVoiceAssistantOpen(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg z-30"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 h-16">
          {bottomNavItems.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={`h-full rounded-none flex flex-col items-center justify-center space-y-1 ${
                activeTab === item.key ? "text-blue-600 bg-blue-50" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Voice Assistant Modal - Enhanced UI */}
      {isVoiceAssistantOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <Card className="w-full md:max-w-lg max-h-[90vh] md:max-h-[85vh] flex flex-col rounded-t-3xl md:rounded-2xl border-0 md:border shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Enhanced Header */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl md:rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Nemo Ai</CardTitle>
                  <p className="text-xs text-gray-500">Always here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVoiceAssistantOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-white/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Enhanced Messages Container */}
              <div className="flex-1 p-4 space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`max-w-[85%] group ${message.type === "user" ? "order-2" : "order-1"}`}>
                      {message.type === "assistant" && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">Nemo Ai</span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.type === "user"
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md ml-4"
                            : "bg-white border border-gray-100 text-gray-900 rounded-bl-md mr-4"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                        {message.type === "assistant" && (
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-xs hover:bg-gray-50 transition-colors"
                              onClick={() => speakText(message.content)}
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              Listen
                            </Button>
                            <span className="text-xs text-gray-400">
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                      </div>
                      {message.type === "user" && (
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-gray-400 mr-4">
                            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Voice Input Indicator */}
              {isListening && (
                <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-sm text-blue-700 font-medium">Listening...</span>
                  </div>
                  {voiceText && (
                    <div className="mt-3 p-2 bg-white/50 rounded-lg">
                      <p className="text-sm text-gray-700 italic">"{voiceText}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Input Area */}
              <div className="p-4 border-t bg-gray-50/50 backdrop-blur-sm">
                {/* Quick Action Buttons */}
                <div className="flex space-x-2 mb-3 overflow-x-auto scrollbar-none">
                  {[
                    { text: "Apply for leave", icon: "📅" },
                    { text: "Check balance", icon: "💰" },
                    { text: "Attendance", icon: "⏰" },
                    { text: "Payslip", icon: "💼" },
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 h-8 px-3 text-xs bg-white hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                      onClick={() => setCurrentMessage(action.text)}
                    >
                      <span className="mr-1">{action.icon}</span>
                      {action.text}
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Textarea
                      placeholder="Type your HR question or use voice input..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      className="resize-none text-base pr-12 border-2 border-gray-200 focus:border-blue-400 rounded-xl bg-white shadow-sm transition-all duration-200"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    {currentMessage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 hover:bg-gray-100"
                        onClick={() => setCurrentMessage("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isListening ? "destructive" : "outline"}
                      size="icon"
                      className={`h-12 w-12 rounded-xl transition-all duration-200 ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 animate-pulse"
                          : "bg-white hover:bg-blue-50 border-2 hover:border-blue-300"
                      }`}
                      onClick={isListening ? stopListening : startListening}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>

                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                    <span>Press Enter to send • Shift+Enter for new line</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Application Modal */}
      <LeaveApplicationModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleLeaveSubmit}
        userData={userData}
      />
    </div>
  )
}
