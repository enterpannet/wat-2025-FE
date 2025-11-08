import RegistrationForm from "./RegistrationForm";

const TeacherRegistrationForm = () => {
  return (
    <RegistrationForm
      pageTitle="ระบบลงทะเบียนพระอาจารย์"
      formTitle="แบบฟอร์มลงทะเบียนพระอาจารย์"
      successMessage="ลงทะเบียนพระอาจารย์เสร็จแล้ว"
      description="กรุณากรอกข้อมูลสำหรับพระอาจารย์ เพื่อให้ทีมงานสามารถติดต่อและจัดการข้อมูลได้อย่างครบถ้วน"
    />
  );
};

export default TeacherRegistrationForm;

