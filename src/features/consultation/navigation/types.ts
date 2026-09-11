export type ConsultationStackParamList = {
  DoctorList: undefined;
  DoctorDetail: { doctorId: string };
  BookingConfirm: {
    doctorId: string;
    doctorName: string;
    slotId: string;
    startTime: string;
    endTime: string;
  };
  UpcomingBookings: undefined;
};
