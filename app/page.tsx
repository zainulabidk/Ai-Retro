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
import { AttendanceModal } from "./components/attendance-modal"

export default function OfficeKitMobileDashboard() {
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content:
        "Hello! I'm your HR assistant. I can help you apply for leave, check attendance, view payslips, and answer any HR questions. Try saying 'I need leave from tomorrow to Friday' or 'Apply sick leave for 3 days'. How can I help you today?",
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")
  const [activeTab, setActiveTab] = useState("home")
  const [leaveApplications, setLeaveApplications] = useState([])
  const [conversationContext, setConversationContext] = useState({
    isCollectingLeaveInfo: false,
    leaveData: {},
    currentStep: "",
    missingFields: [],
  })
  const recognitionRef = useRef(null)

  const [attendanceData, setAttendanceData] = useState({
    todayStatus: "checked-out", // "checked-in", "checked-out", "not-started"
    checkInTime: null,
    checkOutTime: null,
    totalHours: 0,
    breakTime: 0,
    isOnBreak: false,
    breakStartTime: null,
  })
  const [attendanceHistory, setAttendanceHistory] = useState([
    {
      date: "2024-01-30",
      checkIn: "09:15 AM",
      checkOut: "06:30 PM",
      totalHours: "9h 15m",
      status: "present",
      overtime: "1h 15m",
    },
    {
      date: "2024-01-29",
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      totalHours: "9h 00m",
      status: "present",
      overtime: "1h 00m",
    },
    {
      date: "2024-01-28",
      checkIn: "09:30 AM",
      checkOut: "06:15 PM",
      totalHours: "8h 45m",
      status: "present",
      overtime: "0h 45m",
    },
    {
      date: "2024-01-27",
      checkIn: "10:00 AM",
      checkOut: "06:00 PM",
      totalHours: "8h 00m",
      status: "late",
      overtime: "0h 00m",
    },
    {
      date: "2024-01-26",
      checkIn: "-",
      checkOut: "-",
      totalHours: "0h 00m",
      status: "absent",
      overtime: "0h 00m",
    },
  ])
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

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

  const [microphoneSupported, setMicrophoneSupported] = useState(false)
  const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt" | "unknown">(
    "unknown",
  )

  // Enhanced voice recognition setup with better error handling
  useEffect(() => {
    // Check if speech recognition is supported
    const isSupported =
      typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)

    setMicrophoneSupported(isSupported)

    if (isSupported) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
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
          setIsListening(false)
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)

        // Handle specific errors with user-friendly messages
        let errorMessage = ""
        switch (event.error) {
          case "not-allowed":
            errorMessage =
              "🎤 **Microphone Access Required**\n\nTo use voice commands:\n1. Click the microphone icon in your browser's address bar\n2. Select 'Allow' for microphone access\n3. Try the voice command again\n\nYou can still type your messages normally! 📝"
            break
          case "no-speech":
            errorMessage = "🔇 No speech detected. Please try speaking again or use the text input."
            break
          case "audio-capture":
            errorMessage =
              "🎤 **Microphone Not Available**\n\nYour microphone might be:\n• Used by another application\n• Not connected properly\n• Disabled in system settings\n\nPlease check your microphone and try again, or use text input instead."
            break
          case "network":
            errorMessage = "🌐 Network error occurred. Please check your internet connection and try again."
            break
          default:
            errorMessage = `🚫 Voice recognition error: ${event.error}. Please try again or use text input.`
        }

        setMessages((prev) => [
          ...prev,
          {
            type: "assistant",
            content: errorMessage,
          },
        ])
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  // Check microphone permission on component mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicrophonePermission("denied")
        return
      }

      try {
        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
          setMicrophonePermission(permission.state)

          permission.onchange = () => {
            setMicrophonePermission(permission.state)
          }
        } else {
          // Fallback: assume prompt if we can't check
          setMicrophonePermission("prompt")
        }
      } catch (error) {
        console.log("Permission check failed:", error)
        setMicrophonePermission("unknown")
      }
    }

    checkMicrophonePermission()
  }, [])

  const startListening = async () => {
    if (!microphoneSupported) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content:
            "🚫 **Voice Recognition Not Supported**\n\nYour browser doesn't support voice recognition. Please use the text input instead.\n\n**Supported Browsers:**\n• Chrome\n• Edge\n• Safari (iOS 14.5+)\n• Firefox (with flag enabled)",
        },
      ])
      return
    }

    if (!recognitionRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "🚫 Voice recognition is not available. Please use the text input instead.",
        },
      ])
      return
    }

    if (isListening) return

    try {
      // First, try to get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // If we get here, we have permission
      stream.getTracks().forEach((track) => track.stop()) // Clean up the stream

      setIsListening(true)
      setVoiceText("")
      recognitionRef.current.start()
    } catch (error: any) {
      console.error("Error accessing microphone:", error)
      setIsListening(false)

      let errorMessage = ""
      if (error.name === "NotAllowedError") {
        errorMessage =
          "🎤 **Microphone Permission Denied**\n\nTo enable voice commands:\n1. Click the microphone icon in your browser's address bar\n2. Select 'Allow' for microphone access\n3. Refresh the page and try again\n\nYou can always type your message instead! ✨"
      } else if (error.name === "NotFoundError") {
        errorMessage =
          "🎤 **No Microphone Found**\n\nPlease:\n1. Connect a microphone to your device\n2. Check your system audio settings\n3. Try refreshing the page\n\nYou can use text input in the meantime! 📝"
      } else if (error.name === "NotReadableError") {
        errorMessage =
          "🎤 **Microphone Busy**\n\nYour microphone might be:\n• Used by another application\n• Hardware issue\n• Driver problem\n\nPlease close other apps using the microphone and try again, or use text input! 💬"
      } else {
        errorMessage = `🚫 **Microphone Error**\n\nError: ${error.message}\n\nPlease try:\n1. Refreshing the page\n2. Checking your microphone settings\n3. Using text input instead\n\nI'm here to help either way! 😊`
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: errorMessage,
        },
      ])
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
        setIsListening(false)
      }
    }
  }

  // Enhanced date parsing function
  const parseNaturalDate = (text: string) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(today.getDate() + 2)

    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const nextMonth = new Date(today)
    nextMonth.setMonth(today.getMonth() + 1)

    const lowerText = text.toLowerCase()

    // Common date patterns
    if (lowerText.includes("today")) return today.toISOString().split("T")[0]
    if (lowerText.includes("tomorrow")) return tomorrow.toISOString().split("T")[0]
    if (lowerText.includes("day after tomorrow")) return dayAfterTomorrow.toISOString().split("T")[0]
    if (lowerText.includes("next week")) return nextWeek.toISOString().split("T")[0]
    if (lowerText.includes("next month")) return nextMonth.toISOString().split("T")[0]

    // Day names
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    for (let i = 0; i < days.length; i++) {
      if (lowerText.includes(days[i])) {
        const targetDay = new Date(today)
        const currentDay = today.getDay()
        const daysUntilTarget = (i - currentDay + 7) % 7 || 7
        targetDay.setDate(today.getDate() + daysUntilTarget)
        return targetDay.toISOString().split("T")[0]
      }
    }

    // Month names with dates
    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ]

    for (let i = 0; i < months.length; i++) {
      if (lowerText.includes(months[i])) {
        const dateMatch = lowerText.match(new RegExp(`(\\d{1,2})\\s*${months[i]}|${months[i]}\\s*(\\d{1,2})`))
        if (dateMatch) {
          const day = Number.parseInt(dateMatch[1] || dateMatch[2])
          const date = new Date(today.getFullYear(), i, day)
          if (date < today) date.setFullYear(today.getFullYear() + 1)
          return date.toISOString().split("T")[0]
        }
      }
    }

    // Numeric date patterns (DD/MM, MM/DD, etc.)
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{1,2})\/(\d{1,2})/,
      /(\d{1,2})-(\d{1,2})/,
    ]

    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        let day, month, year
        if (match[3]) {
          // Full date with year
          day = Number.parseInt(match[1])
          month = Number.parseInt(match[2]) - 1
          year = Number.parseInt(match[3])
        } else {
          // Date without year
          day = Number.parseInt(match[1])
          month = Number.parseInt(match[2]) - 1
          year = today.getFullYear()
        }
        const date = new Date(year, month, day)
        if (date < today && !match[3]) date.setFullYear(today.getFullYear() + 1)
        return date.toISOString().split("T")[0]
      }
    }

    return null
  }

  // Enhanced leave information extraction
  const extractLeaveInfo = (message: string) => {
    const lowerMessage = message.toLowerCase()
    const leaveInfo: any = {}

    // Extract leave type
    if (lowerMessage.includes("sick") || lowerMessage.includes("medical") || lowerMessage.includes("illness")) {
      leaveInfo.leaveType = "sick"
    } else if (
      lowerMessage.includes("annual") ||
      lowerMessage.includes("vacation") ||
      lowerMessage.includes("holiday")
    ) {
      leaveInfo.leaveType = "annual"
    } else if (lowerMessage.includes("casual") || lowerMessage.includes("personal")) {
      leaveInfo.leaveType = "casual"
    } else if (lowerMessage.includes("maternity")) {
      leaveInfo.leaveType = "maternity"
    } else if (lowerMessage.includes("paternity")) {
      leaveInfo.leaveType = "paternity"
    }

    // Extract dates
    const fromPatterns = [/from\s+(.+?)\s+to/i, /starting\s+(.+?)\s+to/i, /beginning\s+(.+?)\s+to/i, /from\s+(.+?)$/i]

    const toPatterns = [/to\s+(.+?)(?:\s|$)/i, /until\s+(.+?)(?:\s|$)/i, /till\s+(.+?)(?:\s|$)/i]

    for (const pattern of fromPatterns) {
      const match = message.match(pattern)
      if (match) {
        const startDate = parseNaturalDate(match[1])
        if (startDate) leaveInfo.startDate = startDate
        break
      }
    }

    for (const pattern of toPatterns) {
      const match = message.match(pattern)
      if (match) {
        const endDate = parseNaturalDate(match[1])
        if (endDate) leaveInfo.endDate = endDate
        break
      }
    }

    // Extract duration
    const durationPatterns = [
      /for\s+(\d+)\s+days?/i,
      /(\d+)\s+days?\s+leave/i,
      /(\d+)\s+days?\s+off/i,
      /take\s+(\d+)\s+days?/i,
    ]

    for (const pattern of durationPatterns) {
      const match = message.match(pattern)
      if (match) {
        const days = Number.parseInt(match[1])
        leaveInfo.duration = days
        if (leaveInfo.startDate && !leaveInfo.endDate) {
          const start = new Date(leaveInfo.startDate)
          const end = new Date(start)
          end.setDate(start.getDate() + days - 1)
          leaveInfo.endDate = end.toISOString().split("T")[0]
        }
        break
      }
    }

    // Extract half day
    if (lowerMessage.includes("half day") || lowerMessage.includes("half-day")) {
      leaveInfo.halfDay = true
    }

    // Extract reason
    const reasonPatterns = [
      /because\s+(.+?)(?:\.|$)/i,
      /due to\s+(.+?)(?:\.|$)/i,
      /for\s+(.+?)(?:\s+from|\s+to|$)/i,
      /reason\s*:\s*(.+?)(?:\.|$)/i,
    ]

    for (const pattern of reasonPatterns) {
      const match = message.match(pattern)
      if (match && !match[1].match(/\d+\s+days?/i)) {
        leaveInfo.reason = match[1].trim()
        break
      }
    }

    return leaveInfo
  }

  const handleCheckIn = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setAttendanceData((prev) => ({
      ...prev,
      todayStatus: "checked-in",
      checkInTime: timeString,
      checkOutTime: null,
    }))

    // Add success message to voice assistant
    setMessages((prev) => [
      ...prev,
      {
        type: "assistant",
        content: `✅ **Check-in Successful!**

🕘 **Time**: ${timeString}
📍 **Location**: Office - Main Building
📱 **Method**: Mobile App

**Today's Schedule**:
• Work Hours: 8:00 AM - 5:00 PM
• Lunch Break: 12:00 PM - 1:00 PM
• Meetings: 2 scheduled

Have a productive day, ${userData.name}! 🌟`,
      },
    ])
  }

  const handleCheckOut = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Calculate total hours (simplified calculation)
    const checkInTime = attendanceData.checkInTime
    const totalHours = "8h 30m" // Mock calculation

    setAttendanceData((prev) => ({
      ...prev,
      todayStatus: "checked-out",
      checkOutTime: timeString,
      totalHours: totalHours,
    }))

    // Add to attendance history
    const today = new Date().toISOString().split("T")[0]
    const newRecord = {
      date: today,
      checkIn: checkInTime || "09:15 AM",
      checkOut: timeString,
      totalHours: totalHours,
      status: "present",
      overtime: "0h 30m",
    }

    setAttendanceHistory((prev) => [newRecord, ...prev])

    // Add success message to voice assistant
    setMessages((prev) => [
      ...prev,
      {
        type: "assistant",
        content: `✅ **Check-out Successful!**

🕘 **Check-out Time**: ${timeString}
⏱️ **Total Hours**: ${totalHours}
🎯 **Status**: Great work today!

**Today's Summary**:
• Check-in: ${checkInTime}
• Check-out: ${timeString}
• Break Time: 1h 00m
• Overtime: 0h 30m

Rest well and see you tomorrow! 👋`,
      },
    ])
  }

  const handleBreakToggle = () => {
    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setAttendanceData((prev) => ({
      ...prev,
      isOnBreak: !prev.isOnBreak,
      breakStartTime: !prev.isOnBreak ? timeString : null,
    }))

    const action = attendanceData.isOnBreak ? "ended" : "started"
    setMessages((prev) => [
      ...prev,
      {
        type: "assistant",
        content: `${attendanceData.isOnBreak ? "⏰" : "☕"} **Break ${action}!**

🕘 **Time**: ${timeString}
${attendanceData.isOnBreak ? "⏱️ **Break Duration**: Calculating..." : "🍽️ **Enjoy your break!**"}

${attendanceData.isOnBreak ? "Welcome back! Ready to continue your productive day." : "Take your time to recharge. Don't forget to stay hydrated! 💧"}`,
      },
    ])
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

      // Process message with context
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
        } else if (aiAction === "open_leave_modal_with_data") {
          setTimeout(() => {
            setIsLeaveModalOpen(true)
            setIsVoiceAssistantOpen(false)
          }, 500)
        }
      }, 600)
    }
  }

  const getAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Check if we're in a conversation flow
    if (conversationContext.isCollectingLeaveInfo) {
      return handleLeaveConversationFlow(message)
    }

    // Extract leave information from natural language
    const leaveInfo = extractLeaveInfo(message)

    // Leave related queries with intelligent parsing
    if (
      lowerMessage.includes("leave") ||
      lowerMessage.includes("vacation") ||
      lowerMessage.includes("time off") ||
      lowerMessage.includes("sick") ||
      lowerMessage.includes("holiday") ||
      Object.keys(leaveInfo).length > 0
    ) {
      if (
        lowerMessage.includes("apply") ||
        lowerMessage.includes("request") ||
        lowerMessage.includes("take") ||
        lowerMessage.includes("need") ||
        lowerMessage.includes("want") ||
        Object.keys(leaveInfo).length > 0
      ) {
        // Check if we have enough information to proceed
        const hasStartDate = leaveInfo.startDate || lowerMessage.includes("today") || lowerMessage.includes("tomorrow")
        const hasEndDate = leaveInfo.endDate || leaveInfo.duration || leaveInfo.halfDay
        const hasLeaveType = leaveInfo.leaveType

        if (hasStartDate && hasEndDate && hasLeaveType) {
          // We have enough info, prepare for modal
          const leaveTypeNames = {
            sick: "Sick Leave",
            annual: "Annual Leave",
            casual: "Casual Leave",
            maternity: "Maternity Leave",
            paternity: "Paternity Leave",
          }

          return {
            message: `Perfect! I've understood your leave request:

📅 **Leave Type**: ${leaveTypeNames[leaveInfo.leaveType] || "Annual Leave"}
📅 **Start Date**: ${leaveInfo.startDate ? new Date(leaveInfo.startDate).toLocaleDateString() : "Not specified"}
📅 **End Date**: ${leaveInfo.endDate ? new Date(leaveInfo.endDate).toLocaleDateString() : "Not specified"}
${leaveInfo.halfDay ? "⏰ **Half Day**: Yes" : ""}
${leaveInfo.reason ? `📝 **Reason**: ${leaveInfo.reason}` : ""}

Let me open the leave application form with this information pre-filled for you to review and submit.`,
            action: "open_leave_modal_with_data",
          }
        } else {
          // Start conversation flow to collect missing info
          setConversationContext({
            isCollectingLeaveInfo: true,
            leaveData: leaveInfo,
            currentStep: "start",
            missingFields: [],
          })

          let response = "I'll help you apply for leave! "

          if (Object.keys(leaveInfo).length > 0) {
            response += "I've captured some information:\n"
            if (leaveInfo.leaveType) response += `• Leave Type: ${leaveInfo.leaveType}\n`
            if (leaveInfo.startDate) response += `• Start Date: ${new Date(leaveInfo.startDate).toLocaleDateString()}\n`
            if (leaveInfo.endDate) response += `• End Date: ${new Date(leaveInfo.endDate).toLocaleDateString()}\n`
            if (leaveInfo.reason) response += `• Reason: ${leaveInfo.reason}\n`
            response += "\n"
          }

          if (!hasLeaveType) {
            response += "What type of leave do you need? (sick, annual, casual, maternity, paternity)"
          } else if (!hasStartDate) {
            response += "When do you want to start your leave? (e.g., tomorrow, Monday, 15th December)"
          } else if (!hasEndDate) {
            response += "When will your leave end? (e.g., Friday, for 3 days, half day)"
          }

          return { message: response, action: null }
        }
      } else if (lowerMessage.includes("balance") || lowerMessage.includes("remaining")) {
        return {
          message: `Here's your current leave balance:

💙 **Annual Leave**: ${userData.leaveBalance.annual} days remaining
❤️ **Sick Leave**: ${userData.leaveBalance.sick} days remaining  
💚 **Casual Leave**: ${userData.leaveBalance.casual} days remaining
💜 **Paternity Leave**: ${userData.leaveBalance.paternity} days remaining

Would you like to apply for leave? Just say something like "I need sick leave for 2 days starting tomorrow"`,
          action: null,
        }
      } else if (lowerMessage.includes("policy") || lowerMessage.includes("rules")) {
        return {
          message: `📋 **Leave Policies**:

🔹 **Annual Leave**: 21 days per year
🔹 **Sick Leave**: 12 days per year  
🔹 **Casual Leave**: 12 days per year
🔹 **Maternity Leave**: 180 days
🔹 **Paternity Leave**: 15 days

📝 **Important Rules**:
• Leave requests need 3 days advance notice (except sick leave)
• Medical certificate required for sick leave > 3 days
• Emergency contact needed for leaves > 5 days
• Half-day leaves available for all types

Need to apply for leave? Just tell me your dates!`,
          action: null,
        }
      }
    } else if (
      lowerMessage.includes("attendance") ||
      lowerMessage.includes("check in") ||
      lowerMessage.includes("check out") ||
      lowerMessage.includes("present")
    ) {
      if (lowerMessage.includes("check me in") || lowerMessage.includes("check in")) {
        if (attendanceData.todayStatus === "checked-in") {
          return {
            message: `You're already checked in! ✅

🕘 **Check-in Time**: ${attendanceData.checkInTime}
⏱️ **Current Status**: Working
📍 **Location**: Office

Would you like to take a break or check your attendance history?`,
            action: null,
          }
        } else {
          handleCheckIn()
          return {
            message: "Processing your check-in...",
            action: null,
          }
        }
      } else if (lowerMessage.includes("check me out") || lowerMessage.includes("check out")) {
        if (attendanceData.todayStatus === "checked-out") {
          return {
            message: `You're already checked out for today! 👋

🕘 **Check-out Time**: ${attendanceData.checkOutTime}
⏱️ **Total Hours**: ${attendanceData.totalHours}

Have a great evening!`,
            action: null,
          }
        } else if (attendanceData.todayStatus === "checked-in") {
          handleCheckOut()
          return {
            message: "Processing your check-out...",
            action: null,
          }
        } else {
          return {
            message: "You haven't checked in today yet. Would you like to check in first?",
            action: null,
          }
        }
      } else {
        return {
          message: `📊 **Your Attendance Summary**:

✅ **Current Attendance**: ${userData.attendance}%
🕘 **Today's Status**: ${attendanceData.todayStatus === "checked-in" ? `Checked in at ${attendanceData.checkInTime}` : attendanceData.todayStatus === "checked-out" ? `Checked out at ${attendanceData.checkOutTime}` : "Not checked in yet"}
📅 **This Month**: 22/23 working days present
🎯 **Status**: Excellent attendance!

**Quick Actions**:
• Say "check me in" to mark attendance
• Say "check me out" to mark departure  
• Say "attendance history" for detailed report
• Say "take a break" to start break time

You're doing great with your attendance! 👏`,
          action: null,
        }
      }
    }

    // Salary/Payroll queries
    else if (lowerMessage.includes("salary") || lowerMessage.includes("payroll") || lowerMessage.includes("payslip")) {
      return {
        message: `💰 **Salary Information**:

📄 **November Payslip**: Generated
💵 **Gross Salary**: ₹50,000
💸 **Net Salary**: ₹42,500
📅 **Credit Date**: Last working day of month

**Deductions**:
• PF: ₹6,000
• Tax: ₹1,200  
• Insurance: ₹300

**Benefits**:
• Health Insurance: ₹5,00,000 coverage
• Life Insurance: ₹10,00,000

Need your payslip? Say "show me payslip" or "download payslip"`,
        action: null,
      }
    }

    // Performance queries
    else if (
      lowerMessage.includes("performance") ||
      lowerMessage.includes("review") ||
      lowerMessage.includes("appraisal") ||
      lowerMessage.includes("rating")
    ) {
      return {
        message: `⭐ **Performance Overview**:

📊 **Current Rating**: 4.2/5 (Excellent!)
📅 **Next Review**: Next week with ${userData.manager}
🎯 **Goals Status**: 8/10 completed

**Recent Achievements**:
✅ Project delivered on time
✅ Excellent team collaboration  
✅ Client satisfaction: 95%

**Areas for Improvement**:
📝 Technical documentation
🎓 Advanced skill development

**Preparation Tips**:
• Review your completed goals
• Prepare examples of achievements
• Think about career development plans

Good luck with your review! 🌟`,
        action: null,
      }
    }

    // Holiday queries
    else if (lowerMessage.includes("holiday") || lowerMessage.includes("public holiday")) {
      return {
        message: `🎉 **Upcoming Public Holidays**:

🎄 **December 25**: Christmas Day
🎊 **January 1**: New Year's Day
🇮🇳 **January 26**: Republic Day
🌈 **March 8**: Holi
🕉️ **March 14**: Maha Shivratri

💡 **Pro Tip**: Plan your annual leave around these holidays for longer breaks!

Want to apply for leave around any of these dates? Just let me know!`,
        action: null,
      }
    }

    // HR contact queries
    else if (
      lowerMessage.includes("hr contact") ||
      lowerMessage.includes("hr team") ||
      lowerMessage.includes("hr support") ||
      lowerMessage.includes("contact hr")
    ) {
      return {
        message: `📞 **HR Team Contacts**:

👩‍💼 **HR Manager**: Sarah Johnson
📧 sarah.j@company.com
📱 +91-80-1234-5678

👨‍💼 **HR Executive**: Mike Chen  
📧 mike.c@company.com
📱 +91-80-1234-5679

🕘 **Office Hours**: 9 AM - 6 PM (Mon-Fri)
🚨 **Emergency**: +91-98765-43210

**Quick Help**:
• For leave issues: Contact Sarah
• For payroll queries: Contact Mike
• For urgent matters: Use emergency number

Need me to connect you with HR? Just ask!`,
        action: null,
      }
    }

    // Benefits queries
    else if (
      lowerMessage.includes("benefits") ||
      lowerMessage.includes("insurance") ||
      lowerMessage.includes("medical") ||
      lowerMessage.includes("pf") ||
      lowerMessage.includes("provident fund")
    ) {
      return {
        message: `🎁 **Your Employee Benefits**:

🏥 **Health Insurance**:
• Coverage: ₹5,00,000 per year
• Family coverage included
• Cashless treatment at 1000+ hospitals

💼 **Life Insurance**: ₹10,00,000 coverage

💰 **Financial Benefits**:
• Provident Fund: 12% contribution
• Gratuity: As per company policy
• Performance bonus: Quarterly

🏢 **Work Benefits**:
• Flexible work hours
• Work from home options
• Learning & development budget

📱 **Wellness**:
• Annual health checkup
• Mental health support
• Gym membership reimbursement

Need help with any specific benefit? Just ask!`,
        action: null,
      }
    }

    // Greetings and general queries
    else if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("good morning") ||
      lowerMessage.includes("good afternoon")
    ) {
      const hour = new Date().getHours()
      const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

      return {
        message: `${greeting}, ${userData.name}! 👋

I'm your AI HR assistant, ready to help you with:

🏖️ **Leave Management** - "I need leave tomorrow"
⏰ **Attendance** - "Check my attendance"  
💰 **Payroll** - "Show my payslip"
📊 **Performance** - "My performance review"
📞 **HR Support** - "Contact HR team"
🎁 **Benefits** - "My insurance details"

**Quick Examples**:
• "I need sick leave for 3 days starting Monday"
• "What's my leave balance?"
• "When is my next performance review?"

What can I help you with today?`,
        action: null,
      }
    }

    // Default response
    return {
      message: `I'm here to help with HR-related queries! 🤖

**Try asking me**:
🗣️ "I need leave from tomorrow to Friday"
🗣️ "Apply sick leave for 2 days"
🗣️ "What's my attendance this month?"
🗣️ "Show me my payslip"
🗣️ "When are the holidays?"
🗣️ "Contact HR team"

**Voice Commands Work Too!** 🎤
Just speak naturally like:
• "I'm sick and need 3 days off"
• "Book annual leave next Monday"
• "Check my leave balance"

What would you like to know?`,
      action: null,
    }
  }

  const handleLeaveConversationFlow = (message: string) => {
    const lowerMessage = message.toLowerCase()
    const currentData = conversationContext.leaveData
    const leaveInfo = extractLeaveInfo(message)

    // Merge new information
    const updatedData = { ...currentData, ...leaveInfo }

    // Update leave type if mentioned
    if (
      lowerMessage.includes("sick") ||
      lowerMessage.includes("annual") ||
      lowerMessage.includes("casual") ||
      lowerMessage.includes("maternity") ||
      lowerMessage.includes("paternity")
    ) {
      if (lowerMessage.includes("sick")) updatedData.leaveType = "sick"
      else if (lowerMessage.includes("annual")) updatedData.leaveType = "annual"
      else if (lowerMessage.includes("casual")) updatedData.leaveType = "casual"
      else if (lowerMessage.includes("maternity")) updatedData.leaveType = "maternity"
      else if (lowerMessage.includes("paternity")) updatedData.leaveType = "paternity"
    }

    // Check what's still missing
    const hasLeaveType = updatedData.leaveType
    const hasStartDate = updatedData.startDate
    const hasEndDate = updatedData.endDate || updatedData.duration || updatedData.halfDay

    if (!hasLeaveType) {
      setConversationContext({
        ...conversationContext,
        leaveData: updatedData,
        currentStep: "leave_type",
      })
      return {
        message:
          "What type of leave do you need?\n\n• **Sick** - for illness/medical\n• **Annual** - for vacation/personal\n• **Casual** - for short personal needs\n• **Maternity** - for maternity leave\n• **Paternity** - for paternity leave",
        action: null,
      }
    }

    if (!hasStartDate) {
      setConversationContext({
        ...conversationContext,
        leaveData: updatedData,
        currentStep: "start_date",
      })
      return {
        message: `Great! ${updatedData.leaveType} leave selected.\n\nWhen do you want to start your leave?\n\nYou can say:\n• "Tomorrow"\n• "Next Monday"\n• "15th December"\n• "Today"`,
        action: null,
      }
    }

    if (!hasEndDate) {
      setConversationContext({
        ...conversationContext,
        leaveData: updatedData,
        currentStep: "end_date",
      })
      return {
        message: `Perfect! Start date: ${new Date(updatedData.startDate).toLocaleDateString()}\n\nWhen will your leave end?\n\nYou can say:\n• "For 3 days"\n• "Until Friday"\n• "Half day"\n• "Same day"`,
        action: null,
      }
    }

    // We have all required info
    setConversationContext({
      isCollectingLeaveInfo: false,
      leaveData: {},
      currentStep: "",
      missingFields: [],
    })

    const leaveTypeNames = {
      sick: "Sick Leave",
      annual: "Annual Leave",
      casual: "Casual Leave",
      maternity: "Maternity Leave",
      paternity: "Paternity Leave",
    }

    return {
      message: `Excellent! I have all the information needed:

📋 **Leave Summary**:
• **Type**: ${leaveTypeNames[updatedData.leaveType]}
• **Start**: ${new Date(updatedData.startDate).toLocaleDateString()}
• **End**: ${new Date(updatedData.endDate).toLocaleDateString()}
${updatedData.halfDay ? "• **Half Day**: Yes" : ""}
${updatedData.reason ? `• **Reason**: ${updatedData.reason}` : ""}

Opening the leave application form with this information...`,
      action: "open_leave_modal_with_data",
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#•]/g, ""))
      utterance.rate = 0.8
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleModuleClick = (action: string) => {
    if (action === "leave") {
      setIsLeaveModalOpen(true)
    } else if (action === "attendance") {
      setShowAttendanceModal(true)
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
    setMessages((prev) => [
      ...prev,
      {
        type: "assistant",
        content: `✅ **Leave Application Submitted Successfully!**

📋 **Application Details**:
• **Type**: ${leaveData.leaveType}
• **From**: ${leaveData.startDate}
• **To**: ${leaveData.endDate}
• **Days**: ${leaveData.totalDays}
• **Reason**: ${leaveData.reason}

📧 **Next Steps**:
• Your manager (${userData.manager}) will review your request
• You'll receive an email notification once processed
• Typically takes 1-2 business days for approval

🔔 **Status**: You can check your application status anytime by saying "check my leave status"

Is there anything else I can help you with?`,
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
              <Button
                variant="outline"
                className={`h-12 ${attendanceData.todayStatus === "checked-in" ? "bg-green-50 border-green-200 text-green-700" : "bg-transparent"}`}
                onClick={attendanceData.todayStatus === "checked-in" ? handleCheckOut : handleCheckIn}
              >
                <Clock className="mr-2 h-4 w-4" />
                {attendanceData.todayStatus === "checked-in" ? "Check Out" : "Check In"}
              </Button>
              <Button variant="outline" className="h-12 bg-transparent" onClick={() => setShowAttendanceModal(true)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Attendance
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
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white ${isListening ? "animate-pulse" : ""}`}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">HR Assistant</CardTitle>
                  <p className="text-xs text-gray-500">Smart voice & text support</p>
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
              <div
                className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                style={{ maxHeight: "calc(60vh - 200px)" }}
              >
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
                          <span className="text-xs text-gray-500 font-medium">HR Assistant</span>
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
                    { text: "I need leave tomorrow", icon: "📅" },
                    { text: "Check balance", icon: "💰" },
                    { text: "My attendance", icon: "⏰" },
                    { text: "Show payslip", icon: "💼" },
                    { text: "Sick leave for 2 days", icon: "🤒" },
                    { text: "Contact HR", icon: "📞" },
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
                      placeholder="Try: 'I need sick leave for 3 days starting tomorrow' or use voice..."
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
                          ? "bg-red-500 hover:bg-red-600"
                          : !microphoneSupported || microphonePermission === "denied"
                            ? "bg-gray-100 hover:bg-gray-200 border-2 border-gray-300"
                            : "bg-white hover:bg-blue-50 border-2 hover:border-blue-300"
                      }`}
                      onClick={isListening ? stopListening : startListening}
                      disabled={!microphoneSupported || microphonePermission === "denied"}
                      title={
                        !microphoneSupported
                          ? "Voice recognition not supported in this browser"
                          : microphonePermission === "denied"
                            ? "Microphone access denied. Please enable in browser settings."
                            : isListening
                              ? "Stop listening"
                              : "Start voice input"
                      }
                    >
                      {isListening ? (
                        <MicOff className="h-5 w-5" />
                      ) : !microphoneSupported || microphonePermission === "denied" ? (
                        <Mic className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
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

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
                    {microphoneSupported ? (
                      <span>🎤 Voice commands work! • Enter to send • Shift+Enter for new line</span>
                    ) : (
                      <span>📝 Text input available • Enter to send • Shift+Enter for new line</span>
                    )}
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

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        attendanceData={attendanceData}
        attendanceHistory={attendanceHistory}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onBreakToggle={handleBreakToggle}
        userData={userData}
      />
    </div>
  )
}
