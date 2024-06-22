const express = require("express");

const app = express();
app.set("port", 3000);

app.use(express.json())
app.use(express.urlencoded({extended: true}))

let users = [];
let doctors = [];
let consultations = [];

// Function
function isValidDate(date)
{
  if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date))
    return false;

  var tempDate = date.split("/");
  if (tempDate.length == 0) {
    return false;
  }

  var day = parseInt(tempDate[0], 10);
  var month = parseInt(tempDate[1], 10);
  var year = parseInt(tempDate[2], 10);

  if(year < 1000 || year > 3000 || month <= 0 || month > 12)
      return false;

  var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

  if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;

  return day > 0 && day <= monthLength[month - 1];
};

function isValidPhoneNumber(phone_number){
  return /^\d+$/.test(phone_number);
}

function generateUserID(full_name){
  let tempNames = full_name.substr(0,3);
  let tempName = tempNames[0] + tempNames[1] + tempNames[2];

  let tempUsers = users.filter((user) => user.user_id.toLowerCase().includes(tempName.toLowerCase()));
  let userCount = tempUsers.length+1;
  let countID = "";
  if (userCount < 10) {
    countID = "00" + userCount;
  } else if (userCount < 100) {
    countID = "0" + userCount;
  } else {
    countID = userCount + "";
  }

  let user_id = tempName.toUpperCase() + countID;

  return user_id;
}

function addUser(user_id,full_name,phone_number,gender,address,dob){
  const newUser = {
    user_id: user_id,
    full_name: full_name,
    phone_number: phone_number,
    gender: gender.toUpperCase(),
    address: address,
    dob: dob
  }
  users.push(newUser);

  const dataUser = {
    user_id: user_id,
    full_name: full_name,
    phone_number: phone_number
  }
  return dataUser;
}

function isValidTime(time){
  return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(time);
}

function generateDoctorID(first_name,last_name){
  let tempName1 = first_name.substr(0,1);
  let tempName2 = last_name.substr(0,1);
  let tempName = tempName1 + tempName2;

  let tempDoctors = doctors.filter((doctor) => doctor.doctor_id.toLowerCase().includes(tempName.toLowerCase()));
  let doctorCount = tempDoctors.length+1;
  let countID = "";
  if (doctorCount < 10) {
    countID = "00" + doctorCount;
  } else if (doctorCount < 100) {
    countID = "0" + doctorCount;
  } else {
    countID = doctorCount + "";
  }

  let doctor_id = "DOC" + tempName.toUpperCase() + countID;

  return doctor_id;
}

function addDoctor(doctor_id,first_name,last_name,phone_number,headline,consultation_h_start,consultation_h_end){
  const newDoctor = {
    doctor_id: doctor_id,
    first_name: first_name,
    last_name: last_name,
    phone_number: phone_number,
    headline: headline,
    consultation_h_start: consultation_h_start,
    consultation_h_end: consultation_h_end
  }
  doctors.push(newDoctor);

  const dataDoctor = {
    doctor_id: doctor_id,
    full_name: first_name + " " + last_name,
    phone_number: phone_number,
    consultation_hour: consultation_h_start + " - " + consultation_h_end
  }
  return dataDoctor;
}

function isValidRangeTime(doctor_id,time){
  const doctor = doctors.find((doctor) => doctor.doctor_id == doctor_id);
  let consultation_h_start = doctor.consultation_h_start;
  let consultation_h_end = doctor.consultation_h_end;

  return time >= consultation_h_start && time <= consultation_h_end;
}

function generateConsultationID(){
  let tempName = "CSL";

  let tempConsultations = consultations.filter((consultation) => consultation.consultation_id.includes(tempName));
  let consultationCount = tempConsultations.length+1;
  let countID = "";
  if (consultationCount < 10) {
    countID = "00" + consultationCount;
  } else if (consultationCount < 100) {
    countID = "0" + consultationCount;
  } else {
    countID = consultationCount + "";
  }

  let consultation_id = tempName.toUpperCase() + countID;

  return consultation_id;
}

function addConsultation(consultation_id,user_id,doctor_id,time){
  const newConsultation = {
    consultation_id: consultation_id,
    user_id: user_id,
    doctor_id: doctor_id,
    time: time,
    status: "Pending"
  }
  consultations.push(newConsultation);

  const dataConsultation = {
    consultation_id: consultation_id
  }
  return dataConsultation;
}

