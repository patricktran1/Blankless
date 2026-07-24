export interface GuildPatient {
  id: string;
  name: string;
  appointmentTypes: string[];
  preferredChannel: "sms" | "email";
  clinicalPriority: 1 | 2 | 3;
  waitlistSince: string;
  acceptanceRate: number;
  timeOfDayPreference: "morning" | "afternoon" | "none";
  demoSignals?: Record<string, Partial<Record<keyof GuildPolicyWeights, number>>>;
}

export interface GuildPolicyWeights {
  typeCompatibility: number;
  availabilityFit: number;
  clinicalPriority: number;
  waitlistAge: number;
  acceptanceHistory: number;
  channelPreference: number;
  timeOfDay: number;
}

export const policyV1: GuildPolicyWeights = {
  typeCompatibility:30,
  availabilityFit:25,
  clinicalPriority:15,
  waitlistAge:10,
  acceptanceHistory:10,
  channelPreference:5,
  timeOfDay:5
};

export const patients: GuildPatient[] = [
  { id:"pt-01", name:"Maya Chen", appointmentTypes:["derm-follow-up","biopsy-site-check"], preferredChannel:"sms", clinicalPriority:2, waitlistSince:"2026-07-06", acceptanceRate:.8, timeOfDayPreference:"afternoon", demoSignals:{"derm-follow-up":{typeCompatibility:1,availabilityFit:.8,clinicalPriority:.6,waitlistAge:.4,acceptanceHistory:.8,channelPreference:1,timeOfDay:1}} },
  { id:"pt-02", name:"Daniel Brooks", appointmentTypes:["derm-follow-up","new-patient-consult","biopsy-site-check"], preferredChannel:"email", clinicalPriority:2, waitlistSince:"2026-07-12", acceptanceRate:.67, timeOfDayPreference:"none", demoSignals:{"derm-follow-up":{typeCompatibility:1,availabilityFit:.68,clinicalPriority:.6,waitlistAge:.3,acceptanceHistory:.75,channelPreference:1,timeOfDay:.5},"biopsy-site-check":{typeCompatibility:1,availabilityFit:.8,clinicalPriority:.6,waitlistAge:.4,acceptanceHistory:.5,channelPreference:1,timeOfDay:.33}} },
  { id:"pt-05", name:"Sofia Ramirez", appointmentTypes:["derm-follow-up","biopsy-site-check"], preferredChannel:"sms", clinicalPriority:1, waitlistSince:"2026-06-20", acceptanceRate:.33, timeOfDayPreference:"morning", demoSignals:{"derm-follow-up":{typeCompatibility:1,availabilityFit:1,clinicalPriority:1,waitlistAge:.6,acceptanceHistory:.3,channelPreference:1,timeOfDay:0},"biopsy-site-check":{typeCompatibility:.7,availabilityFit:.5,clinicalPriority:1,waitlistAge:.5,acceptanceHistory:.28,channelPreference:1,timeOfDay:0}} },
  { id:"pt-07", name:"Chloe Martin", appointmentTypes:["derm-follow-up","biopsy-site-check"], preferredChannel:"sms", clinicalPriority:2, waitlistSince:"2026-05-30", acceptanceRate:.5, timeOfDayPreference:"afternoon", demoSignals:{"derm-follow-up":{typeCompatibility:1,availabilityFit:.44,clinicalPriority:.6,waitlistAge:.6,acceptanceHistory:.5,channelPreference:1,timeOfDay:1},"biopsy-site-check":{typeCompatibility:1,availabilityFit:1,clinicalPriority:.75,waitlistAge:.8,acceptanceHistory:.56,channelPreference:1,timeOfDay:.55}} },
  { id:"pt-08", name:"Noah Patel", appointmentTypes:["derm-follow-up","biopsy-site-check"], preferredChannel:"email", clinicalPriority:3, waitlistSince:"2026-07-18", acceptanceRate:0, timeOfDayPreference:"none", demoSignals:{"derm-follow-up":{typeCompatibility:1,availabilityFit:.48,clinicalPriority:.2,waitlistAge:.3,acceptanceHistory:0,channelPreference:1,timeOfDay:1},"biopsy-site-check":{typeCompatibility:1,availabilityFit:.6,clinicalPriority:.2,waitlistAge:.3,acceptanceHistory:0,channelPreference:1,timeOfDay:.5}} }
];
