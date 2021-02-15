import React from 'react';
import { Button } from '@material-ui/core';
import AutoCompleteSearch from './AutoCompleteSearch';
import BillingList from './BillingList';
import HealthServices from '../../services/HealthServices';
import './Patient.scss';

class NewPatientDetails extends React.Component {
  constructor(props) {
    super(props);
    this.salutation = ["Mr", "Mrs", "Ms"];
    this.ageType = ["years", "months"];
    this.HealthServices = new HealthServices();
    this.state = {
      patient: {
        title: 'Mr',
        gender: 'Male',
        age: ''
      },
      scanList: [],
      selScanopt: {},
      billingList: [],
      error: false,
      errorMsg: '',
      successMsg: ''
    };
    this.fetchScanList();
  }

  resetState = () => {
    this.setState({
      patient: {
        title: 'Mr',
        gender: 'Male',
        age: ''
      },
      scanList: [],
      selScanopt: {},
      billingList: []
    })
  }

  fetchScanList = () => {
    this.HealthServices.fetchScanList((result) => {
      console.log("scanList", result);
      this.setState({
        scanList: result
      });
    });
  }

  setErrorMsg = (err, errMsg) => {
    this.setState({
      error: err,
      errorMsg: errMsg
    });
  }

  genderChange = (event, type) => {
    this.setErrorMsg(false, '');
    let gender, title;
    if (type === 'title') {
      title = event.target.value;
      gender = (title === 'Mr') ? 'Male' : 'Female';
    } else {
      gender = event.target.value;
      title = (gender === 'Male') ? 'Mr' : 'Ms';
    }

    this.setState({
      patient: {
        ...this.state.patient,
        gender: gender,
        title: title
      }
    });
  }

  handleAge = (event) => {
    this.setErrorMsg(false, '');
    const ageValue = this.getAge(event.target.value);
    this.setState({
      patient: {
        ...this.state.patient,
        age: ageValue
      }
    });
  };

  getAge = dob => {
    var ageDiff = Date.now() - new Date(dob).getTime();
    var age = new Date(ageDiff);
    return Math.abs(age.getUTCFullYear() - 1970);
  }

  setScanOption = (item) => {
    this.setErrorMsg(false, '');
    this.setState({
      selScanopt: (item) ? item : {}
    });
  }

  validateDiscount = (userDiscount, BillingDiscount, scanAmt) => {
    if (BillingDiscount.includes("%")) {
      const maxDiscount = scanAmt * Number(BillingDiscount.split("%")[0] / 100);
      if (Number(userDiscount) > Number(maxDiscount)) return false;
    } else {
      if (Number(userDiscount) > Number(BillingDiscount)) return false;
    }
    return true;
  }

  deleteBillingOption = (scan_name, index) => {
    this.setErrorMsg(false, '');
    const billingList = this.state.billingList;
    const item_exists = billingList.some((item) =>
      item.scan_name === scan_name
    );
    if (item_exists) {
      billingList.splice(index, 1);
      this.setState({
        billingList
      });
    }
  }

  addBillingDetails = () => {
    this.setErrorMsg(false, '');
    const BillingOpt = this.state.selScanopt;
    const discount = this.discount.value;
    const item_exists = this.state.billingList.some((item) =>
      item.scan_name === BillingOpt.medical_billing
    );
    if (!item_exists) {
      const validDiscount = this.validateDiscount(discount, BillingOpt.max_discount, BillingOpt.amount);
      if (validDiscount) {
        const billing = {
          'scan_name': BillingOpt.medical_billing,
          'scan_amount': BillingOpt.amount,
          'discount': discount,
          'total_amount': BillingOpt.amount - discount
        };
        const billingList = this.state.billingList;
        billingList.push(billing)
        this.setState({
          billingList
        });
      } else {
        this.setErrorMsg(true, 'Please enter valid discount amount');
      }
    }
    else {
      this.setErrorMsg(true, 'already scan details added');
    }
  }

  addPatientDetails = (e) => {
    e.preventDefault();
    this.setErrorMsg(false, '');
    const patientDetails = {
      title: this.state.patient.title,
      name: this.patientName.value,
      gender: this.state.patient.gender,
      dob: this.patientDOB.value,
      age: this.state.patient.age,
      appointment_date: this.patientAppDate.value,
      phone: this.phoneNo.value,
      street_addr1: this.streetAdd1.value,
      street_addr2: this.streetAdd2.value || '',
      city: this.city.value,
      state: this.stateVal.value,
      zip: this.zip.value,
      country: this.country.value
    };

    if (this.state.billingList.length > 0) {
      this.HealthServices.addPatientDetails(patientDetails, (result) => {
        console.log("result", result);
        const patientId = result.id;
        let total_amt = 0;
        this.state.billingList.forEach((item) => {
          total_amt += item.total_amount;
        });
        const testDetails = {
          patient_detailId: patientId,
          total_amount: total_amt,
          balance_due: total_amt,
          paid_amount: 0,
          billing_status: "Not yet Billed",
          tests: this.state.billingList
        };
        this.addPatientTests(testDetails);
        this.setErrorMsg(false, '');
        this.setState({
          successMsg: 'Patient Details added Successfully'
        });
        this.resetState();
      });
    } else {
      this.setErrorMsg(true, 'Please add atleast one test in Billing');
    }
  }