function getAllDoctor(name){
  let tempDoctors = [];
  
  if (name) {
    tempDoctors = doctors.filter((doctor) => doctor.first_name.toLowerCase().includes(name.toLowerCase()) || doctor.last_name.toLowerCase().includes(name.toLowerCase()));
  } else {
    tempDoctors = doctors;
  }

  let result = [];
  tempDoctors.forEach(doctor => {
    let newDoctor = {
      doctor_id: doctor.doctor_id,
      name: "Dr. " + doctor.last_name,
    }
    result.push(newDoctor);
  });
  return result;
}

function getDoctor(doctor_id){
  let doctor = doctors.find((doctor) => doctor.doctor_id == doctor_id);
  let result = {
    name: "Dr. " + doctor.last_name,
    headline: doctor.headline,
    consultation_hour: doctor.consultation_h_start + " - " + doctor.consultation_h_end,
    phone_number: doctor.phone_number
  }
  return result;
}

function getAllUser(name){
  let tempUsers = [];
  
  if (name) {
    tempUsers = users.filter((user) => user.full_name.toLowerCase().includes(name.toLowerCase()));
  } else {
    tempUsers = users;
  }

  let result = [];
  tempUsers.forEach(user => {
    let newUser = {
      user_id: user.user_id,
      name: user.full_name,
    }
    result.push(newUser);
  });
  return result;
}

function getUser(user_id){
  let user = users.find((user) => user.user_id == user_id);

  // Fill Consultation
  let userConsultations = [];
  consultations.forEach(cons => {
    if (cons.user_id == user_id) {
      let tempConsDoctor = doctors.find((doctor) => doctor.doctor_id == cons.doctor_id);      
      const newCons = {
        consultations_id: cons.consultation_id,
        doctor: "Dr. " + tempConsDoctor.last_name,
        status: cons.status
      };
      userConsultations.push(newCons);
    }
  });

  let result = {
    full_name: user.full_name,
    phone_number: user.phone_number,
    dob: user.dob,
    gender: user.gender,
    address: user.address,
    consultations: userConsultations
  }
  return result;
}

function isValidConsultationDoctor(consultation_id,doctor_id){
  let tempConsultation = consultations.find((consultation) => consultation.consultation_id == consultation_id);

  if (tempConsultation.doctor_id == doctor_id) {
    return true;
  }

  return false;
}


