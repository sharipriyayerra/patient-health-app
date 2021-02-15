import React, {useState} from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import AccountCircle from '@material-ui/icons/AccountCircle';

import './Billing.scss';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#3e9aea',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

const StyledPatientTableCell = withStyles(theme => ({
  body: {
    padding: 3,
    fontSize: 12,
  },
}))(TableCell);

const useStyles = makeStyles({
  table: {
    minWidth: 450,
  },
  patientDetails: {
    minWidth: 200,
    width: 'auto',
    '&td' : {
      padding: 3
    }
  }
});

export default function Payments(props) {
  const classes = useStyles();
  const patientDetails = props.data || [];
  const transactions = ( patientDetails.patient_tests[0] && patientDetails.patient_tests[0].transactions ) ? patientDetails.patient_tests[0].transactions : [];
  console.log('rows', props.data);
  const [payableAmount, setPayableAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentTrans, setPaymentTrans] = useState(transactions);
  const [open, setOpen] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState("");
  const [alertType, setAlertType] = React.useState("error");

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (event, type) => {
    if(type == "paymentmode") {
      setPaymentMode(event.target.value);
    } else {
      setPayableAmount(event.target.value);
    }
  };

  const saveTransaction = (balAmt) => {
    console.log(payableAmount)
    let type = false;
    let msg = "";
    let paid_amount = patientDetails.patient_tests[0].paid_amount;
    let balance_due = patientDetails.patient_tests[0].balance_due;
    let till_paid = 0;
    if (paymentTrans.length == 2) {
      if (payableAmount < balAmt) {
        type = true;
        msg = "You have already completed 2 transactions. Please pay the balance amount";
      } else if(payableAmount > balAmt) {
        type = true;
        msg = "Please Pay exact balance amount";
      }
    } else if (paymentTrans.length < 2) {
      if (payableAmount < (patientDetails.patient_tests[0].total_amount * 20)/100) {
        type = "true"
        msg = "Please pay atleast 20% of the total amount per transaction";
      }
    } else if(balAmt === 0) {
      type = "true"
      msg = "you have already paid full amount, Thanks";
    }

    if(type) {
      displayMessage(true, "error", msg);
    } else {

      till_paid = Number(transactions.reduce((accum,item) => Number(accum) + Number(item.paidAmount), 0));
      paid_amount = Number(payableAmount) + Number(till_paid);
      balance_due = Number(patientDetails.patient_tests[0].total_amount) - Number(paid_amount);
      const paymentTransData = {
        "paymentDate": new Date().toISOString().split('T')[0],
        "paymentMode": paymentMode,
        "paidAmount": payableAmount,
        "cardName": "xxx",
        "cardNumber": ""
      };
      patientDetails.patient_tests[0].transactions = patientDetails.patient_tests[0].transactions || [];
      patientDetails.patient_tests[0].transactions.push(paymentTransData);
      patientDetails.patient_tests[0].paid_amount = paid_amount;
      patientDetails.patient_tests[0].balance_due = balance_due;
      props.addPaymentTransactions(patientDetails.patient_tests[0], patientDetails.patient_tests[0].id);
    }
  }

  const displayMessage = (open, severity, message) => {
    setOpen(open);
    setAlertMsg(message);
    setAlertType(severity);
  }

  const renderPaymentForm = () => {
    return(
      <div>
        <Table className={classes.patientDetails} aria-label="patient details">
        <TableBody>
          <TableRow>
            <StyledPatientTableCell>Patient Name</StyledPatientTableCell>
            <StyledPatientTableCell>{patientDetails.name}</StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Patient Id</StyledPatientTableCell>
            <StyledPatientTableCell>{patientDetails.id}</StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Age/Gender</StyledPatientTableCell>
            <StyledPatientTableCell>
              {patientDetails.age}/{patientDetails.gender}
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Total Amount</StyledPatientTableCell>
            <StyledPatientTableCell>
              {patientDetails.patient_tests[0].total_amount}
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Discount</StyledPatientTableCell>
            <StyledPatientTableCell>
              {patientDetails.name}
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Paid Amount</StyledPatientTableCell>
            <StyledPatientTableCell>
              {patientDetails.patient_tests[0].paid_amount}
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Balance</StyledPatientTableCell>
            <StyledPatientTableCell>
              {patientDetails.patient_tests[0].balance_due}
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>
              Payable Amount
            </StyledPatientTableCell>
            <StyledPatientTableCell>
            <TextField
              className={classes.margin}
              onChange={(e) => {handleInputChange(e, 'payamount'); }}
              required
            />
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>Payment Mode</StyledPatientTableCell>
            <StyledPatientTableCell>
            <TextField
              select
              value={paymentMode}
              onChange={(e) => {handleInputChange(e, 'paymentmode'); }}
              helperText="Please select your payment mode"
            >
                <MenuItem key="card" value="card">Card</MenuItem>
                <MenuItem key="cash" value="cash">cash</MenuItem>
            </TextField>
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell colSpan="2">
            <TextField
              className={classes.margin}
              placeholder="card holder's name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            </StyledPatientTableCell>
          </TableRow>
          <TableRow>
            <StyledPatientTableCell>
            <Button
              color="primary"
              variant="contained"
              className="header-buttons"
              onClick={() =>
                saveTransaction(patientDetails.patient_tests[0].balance_due)
              }
            >
              Save
            </Button>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert onClose={handleClose} severity={alertType}>
                {alertMsg}
              </Alert>
            </Snackbar>
            </StyledPatientTableCell>
          </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div >
      <h4>Patient Billing</h4>
      <div className="payments">
      <div className="details">
        {renderPaymentForm()}
      </div>
      <div className="transactions">
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>S.No</StyledTableCell>
              <StyledTableCell align="left">Date</StyledTableCell>
              <StyledTableCell align="center">Paid Amount</StyledTableCell>
              <StyledTableCell align="center">Payment Mode</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((row, index) => (
              <StyledTableRow key={row.scan_name}>
                <StyledTableCell component="th" scope="row">
                  {index + 1}
                </StyledTableCell>
                <StyledTableCell align="left">{row.paymentDate}</StyledTableCell>
                <StyledTableCell align="center">{row.paidAmount}</StyledTableCell>
                <StyledTableCell align="center">{row.paymentMode}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
    </div>
    </div>
  );
}