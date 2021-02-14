import axios from 'axios';

export default class HealthServices {

  fetchScanList = (callback) => {
    axios.get('http://localhost:3001/medical_billing_master').then(res => {
      callback(res.data);
    }).catch(error => {
      callback(error);
    });
  }

  addPatientDetails = (payload, callback) => {
    axios.post('http://localhost:3001/patient_details', payload).then(res => {
      callback(res.data);
    }).catch(error => {
      callback(error);
    });
  }

  addPatientTests = (payload, callback) => {
    axios.post('http://localhost:3001/patient_tests', payload).then(res => {
      callback(res.data);
    }).catch(error => {
      callback(error);
    });
  }

  fetchPatientDetails = (sort, callback) => {
    axios.get('http://localhost:3001/patient_details?_embed=patient_tests&' + sort).then(res => {
      callback(res.data);
    }).catch(error => {
      callback(error);
    });
  }

}