// 1
app.post("/api/users", (req,res) => {
  let {full_name, dob, phone_number, gender, address} = req.body;

  // Empty Input
  if (!(full_name) || !(phone_number) || !(gender) || !(address) || !(dob)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid DOB
  if (!isValidDate(dob)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid Phone_Number
  if (!isValidPhoneNumber(phone_number)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid Gender
  if (gender.toLowerCase() != "m" && gender.toLowerCase() != "f") {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Generate ID
  let user_id = generateUserID(full_name);

  // Add User
  const result = addUser(user_id,full_name,phone_number, gender, address, dob);
  return res.status(201).send(result);
});

// 2
app.post("/api/doctors", (req,res) => {
  let {first_name, last_name, phone_number, headline, consultation_h_start, consultation_h_end} = req.body;

  // Empty Input
  if (!(first_name) || !(last_name) || !(phone_number) || !(headline) || !(consultation_h_start) || !(consultation_h_end)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid Phone_Number
  if (!isValidPhoneNumber(phone_number)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid Consultations Time Format
  if (!isValidTime(consultation_h_start) || !isValidTime(consultation_h_end)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }
  if (consultation_h_end < consultation_h_start) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Generate ID
  let doctor_id = generateDoctorID(first_name,last_name);

  // Add Doctor
  const result = addDoctor(doctor_id,first_name,last_name,phone_number,headline,consultation_h_start,consultation_h_end);
  return res.status(201).send(result);
});

// 3
app.post("/api/consultations", (req,res) => {
  let {user_id, doctor_id, time} = req.body;

  // Empty Input
  if (!(user_id) || !(doctor_id) || !(time)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid UserID
  let userExist = users.find((user) => user.user_id == user_id);
  if (!userExist) {
    return res.status(404).send({
      message: "User tidak ditemukan!"
    })
  }

  // Valid DoctorID
  let doctorExist = doctors.find((doctor) => doctor.doctor_id == doctor_id);
  if (!doctorExist) {
    return res.status(404).send({
      message: "Dokter tidak ditemukan!"
    })
  }

  // Valid Time
  if (!isValidTime(time)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }
  if (!isValidRangeTime(doctor_id,time)) {
    return res.status(400).send({
      message: "Waktu di luar jadwal konsulatasi!"
    })
  }

  // Generate ID
  let consultation_id = generateConsultationID();

  // Add Consultation
  const result = addConsultation(consultation_id,user_id,doctor_id,time);
  return res.status(201).send(result);
});

// 4
app.get("/api/doctors", (req,res) => {
  let name = req.query.name;

  const result = getAllDoctor(name);
  return res.status(200).json({
    total: result.length,
    result,
  });
});
app.get("/api/doctors/:doctor_id", (req, res) => {
  let {doctor_id} = req.params;

  // Valid DoctorID
  let doctorExist = doctors.find((doctor) => doctor.doctor_id == doctor_id);
  if (!doctorExist) {
    return res.status(404).send({
      message: "Dokter tidak ditemukan!"
    })
  }

  // Doctors
  const result = getDoctor(doctor_id);
  return res.status(200).json({
    total: result.length,
    result,
  });

});

// 5
app.get("/api/users", (req,res) => {
  let name = req.query.name;

  const result = getAllUser(name);
  return res.status(200).json({
    total: result.length,
    result,
  });
});
app.get("/api/users/:user_id", (req, res) => {
  let {user_id} = req.params;

  // Valid UserID
  let userExist = users.find((user) => user.user_id == user_id);
  if (!userExist) {
    return res.status(404).send({
      message: "User tidak ditemukan!"
    })
  }

  // Users
  const result = getUser(user_id);
  return res.status(200).json({
    total: result.length,
    result,
  });

});

// 6
app.put("/api/consultations/:consul_id", (req,res) => {
  let {consul_id} = req.params;
  let {doctor_id,status} = req.body;

  // Empty Input
  if (!(doctor_id) || !(status)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan! input"
    })
  }

  // Valid ConsultationID
  let consultationExist = consultations.find((consultation) => consultation.consultation_id == consul_id);
  if (!consultationExist) {
    return res.status(404).send({
      message: "Konsultasi tidak ditemukan!"
    })
  }

  // Valid DoctorID
  let doctorExist = doctors.find((doctor) => doctor.doctor_id == doctor_id);
  if (!doctorExist) {
    return res.status(404).send({
      message: "Dokter tidak ditemukan!"
    })
  }

  // Valid Status
  status = status.toUpperCase();
  if (status != "PEN" && status != "ACC" && status != "DEC") {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan! status"
    })
  }

  // Valid Consultation Doctor
  if (!isValidConsultationDoctor(consul_id,doctor_id)) {
    return res.status(400).send({
      message: "Konsultasi bukan milik dokter!"
    })
  }

  // OK
  let dataConsultation = consultations.find((consultation) => consultation.consultation_id == consul_id);
  
  
  let newStatus = "";
  if (status === "PEN") {
    newStatus = "Pending";
  } else if (status === "ACC") {
    newStatus = "Accepted";
  } else if (status === "DEC") {
    newStatus = "Declined";
  }

  const result = {
    consultation_id: consul_id,
    status: newStatus
  }

  dataConsultation.status = newStatus;

  return res.status(200).send({
    result,
});


});

// 7
app.delete("/api/consultations", (req,res) => {
  let {doctor_id} = req.body;

  // Empty Input
  if (!(doctor_id)) {
    return res.status(400).send({
      message: "Field tidak sesuai ketentuan!"
    })
  }

  // Valid DoctorID
  let doctorExist = doctors.find((doctor) => doctor.doctor_id == doctor_id);
  if (!doctorExist) {
    return res.status(404).send({
      message: "Dokter tidak ditemukan!"
    })
  }

  // OK
  const result = [];
  consultations.forEach(consultation => {
    if (consultation.doctor_id == doctor_id && consultation.status == "Pending") {
      consultation.status = "Declined";

      let newConsultation = {
        consultation_id: consultation.consultation_id,
        status: consultation.status
      }
      result.push(newConsultation);
    }
  });

  return res.status(200).send({
    total: result.length,
    result,
});
});


// Listening
app.listen(app.get("port"), () => {
    console.log(`Server started at http://localhost:${app.get("port")}`);
});