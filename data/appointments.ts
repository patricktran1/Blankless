import type { Appointment } from "@/lib/types";

export const appointments: Appointment[] = [
  { id:"appt-001", day:"Tue", clinician:"Dr. Rivera", appointmentType:"new-patient-consult", startTime:"09:00", duration:30, status:"confirmed", patientName:"Lena Ortiz" },
  { id:"appt-002", day:"Tue", clinician:"Dr. Rivera", appointmentType:"derm-follow-up", startTime:"09:40", duration:20, status:"confirmed", patientName:"Owen Reed" },
  { id:"appt-003", day:"Tue", clinician:"Dr. Rivera", appointmentType:"procedure", startTime:"10:20", duration:40, status:"confirmed", patientName:"Avery Jones" },
  { id:"appt-004", day:"Tue", clinician:"Dr. Rivera", appointmentType:"derm-follow-up", startTime:"11:20", duration:20, status:"confirmed", patientName:"Tara Singh" },
  { id:"appt-005", day:"Tue", clinician:"Dr. Rivera", appointmentType:"new-patient-consult", startTime:"13:00", duration:30, status:"confirmed", patientName:"Chris Hall" },
  { id:"appt-014", day:"Tue", clinician:"Dr. Rivera", appointmentType:"derm-follow-up", startTime:"14:30", duration:20, status:"confirmed", patientName:"Jordan Kim" },
  { id:"appt-007", day:"Tue", clinician:"Dr. Rivera", appointmentType:"derm-follow-up", startTime:"15:10", duration:20, status:"confirmed", patientName:"Mei Wong" },
  { id:"appt-008", day:"Tue", clinician:"Dr. Rivera", appointmentType:"procedure", startTime:"15:50", duration:40, status:"confirmed", patientName:"Ben Stone" },
  { id:"appt-workflowB-031", day:"Thu", clinician:"Dr. Rivera", appointmentType:"biopsy-site-check", startTime:"15:10", duration:15, status:"confirmed", patientName:"Taylor Green" }
];
