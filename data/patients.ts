import type { Patient } from "@/lib/types";

export const patients: Patient[] = [
  {
    id:"pt-01", name:"Maya Chen", appointmentTypes:["derm-follow-up","biopsy-site-check"],
    availability:{weekdays:["Tue","Thu"],window:"12:00-17:30"}, preferredChannel:"sms",
    communicationConsent:{sms:true,email:true}, waitlistSince:"2026-07-06", clinicalPriority:2,
    travelMinutes:15, previousOffers:5, acceptanceRate:.8, averageResponseTime:90,
    timeOfDayPreference:"afternoon", status:"waitlisted",
    demoSignals:{"derm-follow-up":{typeCompatibility:1,availabilityFit:.8,clinicalPriority:.6,waitlistAge:.4,acceptanceHistory:.8,channelPreference:1,timeOfDay:1}}
  },
  {
    id:"pt-02", name:"Daniel Brooks", appointmentTypes:["derm-follow-up","new-patient-consult","biopsy-site-check"],
    availability:{weekdays:["Tue","Thu"],window:"08:00-18:00"}, preferredChannel:"email",
    communicationConsent:{sms:true,email:true}, waitlistSince:"2026-07-12", clinicalPriority:2,
    travelMinutes:25, previousOffers:3, acceptanceRate:.67, averageResponseTime:420,
    timeOfDayPreference:"none", status:"waitlisted",
    demoSignals:{
      "derm-follow-up":{typeCompatibility:1,availabilityFit:.68,clinicalPriority:.6,waitlistAge:.3,acceptanceHistory:.75,channelPreference:1,timeOfDay:.5},
      "biopsy-site-check":{typeCompatibility:1,availabilityFit:.8,clinicalPriority:.6,waitlistAge:.4,acceptanceHistory:.5,channelPreference:1,timeOfDay:.33}
    }
  },
  {
    id:"pt-03", name:"Priya Shah", appointmentTypes:["derm-follow-up"],
    availability:{weekdays:["Tue","Thu"],window:"09:00-17:00"}, preferredChannel:"sms",
    communicationConsent:{sms:true,email:true}, waitlistSince:"2026-06-28", clinicalPriority:1,
    travelMinutes:75, previousOffers:2, acceptanceRate:.5, averageResponseTime:180,
    timeOfDayPreference:"none", status:"waitlisted"
  },
  {
    id:"pt-04", name:"Marcus Lee", appointmentTypes:["derm-follow-up","biopsy-site-check"],
    availability:{weekdays:["Tue","Thu"],window:"10:00-16:00"}, preferredChannel:"sms",
    communicationConsent:{sms:true,email:false}, waitlistSince:"2026-07-10", clinicalPriority:2,
    travelMinutes:20, previousOffers:4, acceptanceRate:.75, averageResponseTime:120,
    timeOfDayPreference:"none", status:"waitlisted", lastContactedAt:"S1-minus-2h"
  },
  {
    id:"pt-05", name:"Sofia Ramirez", appointmentTypes:["derm-follow-up","biopsy-site-check"],
    availability:{weekdays:["Tue","Thu"],window:"08:00-17:00"}, preferredChannel:"sms",
    communicationConsent:{sms:true,email:true}, waitlistSince:"2026-06-20", clinicalPriority:1,
    travelMinutes:10, previousOffers:6, acceptanceRate:.33, averageResponseTime:600,
    timeOfDayPreference:"morning", status:"waitlisted",
    demoSignals:{
      "derm-follow-up":{typeCompatibility:1,availabilityFit:1,clinicalPriority:1,waitlistAge:.6,acceptanceHistory:.3,channelPreference:1,timeOfDay:0},
      "biopsy-site-check":{typeCompatibility:.7,availabilityFit:.5,clinicalPriority:1,waitlistAge:.5,acceptanceHistory:.28,channelPreference:1,timeOfDay:0}
    }
  },
  {
    id:"pt-06", name:"Ethan Wilson", appointmentTypes:["mole-mapping-45min"],
    availability:{weekdays:["Tue","Thu"],window:"13:00-18:00"}, preferredChannel:"sms",
    communicationConsent:{sms:true,email:true}, waitlistSince:"2026-07-15", clinicalPriority:3,
    travelMinutes:18, previousOffers:1, acceptanceRate:1, averageResponseTime:60,
    timeOfDayPreference:"afternoon", status:"waitlisted"
  },
  {
    id:"pt-07", name:"Chloe Martin", appointmentTypes:["derm-follow-up","biopsy-site-check"],
    availability:{weekdays:["Tue","Thu"],window:"11:00-18:00"}, preferredChannel:"sms",
    communicationConsent:{sms:true,email:true}, waitlistSince:"2026-05-30", clinicalPriority:2,
    travelMinutes:22, previousOffers:2, acceptanceRate:.5, averageResponseTime:150,
    timeOfDayPreference:"afternoon", status:"waitlisted",
    demoSignals:{
      "derm-follow-up":{typeCompatibility:1,availabilityFit:.44,clinicalPriority:.6,waitlistAge:.6,acceptanceHistory:.5,channelPreference:1,timeOfDay:1},
      "biopsy-site-check":{typeCompatibility:1,availabilityFit:1,clinicalPriority:.75,waitlistAge:.8,acceptanceHistory:.56,channelPreference:1,timeOfDay:.55}
    }
  },
  {
    id:"pt-08", name:"Noah Patel", appointmentTypes:["derm-follow-up","biopsy-site-check"],
    availability:{weekdays:["Tue","Thu"],window:"09:00-17:00"}, preferredChannel:"email",
    communicationConsent:{sms:false,email:true}, waitlistSince:"2026-07-18", clinicalPriority:3,
    travelMinutes:30, previousOffers:1, acceptanceRate:0, averageResponseTime:900,
    timeOfDayPreference:"none", status:"waitlisted",
    demoSignals:{
      "derm-follow-up":{typeCompatibility:1,availabilityFit:.48,clinicalPriority:.2,waitlistAge:.3,acceptanceHistory:0,channelPreference:1,timeOfDay:1},
      "biopsy-site-check":{typeCompatibility:1,availabilityFit:.6,clinicalPriority:.2,waitlistAge:.3,acceptanceHistory:0,channelPreference:1,timeOfDay:.5}
    }
  }
];