  addPatientTests = (testDetails) => {
    this.HealthServices.addPatientTests(testDetails, (response) => {
      return true;
    });
  }

  renderScanDetails = () => {
    return (
      <div className="scanList">
        <div>
          <h4>Medical Scan Details</h4>
        </div>
        <div>
          <AutoCompleteSearch options={this.state.scanList} setScanOption={this.setScanOption} />
          <div className="scanListAmt">
            <label className="label1">Scan Amount {this.state.selScanopt.amount}</label>
            <label className="label2">Discount</label>
            <input
              type="number"
              ref={(discount) => {
                this.discount = discount;
              }}
              className="discount" />
            <input
              className="addBtn"
              type="button"
              value="Add"
              ref={(billingAction) => {
                this.billingAction = billingAction;
              }}
              onClick={this.addBillingDetails}
            />
          </div>
        </div>
        <BillingList data={this.state.billingList} deleteBillingOption={this.deleteBillingOption} />
      </div>
    );
  }

  renderPatientForm = () => {
    return (
      <div>
        <div className="patientRow">
          <div className="firstColumn">
            <label>Patient Name</label>
          </div>
          <div className="secondColumn">
            <div className="subFirstCol">
              <select
                value={this.state.patient.title}
                className="gender-title"
                onChange={(event) => this.genderChange(event, 'title')}
              >
                {
                  this.salutation.map((item) => {
                    return (<option value={item} >
                      {item}
                    </option>);
                  })
                }
              </select>
              <input
                required
                ref={(patientName) => {
                  this.patientName = patientName;
                }}
              />
            </div>
            <div className="subSecondCol">
              <label>Gender</label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={this.state.patient.gender === "Male"}
                onChange={(event) => this.genderChange(event, 'gender')}
              /> Male
          <input
                type="radio"
                name="gender"
                value="Female"
                checked={this.state.patient.gender === "Female"}
                onChange={(event) => this.genderChange(event, 'gender')}
              /> Female
              </div>
          </div>
        </div>
        <div className="patientRow">
          <div className="firstColumn">
            <label>DOB</label>
          </div>
          <div className="secondColumn">
            <div className="subFirstCol">
              <input
                type="date"
                required
                ref={(patientDOB) => {
                  this.patientDOB = patientDOB;
                }}
                onChange={(event) => { this.handleAge(event); }}
              />
            </div>
            <div className="subSecondCol">
              <label>Age</label>
              <input
                value={this.state.patient.age}
                required />
              <select
                value={this.state.patient.ageType}
                onChange={(event) => this.genderChange(event, 'title')}
              >
                {
                  this.ageType.map((item) => {
                    return (<option value={item} >
                      {item}
                    </option>);
                  })
                }
              </select>
            </div>
          </div>
        </div>
        <div className="patientRow">
          <div className="firstColumn">
            <label>Appointment Date</label>
          </div>
          <div className="secondColumn">
            <div className="subFirstCol">
              <input
                type="date"
                ref={(patientAppDate) => {
                  this.patientAppDate = patientAppDate;
                }}
                min={new Date().toISOString().split("T")[0]}
                required />
            </div>
            <div className="subSecondCol">
            <label>Phone No</label>
            <input
              ref={(phoneNo) => {
                this.phoneNo = phoneNo;
              }}
              type="tel"
              pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
              placeholder="xxx-xxx-xxxx"
              required
            />
            </div>
          </div>
        </div>
        <div className="patientRow">
          <div className="firstColumn">
            <label>Address</label>
          </div>
          <div className="secondColumn">
            <input
              ref={(streetAdd1) => {
                this.streetAdd1 = streetAdd1;
              }}
              placeholder="street Address"
              className="fullwidth"
              required />
          </div>
        </div>
        <div className="patientRow addressCol">
          <div className="secondColumn">
            <input
              ref={(streetAdd2) => {
                this.streetAdd2 = streetAdd2;
              }}
              placeholder="street Address2"
              className="fullwidth"
            />
          </div>
        </div>
        <div className="patientRow addressCol">
          <div className="secondColumn">
            <input
              ref={(city) => {
                this.city = city;
              }}
              placeholder="city"
              className="cityCol"
              required
            />
            <input
              ref={(stateVal) => {
                this.stateVal = stateVal;
              }}
              placeholder="state"
              className="stateCol"
              required
            />
          </div>
        </div>
        <div className="patientRow addressCol">
          <div className="secondColumn">
            <input
              ref={(zip) => {
                this.zip = zip;
              }}
              placeholder="zip"
              className="cityCol"
            />
            <input
              ref={(country) => {
                this.country = country;
              }}
              placeholder="country"
              className="stateCol"
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (<div>
      <h4>Patient Details</h4>
      <h5>
        {this.state.error ? (<div className="error">{this.state.errorMsg}</div>) : ''}
      </h5>
      <h5>
        {this.state.successMsg ? (<div>{this.state.successMsg}</div>) : ''}
      </h5>
      <form onSubmit={(e) => { this.addPatientDetails(e); }}>
        {this.renderPatientForm()}
        {this.renderScanDetails()}
        <div className="saveBtn">
          <input
            className="saveBtn"
            type="submit"
            value="Save"
            ref={(savePatient) => {
              this.savePatient = savePatient;
            }}
          // onClick={(e) => { this.addPatientDetails(e); }}
          />
        </div>
      </form>
    </div>)
  }

}

export default NewPatientDetails;