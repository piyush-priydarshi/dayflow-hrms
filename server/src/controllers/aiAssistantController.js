import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';

export const handleAIChat = async (req, res) => {
  try {
    const { question, employeeId } = req.body;

    if (!question || !employeeId) {
      return res.status(400).json({ message: 'Both question and employeeId are required' });
    }

    // 1. Fetch user details
    const employeeUser = await User.findOne({ employeeId });
    if (!employeeUser) {
      return res.status(404).json({ message: `Employee with ID ${employeeId} not found` });
    }

    const userId = employeeUser._id;

    // 2. Fetch leaves and attendance (Read-only queries)
    const leaves = await Leave.find({ user: userId }).sort({ startDate: -1 });
    const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });

    // 3. Compile context data
    const totalLeavesCount = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'Rejected').length;

    const totalAttendanceCount = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const halfDayCount = attendance.filter(a => a.status === 'Half-day').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;

    const contextText = `
Employee Info:
Name: ${employeeUser.name}
Employee ID: ${employeeUser.employeeId}
Email: ${employeeUser.email}
Role: ${employeeUser.role}

Leave Applications History:
Total Requests: ${totalLeavesCount}
Pending Requests: ${pendingLeaves}
Approved Requests: ${approvedLeaves}
Rejected Requests: ${rejectedLeaves}
Details:
${leaves.map(l => `- Type: ${l.leaveType}, Dates: ${new Date(l.startDate).toLocaleDateString()} to ${new Date(l.endDate).toLocaleDateString()}, Status: ${l.status}, Remarks: "${l.remarks}"`).join('\n')}

Attendance Records History:
Total Logged Days: ${totalAttendanceCount}
Present Days: ${presentCount}
Half-days: ${halfDayCount}
Absent Days: ${absentCount}
Details:
${attendance.map(a => `- Date: ${new Date(a.date).toLocaleDateString()}, Check-In: ${a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : 'N/A'}, Check-Out: ${a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : 'N/A'}, Status: ${a.status}`).join('\n')}
`;

    // 4. Try calling the Anthropic Claude API
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (apiKey) {
      try {
        console.log('Sending context to Claude API...');
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 1000,
            system: 'You are DayFlow AI, a helpful HR assistant. Answer the employee\'s question about their leaves or attendance based ONLY on the provided database context. Keep answers clear, concise, and professional. Mention specific details (dates, status, counts) from the context directly in your response.',
            messages: [
              {
                role: 'user',
                content: `Question: ${question}\n\nContext:\n${contextText}`
              }
            ]
          })
        });

        if (response.ok) {
          const result = await response.json();
          const contentText = result.content?.[0]?.text || '';
          return res.status(200).json({ answer: contentText });
        } else {
          const errData = await response.json();
          console.warn('Claude API returned error:', errData);
        }
      } catch (apiError) {
        console.error('Claude API call failed:', apiError);
      }
    }

    // 5. Rule-based Fallback Parser if API key is missing or fails (Mock Claude)
    console.log('Using local fallback AI processing...');
    let answer = `Hello ${employeeUser.name}. `;
    const lowercaseQuestion = question.toLowerCase();

    if (lowercaseQuestion.includes('leave') || lowercaseQuestion.includes('vacation') || lowercaseQuestion.includes('holiday')) {
      answer += `Regarding your leave requests, you have submitted a total of ${totalLeavesCount} applications. `;
      if (pendingLeaves > 0) {
        answer += `Currently, you have ${pendingLeaves} pending leave request(s) awaiting approval. `;
      }
      if (approvedLeaves > 0) {
        answer += `${approvedLeaves} request(s) have been approved. `;
      }
      if (leaves.length > 0) {
        answer += `Your latest request was a ${leaves[0].leaveType} leave starting on ${new Date(leaves[0].startDate).toLocaleDateString()}, which is currently ${leaves[0].status}.`;
      } else {
        answer += `You have no active leave requests logged in the system yet.`;
      }
    } else if (lowercaseQuestion.includes('attendance') || lowercaseQuestion.includes('present') || lowercaseQuestion.includes('clock') || lowercaseQuestion.includes('work')) {
      answer += `According to our attendance records, you have logged ${totalAttendanceCount} working days. `;
      answer += `This breakdown consists of ${presentCount} present days, ${halfDayCount} half-days, and ${absentCount} absent records. `;
      if (attendance.length > 0) {
        const lastLog = attendance[0];
        answer += `Your last check-in occurred on ${new Date(lastLog.date).toLocaleDateString()} with status: ${lastLog.status}.`;
      } else {
        answer += `You have no check-in records logged for this month yet.`;
      }
    } else {
      answer += `I can help you audit your leaves and attendance schedules. For example, try asking: "How many leave days do I have left?" or "What is my attendance history?"\n\n**Quick Stats**:\n- Leaves: ${approvedLeaves} Approved, ${pendingLeaves} Pending\n- Attendance: ${presentCount} Present / ${totalAttendanceCount} Total logged days.`;
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Server error during AI assistant chat processing', error: error.message });
  }
};
