import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import NewPatientDetails from './components/NewPateintDetails/NewPatientDetails';
import PatientBillingTransactions from './components/PatientBilling/PatientBillingTransactions';

export default function HealthLanding() {
  const [formType, setFormType] = useState('Billing');

  const renderForm = (type) => {
    setFormType(type);
  }

  const renderLandingPage = () => {
    return (<div className="App-header">
      <Button
        color="primary"
        variant="contained"
        className="header-buttons"
        onClick={() =>
          renderForm('Patient')
        }
      >
        New Patient Details
      </Button>
      <Button
        color="primary"
        variant="contained"
        className="header-buttons"
        onClick={() =>
          renderForm('Billing')
        }
      >
        Patient Billing Transactions
      </Button>
    </div>);
  }

  let Preview = '';

  if (formType === 'Patient') {
    Preview = (<NewPatientDetails />);
  } else if (formType === 'Billing') {
    Preview = (<PatientBillingTransactions />);
  }

  return (
    <div>
      {renderLandingPage()}
      <div className="container">{Preview}</div>
    </div >
  );
}