export interface XitecLog {
  id: string;
  name: string;
  birth?: string;
  place?: string;
  nationalId: string;
  driverName: string;
  nationalIdImage: string;
  licensePlate: string;
  licensePlateImage: string;
  driverFaceImage: string;
  entryTime: string;
  

  ticketId?: string;
  ticket?: {
    ticket_id: string;
    ticket_code: string;
    [key: string]: any;
  };
}

export interface ApiResponseCCCD {
  status: string;
  message: string;
  data: {
    session: any;
    vehicle: any;
    person: {
      cccd_number: string;
      full_name: string;
      birth: string;
      sex: string | null;
      place: string;
      cccd_face_image_url: string;
      cccd_original_image_url: string;
    };
  };
}