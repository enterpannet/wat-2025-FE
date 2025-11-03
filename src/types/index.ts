export interface Province {
  id: number;
  name_th: string;
  name_en: string;
  districts?: District[];
}

export interface District {
  id: number;
  province_id: number;
  province?: Province;
  name_th: string;
  name_en: string;
  sub_districts?: SubDistrict[];
}

export interface SubDistrict {
  id: number;
  district_id: number;
  district?: District;
  name_th: string;
  name_en: string;
  zip_code: string;
}

export interface Registration {
  id: number;
  created_at: string;
  updated_at: string;
  full_name: string;
  nickname: string;
  birth_date: string;
  province_id: number;
  province?: Province;
  district_id: number;
  district?: District;
  sub_district_id: number;
  sub_district?: SubDistrict;
  address_detail: string;
  phone_number: string;
  temple_name: string;
  medical_condition: string;
  vassa: number;
  chanted_pariwat: boolean;
  chanted_manat: boolean;
  chanted_ok_apan: boolean;
}

export interface RegistrationFormData {
  full_name: string;
  nickname: string;
  birth_date: string;
  province_id: string;
  district_id: string;
  sub_district_id: string;
  address_detail: string;
  phone_number: string;
  temple_name: string;
  medical_condition: string;
  vassa: string;
}

export interface RegistrationRequest {
  full_name: string;
  nickname: string;
  birth_date: string;
  province_id: number;
  district_id: number;
  sub_district_id: number;
  address_detail: string;
  phone_number: string;
  temple_name: string;
  medical_condition: string;
  vassa: number;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  roles?: ("registration")[];
}


export interface ActivityLog {
  id: number;
  created_at: string;
  action: string;
  description: string;
  module: string;
  user_id: number;
  user?: User;
}

export interface ActivityLogRequest {
  action: string;
  description: string;
  module: string;
}

export interface DeviceLog {
  id: number;
  created_at: string;
  device_type: string;
  device_info: string;
  action: string;
  description: string;
  module: string;
  ip_address: string;
}

export interface DeviceLogRequest {
  device_type: string;
  device_info: string;
  action: string;
  description: string;
  module: string;
  ip_address?: string;
}

export interface Summary {
  registrations: {
    total: number;
    chanted_pariwat: number;
    chanted_manat: number;
    chanted_ok_apan: number;
  };
  logs: {
    activity_logs: number;
    device_logs: number;
  };
}
